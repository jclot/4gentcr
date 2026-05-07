const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '7d';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET no definido en las variables de entorno.');
}

/** Genera un hash bcrypt de la contraseña en texto plano */
const hashPassword = (plainPassword) => bcrypt.hash(plainPassword, SALT_ROUNDS);

/** Compara una contraseña en texto plano contra su hash bcrypt */
const comparePassword = (plainPassword, hash) => bcrypt.compare(plainPassword, hash);

/**
 * Firma un JWT con el payload dado.
 * @param {{ id: string, role: string }} payload
 */
const signToken = (payload) =>
  jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

/**
 * Verifica y decodifica un JWT.
 * 
 */
const verifyToken = (token) => jwt.verify(token, JWT_SECRET);

module.exports = { hashPassword, comparePassword, signToken, verifyToken };