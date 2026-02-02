import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'db.json');

// Ensure data directory exists
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'));
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increased limit for full state save
app.use(express.static(path.join(__dirname, 'dist')));

// --- Database Logic (Simple JSON File) ---
const INITIAL_STATE = {
  currentUser: null,
  users: [
    {
      email: process.env.ADMIN_EMAIL || 'it_admin@ippolitovka.ru',
      name: 'IT Administrator',
      role: 'ADMIN',
      position: 'Head of IT',
      department: 'Administration'
    }
  ],
  students: [
    { id: '1', name: 'Иванов Иван' },
    { id: '2', name: 'Петров Петр' },
  ],
  attendance: {},
  workProgram: {}
};

function getDb() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(INITIAL_STATE, null, 2));
    return INITIAL_STATE;
  }
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch (e) {
    console.error("DB Parse Error, resetting", e);
    return INITIAL_STATE;
  }
}

function saveDb(data) {
  // We preserve users and strictly update other fields to avoid race conditions roughly
  // In a production app, use a real DB (Postgres/Mongo)
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// --- Auth Store (Memory) ---
const authCodes = new Map(); // email -> { code, expires }

// --- API Endpoints ---

// Get State
app.get('/api/state', (req, res) => {
  const db = getDb();
  // Don't send currentUser in the raw state, client handles session
  const { currentUser, ...publicState } = db;
  res.json(publicState);
});

// Update State (Protected logic should be here, but for MVP we trust the client's admin check)
app.post('/api/state', (req, res) => {
  const newState = req.body;
  
  // Basic Validation: Ensure we don't accidentally wipe users if client sends partial
  const currentDb = getDb();
  
  // Merge strategy: Overwrite data
  const merged = { ...currentDb, ...newState };
  
  // Restore server-side authoritative users if needed, or trust client admin panel?
  // Trusting client for this prototype.
  saveDb(merged);
  res.json({ success: true });
});

// Send Code
app.post('/api/auth/send-code', async (req, res) => {
  const { email } = req.body;
  
  if (!email || !email.endsWith('@ippolitovka.ru')) {
    return res.status(400).json({ error: 'Доступ разрешен только для домена @ippolitovka.ru' });
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  authCodes.set(email, { code, expires: Date.now() + 300000 }); // 5 min

  // SMTP Configuration
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'mail.ippolitovka.ru',
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false // Sometimes needed for self-signed certs or specific VPS configs
    }
  });

  try {
    await transporter.sendMail({
      from: `"Journal Ippolitovka" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Код подтверждения',
      text: `Ваш код для входа: ${code}`,
      html: `<b>Ваш код для входа:</b> <h1>${code}</h1>`
    });
    console.log(`Code sent to ${email}`);
    res.json({ success: true });
  } catch (error) {
    console.error('SMTP Error:', error);
    res.status(500).json({ error: 'Ошибка отправки письма. Проверьте настройки SMTP.' });
  }
});

// Verify Code
app.post('/api/auth/verify', (req, res) => {
  const { email, code } = req.body;
  const record = authCodes.get(email);

  if (!record || record.code !== code || Date.now() > record.expires) {
    return res.status(400).json({ error: 'Неверный или устаревший код' });
  }

  authCodes.delete(email); // Invalidate code

  const db = getDb();
  let user = db.users.find(u => u.email === email);

  if (!user) {
    // Auto-register logic
    const adminEmail = process.env.ADMIN_EMAIL || 'it_admin@ippolitovka.ru';
    user = {
      email,
      name: email.split('@')[0],
      role: email === adminEmail ? 'ADMIN' : 'TEACHER',
      position: 'Преподаватель',
      department: 'Общая'
    };
    db.users.push(user);
    saveDb(db);
  }

  res.json({ user });
});

// Fallback for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});