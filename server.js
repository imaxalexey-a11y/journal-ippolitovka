
require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const USERS_FILE = path.join(__dirname, 'users.json');

app.use(cors());
app.use(bodyParser.json());

// Инициализация базы пользователей
if (!fs.existsSync(USERS_FILE)) {
  const initialAdmin = {
    id: 'admin-1',
    email: process.env.ADMIN_EMAIL || 'it_admin@ippolitovka.ru',
    fullName: 'Системный администратор',
    position: 'IT отдел',
    department: 'Управление цифровизации',
    role: 'admin'
  };
  fs.writeFileSync(USERS_FILE, JSON.stringify([initialAdmin], null, 2));
}

const getUsers = () => JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
const saveUsers = (users) => fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));

const otpStore = new Map();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'mail.ippolitovka.ru',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  tls: { rejectUnauthorized: false }
});

app.post('/api/auth/request-code', async (req, res) => {
  const { email } = req.body;
  const domain = process.env.ALLOWED_DOMAIN || 'ippolitovka.ru';
  
  if (!email || !email.endsWith(`@${domain}`)) {
    return res.status(403).json({ error: `Доступ разрешен только для домена ${domain}` });
  }

  const users = getUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  
  if (!user) {
    return res.status(404).json({ error: 'Пользователь не найден. Обратитесь к IT-администратору.' });
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(email.toLowerCase(), { code, expires: Date.now() + 600000 });

  try {
    await transporter.sendMail({
      from: `"Электронный Журнал" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Код доступа: ' + code,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #2563eb;">Вход в электронный журнал</h2>
          <p>Ваш код подтверждения:</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1e293b; margin: 20px 0;">${code}</div>
          <p style="color: #64748b; font-size: 12px;">Код действителен 10 минут.</p>
        </div>
      `
    });
    res.json({ success: true });
  } catch (error) {
    console.error('SMTP Error:', error);
    res.status(500).json({ error: 'Ошибка почтового сервера. Обратитесь в IT-отдел.' });
  }
});

app.post('/api/auth/verify-code', (req, res) => {
  const { email, code } = req.body;
  const normalizedEmail = email.toLowerCase();
  const stored = otpStore.get(normalizedEmail);

  if (stored && stored.code === code && stored.expires > Date.now()) {
    otpStore.delete(normalizedEmail);
    const users = getUsers();
    const user = users.find(u => u.email.toLowerCase() === normalizedEmail);
    res.json({ success: true, user });
  } else {
    res.status(401).json({ error: 'Неверный или просроченный код' });
  }
});

app.get('/api/admin/users', (req, res) => {
  const { requesterEmail } = req.query;
  if (requesterEmail !== process.env.ADMIN_EMAIL) return res.status(403).send('Forbidden');
  res.json(getUsers());
});

app.post('/api/admin/users', (req, res) => {
  const { requesterEmail, user } = req.body;
  if (requesterEmail !== process.env.ADMIN_EMAIL) return res.status(403).send('Forbidden');

  let users = getUsers();
  if (user.id) {
    users = users.map(u => u.id === user.id ? { ...u, ...user } : u);
  } else {
    const newUser = { ...user, id: Date.now().toString() };
    users.push(newUser);
  }
  saveUsers(users);
  res.json({ success: true });
});

app.delete('/api/admin/users/:id', (req, res) => {
  const { requesterEmail } = req.query;
  if (requesterEmail !== process.env.ADMIN_EMAIL) return res.status(403).send('Forbidden');
  
  let users = getUsers();
  users = users.filter(u => u.id !== req.params.id);
  saveUsers(users);
  res.json({ success: true });
});

app.use(express.static(path.join(__dirname, '.')));

app.listen(PORT, () => {
  console.log(`Backend is running on port ${PORT}`);
});
