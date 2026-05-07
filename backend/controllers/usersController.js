const { query } = require('../services/db');
const { hashPassword, comparePassword } = require('../services/authService');
const { mapUser } = require('../utils/mappers');

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Un usuario solo puede modificarse a si mismo (o un admin a cualquiera)
    if (req.user.id !== id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No puedes modificar a otro usuario.' });
    }

    const {
      nombres, alias, telefono, telefonoSinpe, direccion,
      totalIngresos, propiedadesCapturadas, propiedadesGestionadas, propiedadesVendidas,
    } = req.body;

    await query(
      `UPDATE users SET
         nombres             = COALESCE(?, nombres),
         alias               = COALESCE(?, alias),
         telefono            = COALESCE(?, telefono),
         telefonoSinpe       = COALESCE(?, telefonoSinpe),
         direccion           = COALESCE(?, direccion),
         totalIngresos       = COALESCE(?, totalIngresos),
         propiedadesCapturadas   = COALESCE(?, propiedadesCapturadas),
         propiedadesGestionadas  = COALESCE(?, propiedadesGestionadas),
         propiedadesVendidas     = COALESCE(?, propiedadesVendidas)
       WHERE id = ?`,
      [
        nombres ?? null, alias ?? null, telefono ?? null, telefonoSinpe ?? null,
        direccion ?? null, totalIngresos ?? null, propiedadesCapturadas ?? null,
        propiedadesGestionadas ?? null, propiedadesVendidas ?? null, id,
      ],
    );

    const [rows] = await query('SELECT * FROM users WHERE id = ?', [id]);
    res.json(mapUser(rows[0]));
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ error: err.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.id !== id) {
      return res.status(403).json({ error: 'Solo puedes cambiar tu propia contraseña.' });
    }

    const { currentPassword, newPassword } = req.body;

    const [rows] = await query('SELECT id, password FROM users WHERE id = ?', [id]);
    if (!rows.length) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    const user = rows[0];
    const currentPasswordOk = await comparePassword(currentPassword, user.password);
    if (!currentPasswordOk) {
      return res.status(400).json({ error: 'La contraseña actual es incorrecta.' });
    }

    const newPasswordHash = await hashPassword(newPassword);

    await query('UPDATE users SET password = ? WHERE id = ?', [newPasswordHash, id]);

    res.json({ ok: true, message: 'Contraseña actualizada correctamente.' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ error: err.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.id !== id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No puedes eliminar a otro usuario.' });
    }

    const [rows] = await query('SELECT id FROM users WHERE id = ?', [id]);
    if (!rows.length) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    // Se elimina en orden para respetar llaves foraneas existentes.
    await query('DELETE FROM community WHERE userId = ?', [id]);
    await query('DELETE FROM properties WHERE capturedBy = ?', [id]);
    await query('DELETE FROM users WHERE id = ?', [id]);

    res.json({ ok: true });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { updateUser, changePassword, deleteUser };
