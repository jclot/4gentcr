const { verifyToken } = require('../services/authService');

/**
 * 
 * Si es válido, adjunta el payload decodificado a req.user y llama a next().
 * Si no, responde 401.
 */
const authenticate = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token de autenticación requerido.' });
  }

  const token = header.slice(7);

  try {
    req.user = verifyToken(token);
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido o expirado.' });
  }
};

/**
 * 
 * Usar despues de authenticate.
 * @param {...string} roles  Roles permitidos ('admin', 'agente')
 */
const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'No tienes permiso para realizar esta acción.' });
  }
  next();
};

module.exports = { authenticate, authorize };