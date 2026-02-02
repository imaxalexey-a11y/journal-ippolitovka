require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');

const { 
  initDatabase, 
  userQueries, 
  authCodeQueries, 
  groupQueries,
  studentQueries,
  journalQueries,
  attendanceQueries,
  programQueries,
  db
} = require('./database');
const { generateCode, sendAuthCode } = require('./email');
const { authenticateToken, requireAdmin, isAllowedDomain } = require('./middleware');

const app = express();
const PORT = process.env.PORT || 3001;

// Инициализация базы данных
initDatabase();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting для защиты от брутфорса
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 5, // максимум 5 запросов
  message: 'Слишком много попыток авторизации. Попробуйте позже.',
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

app.use('/api/', generalLimiter);

// ======================
// AUTH ROUTES
// ======================

/**
 * Отправка кода авторизации
 */
app.post('/api/auth/send-code', authLimiter, [
  body('email').isEmail().normalizeEmail(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email } = req.body;

  // Проверка домена
  if (!isAllowedDomain(email)) {
    return res.status(403).json({ 
      error: `Доступ разрешен только для email с доменом @${process.env.ALLOWED_DOMAIN}` 
    });
  }

  try {
    // Генерация кода
    const code = generateCode();
    
    // Сохранение кода в БД
    authCodeQueries.create.run(email, code);
    
    // Отправка кода на email
    const result = await sendAuthCode(email, code);
    
    if (result.success) {
      res.json({ 
        message: 'Код отправлен на email',
        email: email 
      });
    } else {
      res.status(500).json({ error: 'Ошибка отправки кода' });
    }
  } catch (error) {
    console.error('Ошибка при отправке кода:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

/**
 * Верификация кода и авторизация
 */
app.post('/api/auth/verify-code', authLimiter, [
  body('email').isEmail().normalizeEmail(),
  body('code').isLength({ min: 6, max: 6 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, code } = req.body;

  try {
    // Проверка кода
    const authCode = authCodeQueries.findValid.get(email, code);
    
    if (!authCode) {
      return res.status(401).json({ error: 'Неверный или истекший код' });
    }

    // Отмечаем код как использованный
    authCodeQueries.markUsed.run(authCode.id);

    // Поиск или создание пользователя
    let user = userQueries.findByEmail.get(email);
    
    if (!user) {
      // Создаем нового пользователя
      const isAdmin = email === process.env.ADMIN_EMAIL;
      const result = userQueries.create.run(
        email,
        email.split('@')[0], // временное имя из email
        '',
        '',
        isAdmin ? 1 : 0
      );
      user = userQueries.findById.get(result.lastInsertRowid);
    }

    // Генерация JWT токена
    const token = jwt.sign(
      { id: user.id, email: user.email, is_admin: user.is_admin },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        position: user.position,
        department: user.department,
        is_admin: user.is_admin,
      },
    });

    // Очистка старых кодов
    authCodeQueries.cleanup.run();
  } catch (error) {
    console.error('Ошибка при верификации кода:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

/**
 * Получение информации о текущем пользователе
 */
app.get('/api/auth/me', authenticateToken, (req, res) => {
  res.json({
    id: req.user.id,
    email: req.user.email,
    full_name: req.user.full_name,
    position: req.user.position,
    department: req.user.department,
    is_admin: req.user.is_admin,
  });
});

// ======================
// USER MANAGEMENT (Admin only)
// ======================

/**
 * Получение всех пользователей
 */
app.get('/api/users', authenticateToken, requireAdmin, (req, res) => {
  try {
    const users = userQueries.getAll.all();
    res.json(users);
  } catch (error) {
    console.error('Ошибка при получении пользователей:', error);
    res.status(500).json({ error: 'Ошибка при получении пользователей' });
  }
});

/**
 * Создание пользователя
 */
app.post('/api/users', authenticateToken, requireAdmin, [
  body('email').isEmail().normalizeEmail(),
  body('full_name').trim().notEmpty(),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, full_name, position, department } = req.body;

  // Проверка домена
  if (!isAllowedDomain(email)) {
    return res.status(403).json({ 
      error: `Доступ разрешен только для email с доменом @${process.env.ALLOWED_DOMAIN}` 
    });
  }

  try {
    const result = userQueries.create.run(email, full_name, position || '', department || '', 0);
    const newUser = userQueries.findById.get(result.lastInsertRowid);
    res.status(201).json(newUser);
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      res.status(409).json({ error: 'Пользователь с таким email уже существует' });
    } else {
      console.error('Ошибка при создании пользователя:', error);
      res.status(500).json({ error: 'Ошибка при создании пользователя' });
    }
  }
});

/**
 * Обновление пользователя
 */
app.put('/api/users/:id', authenticateToken, requireAdmin, [
  body('full_name').trim().notEmpty(),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { full_name, position, department } = req.body;

  try {
    userQueries.update.run(full_name, position || '', department || '', id);
    const updatedUser = userQueries.findById.get(id);
    res.json(updatedUser);
  } catch (error) {
    console.error('Ошибка при обновлении пользователя:', error);
    res.status(500).json({ error: 'Ошибка при обновлении пользователя' });
  }
});

/**
 * Удаление пользователя
 */
app.delete('/api/users/:id', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;

  // Запрещаем удалять самого себя
  if (parseInt(id) === req.user.id) {
    return res.status(400).json({ error: 'Нельзя удалить собственный аккаунт' });
  }

  try {
    userQueries.delete.run(id);
    res.json({ message: 'Пользователь удален' });
  } catch (error) {
    console.error('Ошибка при удалении пользователя:', error);
    res.status(500).json({ error: 'Ошибка при удалении пользователя' });
  }
});

// ======================
// GROUPS ROUTES
// ======================

/**
 * Получение всех групп
 */
app.get('/api/groups', authenticateToken, (req, res) => {
  try {
    const groups = groupQueries.getAll.all();
    res.json(groups);
  } catch (error) {
    console.error('Ошибка при получении групп:', error);
    res.status(500).json({ error: 'Ошибка при получении групп' });
  }
});

/**
 * Создание группы
 */
app.post('/api/groups', authenticateToken, [
  body('name').trim().notEmpty(),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name } = req.body;

  try {
    const result = groupQueries.create.run(name, req.user.id);
    const newGroup = groupQueries.getById.get(result.lastInsertRowid);
    res.status(201).json(newGroup);
  } catch (error) {
    console.error('Ошибка при создании группы:', error);
    res.status(500).json({ error: 'Ошибка при создании группы' });
  }
});

/**
 * Обновление группы
 */
app.put('/api/groups/:id', authenticateToken, [
  body('name').trim().notEmpty(),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { name } = req.body;

  try {
    groupQueries.update.run(name, id);
    const updatedGroup = groupQueries.getById.get(id);
    res.json(updatedGroup);
  } catch (error) {
    console.error('Ошибка при обновлении группы:', error);
    res.status(500).json({ error: 'Ошибка при обновлении группы' });
  }
});

/**
 * Удаление группы
 */
app.delete('/api/groups/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  try {
    groupQueries.delete.run(id);
    res.json({ message: 'Группа удалена' });
  } catch (error) {
    console.error('Ошибка при удалении группы:', error);
    res.status(500).json({ error: 'Ошибка при удалении группы' });
  }
});

// ======================
// STUDENTS ROUTES
// ======================

/**
 * Получение студентов группы
 */
app.get('/api/groups/:groupId/students', authenticateToken, (req, res) => {
  const { groupId } = req.params;

  try {
    const students = studentQueries.getByGroup.all(groupId);
    res.json(students);
  } catch (error) {
    console.error('Ошибка при получении студентов:', error);
    res.status(500).json({ error: 'Ошибка при получении студентов' });
  }
});

/**
 * Добавление студента
 */
app.post('/api/groups/:groupId/students', authenticateToken, [
  body('full_name').trim().notEmpty(),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { groupId } = req.params;
  const { full_name, order_index } = req.body;

  try {
    const result = studentQueries.create.run(groupId, full_name, order_index || 0);
    const student = db.prepare('SELECT * FROM students WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(student);
  } catch (error) {
    console.error('Ошибка при добавлении студента:', error);
    res.status(500).json({ error: 'Ошибка при добавлении студента' });
  }
});

/**
 * Обновление студента
 */
app.put('/api/students/:id', authenticateToken, [
  body('full_name').trim().notEmpty(),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { full_name, order_index } = req.body;

  try {
    studentQueries.update.run(full_name, order_index || 0, id);
    const student = db.prepare('SELECT * FROM students WHERE id = ?').get(id);
    res.json(student);
  } catch (error) {
    console.error('Ошибка при обновлении студента:', error);
    res.status(500).json({ error: 'Ошибка при обновлении студента' });
  }
});

/**
 * Удаление студента
 */
app.delete('/api/students/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  try {
    studentQueries.delete.run(id);
    res.json({ message: 'Студент удален' });
  } catch (error) {
    console.error('Ошибка при удалении студента:', error);
    res.status(500).json({ error: 'Ошибка при удалении студента' });
  }
});

// ======================
// JOURNAL ROUTES
// ======================

/**
 * Получение журналов пользователя
 */
app.get('/api/journals', authenticateToken, (req, res) => {
  try {
    const journals = journalQueries.getByUser.all(req.user.id);
    res.json(journals);
  } catch (error) {
    console.error('Ошибка при получении журналов:', error);
    res.status(500).json({ error: 'Ошибка при получении журналов' });
  }
});

/**
 * Получение или создание журнала
 */
app.post('/api/journals', authenticateToken, [
  body('group_id').isInt(),
  body('month').isInt({ min: 1, max: 12 }),
  body('year').isInt({ min: 2020, max: 2100 }),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { group_id, month, year } = req.body;

  try {
    // Создаем или игнорируем, если существует
    journalQueries.findOrCreate.run(req.user.id, group_id, month, year);
    
    // Получаем журнал
    const journal = journalQueries.getByUserAndDate.get(req.user.id, group_id, month, year);
    
    // Получаем студентов группы
    const students = studentQueries.getByGroup.all(group_id);
    
    // Получаем записи посещаемости
    const attendance = attendanceQueries.getByJournal.all(journal.id);
    
    // Получаем рабочие программы
    const programs = programQueries.getByJournal.all(journal.id);
    
    res.json({
      journal,
      students,
      attendance,
      programs,
    });
  } catch (error) {
    console.error('Ошибка при работе с журналом:', error);
    res.status(500).json({ error: 'Ошибка при работе с журналом' });
  }
});

/**
 * Обновление посещаемости
 */
app.post('/api/attendance', authenticateToken, [
  body('journal_id').isInt(),
  body('student_id').isInt(),
  body('day').isInt({ min: 1, max: 31 }),
  body('status').isIn(['present', 'absent', 'late', 'excused', '']),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { journal_id, student_id, day, status, note } = req.body;

  try {
    attendanceQueries.upsert.run(
      journal_id, student_id, day, status, note || '',
      status, note || ''
    );
    
    res.json({ message: 'Посещаемость обновлена' });
  } catch (error) {
    console.error('Ошибка при обновлении посещаемости:', error);
    res.status(500).json({ error: 'Ошибка при обновлении посещаемости' });
  }
});

/**
 * Обновление рабочей программы
 */
app.post('/api/programs', authenticateToken, [
  body('journal_id').isInt(),
  body('day').isInt({ min: 1, max: 31 }),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { journal_id, day, topic, homework } = req.body;

  try {
    programQueries.upsert.run(
      journal_id, day, topic || '', homework || '',
      topic || '', homework || ''
    );
    
    res.json({ message: 'Рабочая программа обновлена' });
  } catch (error) {
    console.error('Ошибка при обновлении программы:', error);
    res.status(500).json({ error: 'Ошибка при обновлении программы' });
  }
});

// Статические файлы (после всех API роутов)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Что-то пошло не так!' });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
  console.log(`Режим: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM получен, закрываем базу данных...');
  db.close();
  process.exit(0);
});
