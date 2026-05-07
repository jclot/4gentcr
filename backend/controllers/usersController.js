const { query } = require('../services/db');
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

module.exports = { updateUser };