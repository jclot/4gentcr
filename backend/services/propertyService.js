const { query } = require('./db');

const DUPLICATE_THRESHOLD = 0.0003; // ~33 metros

/**
 * Calcula el ingreso de una propiedad según su estado y flags.
 *
 *
 * @param {string}  status
 * @param {boolean} esDuplicada
 * @param {boolean} esDeAgencia
 * @param {boolean} exclusividad
 * @returns {number}
 */
const calcularIngreso = (status, esDuplicada, esDeAgencia, exclusividad) => {
  if (esDuplicada || esDeAgencia) return 0;
  let total = 250;
  if (exclusividad) total += 2_000;
  if (status === 'contrato_cerrado') total += 100_000;
  return total;
};

/**
 * Verifica si existe otra propiedad en un radio cercano al punto dado.
 * @param {number} lat
 * @param {number} lng
 * @param {string} [excludeId]  
 * @returns {Promise<boolean>}
 */
const checkDuplicate = async (lat, lng, excludeId = null) => {
  const [rows] = await query(
    `SELECT id FROM properties
     WHERE ABS(lat - ?) < ? AND ABS(lng - ?) < ?
       AND (? IS NULL OR id != ?)
     LIMIT 1`,
    [lat, DUPLICATE_THRESHOLD, lng, DUPLICATE_THRESHOLD, excludeId, excludeId],
  );
  return rows.length > 0;
};

module.exports = { calcularIngreso, checkDuplicate };