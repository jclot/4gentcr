const { query } = require('../services/db');
const { calcularIngreso, checkDuplicate } = require('../services/propertyService');
const { mapProperty, mapUser } = require('../utils/mappers');

// Listar propiedades (paginado) 
const getProperties = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page ?? '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit ?? '20', 10)));
    const offset = (page - 1) * limit;

    // Filtro opcional por usuario (scouts ven solo las suyas, admins todas)
    const { userId } = req.query;

    let sql = 'SELECT * FROM properties';
    let countSql = 'SELECT COUNT(*) AS total FROM properties';
    const params = [];
    const countParams = [];

    if (userId) {
      sql += ' WHERE capturedBy = ?';
      countSql += ' WHERE capturedBy = ?';
      params.push(userId);
      countParams.push(userId);
    }

    sql += ' ORDER BY createdAt DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [[rows], [countRows]] = await Promise.all([
      query(sql, params),
      query(countSql, countParams),
    ]);

    const total = countRows[0].total;

    res.json({
      data: rows.map(mapProperty),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
      },
    });
  } catch (err) {
    console.error('Get properties error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Agregar propiedad 
const addProperty = async (req, res) => {
  try {
    const p = req.body;
    const now = new Date().toISOString();

    // 1. Verificar duplicado en el servidor
    const isDup = p.esDuplicada || (await checkDuplicate(p.lat, p.lng));

    // 2. Calcular ingreso en el backend
    const ingreso = calcularIngreso(p.status, isDup, p.esDeAgencia, p.exclusividad);

    // 3. Insertar propiedad
    await query(
      `INSERT INTO properties
         (id, capturedBy, tipo, status, telefono, lat, lng, provincia, canton,
          distrito, descripcion, precioAproximado, esDuplicada, esDeAgencia,
          exclusividad, ingreso, createdAt, updatedAt, notas)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        p.id, p.capturedBy, p.tipo, p.status, p.telefono,
        p.lat, p.lng, p.provincia, p.canton, p.distrito,
        p.descripcion, p.precioAproximado,
        isDup ? 1 : 0, p.esDeAgencia ? 1 : 0, p.exclusividad ? 1 : 0,
        ingreso, p.createdAt ?? now, p.updatedAt ?? now, p.notas,
      ],
    );

    // 4. Actualizar stats del usuario
    await query(
      `UPDATE users SET
         propiedadesCapturadas = propiedadesCapturadas + 1,
         totalIngresos         = totalIngresos + ?
       WHERE id = ?`,
      [ingreso, p.capturedBy],
    );

    // 5. Devolver propiedad Y usuario actualizados
    const [[propRows], [userRows]] = await Promise.all([
      query('SELECT * FROM properties WHERE id = ?', [p.id]),
      query('SELECT * FROM users WHERE id = ?', [p.capturedBy]),
    ]);

    res.status(201).json({
      property: mapProperty(propRows[0]),
      user: mapUser(userRows[0]),
    });
  } catch (err) {
    console.error('Add property error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Actualizar status 
const updatePropertyStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notas } = req.body;
    const now = new Date().toISOString();

    const [propRows] = await query('SELECT * FROM properties WHERE id = ?', [id]);
    if (!propRows.length) return res.status(404).json({ error: 'Propiedad no encontrada.' });

    const prop = propRows[0];
    const newIngreso = calcularIngreso(
      status,
      prop.esDuplicada === 1,
      prop.esDeAgencia === 1,
      prop.exclusividad === 1,
    );
    const incomeDiff = newIngreso - (prop.ingreso || 0);

    await query(
      'UPDATE properties SET status=?, ingreso=?, notas=COALESCE(?,notas), updatedAt=? WHERE id=?',
      [status, newIngreso, notas ?? null, now, id],
    );

    if (incomeDiff !== 0 || status === 'contrato_cerrado' || status === 'en_negociacion') {
      await query(
        `UPDATE users SET
           totalIngresos         = GREATEST(0, totalIngresos + ?),
           propiedadesVendidas   = propiedadesVendidas   + IF(? = 'contrato_cerrado' AND ? != 'contrato_cerrado', 1, 0),
           propiedadesGestionadas = propiedadesGestionadas + IF(? = 'en_negociacion'   AND ? != 'en_negociacion',   1, 0)
         WHERE id = ?`,
        [
          incomeDiff,
          status, prop.status,
          status, prop.status,
          prop.capturedBy,
        ],
      );
    }

    const [[updatedProp], [updatedUser]] = await Promise.all([
      query('SELECT * FROM properties WHERE id = ?', [id]),
      query('SELECT * FROM users WHERE id = ?', [prop.capturedBy]),
    ]);

    res.json({
      property: mapProperty(updatedProp[0]),
      user: mapUser(updatedUser[0]),
    });
  } catch (err) {
    console.error('Update status error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Editar datos de propiedad
const updateProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const p = req.body;
    const now = new Date().toISOString();

    await query(
      `UPDATE properties SET
         tipo             = COALESCE(?, tipo),
         status           = COALESCE(?, status),
         descripcion      = COALESCE(?, descripcion),
         precioAproximado = COALESCE(?, precioAproximado),
         notas            = COALESCE(?, notas),
         updatedAt        = ?
       WHERE id = ?`,
      [p.tipo ?? null, p.status ?? null, p.descripcion ?? null,
      p.precioAproximado ?? null, p.notas ?? null, now, id],
    );

    const [rows] = await query('SELECT * FROM properties WHERE id = ?', [id]);
    res.json(mapProperty(rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Eliminar propiedad 
const deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await query('SELECT capturedBy FROM properties WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).json({ error: 'Propiedad no encontrada.' });

    if (rows[0].capturedBy !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No puedes eliminar esta propiedad.' });
    }

    await query('DELETE FROM properties WHERE id = ?', [id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getProperties, addProperty, updatePropertyStatus, updateProperty, deleteProperty };