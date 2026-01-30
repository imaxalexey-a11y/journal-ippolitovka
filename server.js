
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Конфигурация SMTP Ипполитовки
const transporter = nodemailer.createTransport({
  host: 'mail.ippolitovka.ru',
  port: 465,
  secure: true, // true для 465, false для других портов
  auth: {
    user: 'no-reply@ippolitovka.ru',
    pass: 'Ipp2023!!!',
  },
});

// Проверка связи с почтовым сервером
transporter.verify((error, success) => {
  if (error) {
    console.error('Ошибка SMTP:', error);
  } else {
    console.log('Почтовый сервер готов к отправке');
  }
});

// Эндпоинт для отправки кода авторизации
app.post('/api/send-auth-code', async (req, res) => {
  const { email, code } = req.body;

  if (!email.endsWith('@ippolitovka.ru')) {
    return res.status(403).json({ error: 'Доступ запрещен' });
  }

  const mailOptions = {
    from: '"Журнал Ипполитовка" <no-reply@ippolitovka.ru>',
    to: email,
    subject: 'Код подтверждения входа',
    text: `Ваш проверочный код: ${code}`,
    html: `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee;">
        <h2 style="color: #1e1b4b;">Вход в систему Журналов</h2>
        <p>Вы запросили код для входа в электронный журнал ГМПИ им. Ипполитова-Иванова.</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4338ca; margin: 20px 0;">
          ${code}
        </div>
        <p style="color: #666; font-size: 12px;">Если вы не запрашивали этот код, просто проигнорируйте письмо.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true });
  } catch (error) {
    console.error('Ошибка отправки:', error);
    res.status(500).json({ error: 'Ошибка сервера при отправке письма' });
  }
});

// Эндпоинт для уведомлений админа
app.post('/api/notify-admin', async (req, res) => {
  const { type, data } = req.body;

  const mailOptions = {
    from: '"Система Уведомлений" <no-reply@ippolitovka.ru>',
    to: 'it_admin@ippolitovka.ru',
    subject: type === 'NEW_USER' ? 'Регистрация нового пользователя' : 'Системное уведомление',
    html: `
      <div style="font-family: sans-serif; padding: 20px;">
        <h3 style="color: #1e1b4b;">Уведомление системы</h3>
        <p><b>Событие:</b> ${type === 'NEW_USER' ? 'Зарегистрирован новый сотрудник' : 'Обновление данных'}</p>
        <p><b>ФИО:</b> ${data.fullName}</p>
        <p><b>Email:</b> ${data.email}</p>
        <hr/>
        <p style="font-size: 11px; color: #999;">Сгенерировано автоматически порталом ippolitovka.ru</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка уведомления' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API Сервер запущен на порту ${PORT}`);
});
