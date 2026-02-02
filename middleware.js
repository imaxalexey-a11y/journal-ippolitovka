const jwt = require('jsonwebtoken');
const { userQueries } = require('./database');

/**
 * Middleware для проверки JWT токена
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Требуется авторизация' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Неверный или истекший токен' });
    }

    // Проверяем существование пользователя
    const dbUser = userQueries.findById.get(user.id);
    if (!dbUser) {
      return res.status(403).json({ error: 'Пользователь не найден' });
    }

    req.user = dbUser;
    next();
  });
}

/**
 * Middleware для проверки прав администратора
 */
function requireAdmin(req, res, next) {
  if (!req.user || !req.user.is_admin) {
    return res.status(403).json({ error: 'Требуются права администратора' });
  }
  next();
}

/**
 * Проверка домена email
 */
function isAllowedDomain(email) {
  const domain = email.split('@')[1];
  return domain === process.env.ALLOWED_DOMAIN;
}

module.exports = {
  authenticateToken,
  requireAdmin,
  isAllowedDomain,
};
