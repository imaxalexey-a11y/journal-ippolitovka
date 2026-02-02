const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = process.env.DB_PATH || './database.sqlite';
const db = new Database(dbPath);

// Включаем WAL mode для лучшей производительности
db.pragma('journal_mode = WAL');

// Создание таблиц
function initDatabase() {
  // Таблица пользователей
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      full_name TEXT NOT NULL,
      position TEXT,
      department TEXT,
      is_admin INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Таблица кодов авторизации
  db.exec(`
    CREATE TABLE IF NOT EXISTS auth_codes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      code TEXT NOT NULL,
      expires_at DATETIME NOT NULL,
      used INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Таблица групп студентов
  db.exec(`
    CREATE TABLE IF NOT EXISTS student_groups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id)
    )
  `);

  // Таблица студентов
  db.exec(`
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      group_id INTEGER NOT NULL,
      full_name TEXT NOT NULL,
      order_index INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (group_id) REFERENCES student_groups(id) ON DELETE CASCADE
    )
  `);

  // Таблица журналов посещаемости
  db.exec(`
    CREATE TABLE IF NOT EXISTS attendance_journals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      group_id INTEGER NOT NULL,
      month INTEGER NOT NULL,
      year INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (group_id) REFERENCES student_groups(id) ON DELETE CASCADE,
      UNIQUE(user_id, group_id, month, year)
    )
  `);

  // Таблица записей посещаемости
  db.exec(`
    CREATE TABLE IF NOT EXISTS attendance_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      journal_id INTEGER NOT NULL,
      student_id INTEGER NOT NULL,
      day INTEGER NOT NULL,
      status TEXT CHECK(status IN ('present', 'absent', 'late', 'excused', '')),
      note TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (journal_id) REFERENCES attendance_journals(id) ON DELETE CASCADE,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
      UNIQUE(journal_id, student_id, day)
    )
  `);

  // Таблица рабочих программ
  db.exec(`
    CREATE TABLE IF NOT EXISTS work_programs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      journal_id INTEGER NOT NULL,
      day INTEGER NOT NULL,
      topic TEXT,
      homework TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (journal_id) REFERENCES attendance_journals(id) ON DELETE CASCADE,
      UNIQUE(journal_id, day)
    )
  `);

  // Создаем администратора по умолчанию
  const adminEmail = process.env.ADMIN_EMAIL || 'it_admin@ippolitovka.ru';
  const checkAdmin = db.prepare('SELECT id FROM users WHERE email = ?');
  const existingAdmin = checkAdmin.get(adminEmail);

  if (!existingAdmin) {
    const insertAdmin = db.prepare(`
      INSERT INTO users (email, full_name, position, department, is_admin)
      VALUES (?, ?, ?, ?, 1)
    `);
    insertAdmin.run(adminEmail, 'Администратор IT', 'IT Administrator', 'IT отдел');
    console.log('Администратор создан:', adminEmail);
  }

  console.log('База данных инициализирована');
}

// Функции для работы с пользователями
const userQueries = {
  findByEmail: db.prepare('SELECT * FROM users WHERE email = ?'),
  findById: db.prepare('SELECT * FROM users WHERE id = ?'),
  getAll: db.prepare('SELECT * FROM users ORDER BY full_name'),
  create: db.prepare(`
    INSERT INTO users (email, full_name, position, department, is_admin)
    VALUES (?, ?, ?, ?, ?)
  `),
  update: db.prepare(`
    UPDATE users 
    SET full_name = ?, position = ?, department = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `),
  delete: db.prepare('DELETE FROM users WHERE id = ?'),
};

// Функции для кодов авторизации
const authCodeQueries = {
  create: db.prepare(`
    INSERT INTO auth_codes (email, code, expires_at)
    VALUES (?, ?, datetime('now', '+10 minutes'))
  `),
  findValid: db.prepare(`
    SELECT * FROM auth_codes 
    WHERE email = ? AND code = ? AND used = 0 AND expires_at > datetime('now')
    ORDER BY created_at DESC LIMIT 1
  `),
  markUsed: db.prepare('UPDATE auth_codes SET used = 1 WHERE id = ?'),
  cleanup: db.prepare(`DELETE FROM auth_codes WHERE expires_at < datetime('now', '-1 day')`),
};

// Функции для групп
const groupQueries = {
  getAll: db.prepare('SELECT * FROM student_groups ORDER BY name'),
  getById: db.prepare('SELECT * FROM student_groups WHERE id = ?'),
  create: db.prepare('INSERT INTO student_groups (name, created_by) VALUES (?, ?)'),
  update: db.prepare('UPDATE student_groups SET name = ? WHERE id = ?'),
  delete: db.prepare('DELETE FROM student_groups WHERE id = ?'),
};

// Функции для студентов
const studentQueries = {
  getByGroup: db.prepare('SELECT * FROM students WHERE group_id = ? ORDER BY order_index, full_name'),
  create: db.prepare('INSERT INTO students (group_id, full_name, order_index) VALUES (?, ?, ?)'),
  update: db.prepare('UPDATE students SET full_name = ?, order_index = ? WHERE id = ?'),
  delete: db.prepare('DELETE FROM students WHERE id = ?'),
};

// Функции для журналов
const journalQueries = {
  findOrCreate: db.prepare(`
    INSERT OR IGNORE INTO attendance_journals (user_id, group_id, month, year)
    VALUES (?, ?, ?, ?)
  `),
  getByUserAndDate: db.prepare(`
    SELECT * FROM attendance_journals 
    WHERE user_id = ? AND group_id = ? AND month = ? AND year = ?
  `),
  getByUser: db.prepare(`
    SELECT aj.*, sg.name as group_name
    FROM attendance_journals aj
    JOIN student_groups sg ON aj.group_id = sg.id
    WHERE aj.user_id = ?
    ORDER BY aj.year DESC, aj.month DESC
  `),
};

// Функции для посещаемости
const attendanceQueries = {
  upsert: db.prepare(`
    INSERT INTO attendance_records (journal_id, student_id, day, status, note)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(journal_id, student_id, day) 
    DO UPDATE SET status = ?, note = ?, updated_at = CURRENT_TIMESTAMP
  `),
  getByJournal: db.prepare('SELECT * FROM attendance_records WHERE journal_id = ?'),
};

// Функции для рабочих программ
const programQueries = {
  upsert: db.prepare(`
    INSERT INTO work_programs (journal_id, day, topic, homework)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(journal_id, day)
    DO UPDATE SET topic = ?, homework = ?, updated_at = CURRENT_TIMESTAMP
  `),
  getByJournal: db.prepare('SELECT * FROM work_programs WHERE journal_id = ?'),
};

module.exports = {
  db,
  initDatabase,
  userQueries,
  authCodeQueries,
  groupQueries,
  studentQueries,
  journalQueries,
  attendanceQueries,
  programQueries,
};
