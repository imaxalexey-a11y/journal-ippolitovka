const nodemailer = require('nodemailer');

// Создание транспорта для отправки писем
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT || 587,
  secure: false, // true для 465, false для других портов
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false // Для самоподписанных сертификатов
  }
});

// Проверка подключения
transporter.verify(function (error, success) {
  if (error) {
    console.log('Ошибка подключения к SMTP:', error);
  } else {
    console.log('SMTP сервер готов к отправке писем');
  }
});

/**
 * Генерация случайного 6-значного кода
 */
function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Отправка кода авторизации на email
 */
async function sendAuthCode(email, code) {
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Код авторизации - Журнал посещаемости',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Код для входа в систему</h2>
        <p>Здравствуйте!</p>
        <p>Ваш код авторизации для входа в систему журнала посещаемости:</p>
        <div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
          <h1 style="color: #2196F3; margin: 0; font-size: 36px; letter-spacing: 5px;">${code}</h1>
        </div>
        <p>Код действителен в течение 10 минут.</p>
        <p style="color: #666; font-size: 12px;">Если вы не запрашивали этот код, проигнорируйте это письмо.</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="color: #999; font-size: 12px;">
          Это автоматическое письмо. Пожалуйста, не отвечайте на него.
        </p>
      </div>
    `,
    text: `Ваш код авторизации: ${code}. Код действителен в течение 10 минут.`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Письмо отправлено:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Ошибка отправки письма:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  generateCode,
  sendAuthCode,
};
