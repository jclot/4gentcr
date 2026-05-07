const { query } = require('../services/db');
const { hashPassword, comparePassword, signToken } = require('../services/authService');
const { mapUser } = require('../utils/mappers');

const login = async (req, res) => {
  try {
    const { correo, password } = req.body;

    const [rows] = await query(
      'SELECT * FROM users WHERE LOWER(correo) = LOWER(?)',
      [correo],
    );

    if (!rows.length) {
      return res.status(401).json({ error: 'Credenciales incorrectas.' });
    }

    const user = rows[0];
    const passwordOk = await comparePassword(password, user.password);

    if (!passwordOk) {
      return res.status(401).json({ error: 'Credenciales incorrectas.' });
    }

    const token = signToken({ id: user.id, role: user.role });

    res.json({ token, user: mapUser(user) });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: err.message });
  }
};

const register = async (req, res) => {
  try {
    const {
      id, nombres, correo, cedula, telefono, telefonoSinpe,
      alias, password, direccion, role, avatar, createdAt,
    } = req.body;

    // Verificar que el correo no este registrado
    const [existing] = await query(
      'SELECT id FROM users WHERE LOWER(correo) = LOWER(?)',
      [correo],
    );
    if (existing.length) {
      return res.status(409).json({ error: 'Este correo ya está registrado.' });
    }

    const passwordHash = await hashPassword(password);
    const now = createdAt ?? new Date().toISOString();

    await query(
      `INSERT INTO users
         (id, nombres, correo, cedula, telefono, telefonoSinpe, alias, password,
          direccion, role, avatar, totalIngresos, propiedadesCapturadas,
          propiedadesGestionadas, propiedadesVendidas, createdAt)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,0,0,0,0,?)`,
      [id, nombres, correo, cedula, telefono, telefonoSinpe ?? '',
        alias, passwordHash, direccion ?? '', role, avatar ?? '', now],
    );

    const [rows] = await query('SELECT * FROM users WHERE id = ?', [id]);
    const token = signToken({ id: rows[0].id, role: rows[0].role });

    res.status(201).json({ token, user: mapUser(rows[0]) });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { login, register };