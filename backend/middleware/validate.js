/**
 * 
 * Si la validación falla, responde 400 con los errores formateados.
 * Si pasa, reemplaza req.body con los datos parseados.
 *
 * @param {import('zod').ZodSchema} schema
 */
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const errors = result.error.errors.map((e) => ({
      campo: e.path.join('.'),
      mensaje: e.message,
    }));
    return res.status(400).json({ error: 'Datos inválidos', detalles: errors });
  }

  req.body = result.data; // datos limpios con defaults aplicados
  next();
};

module.exports = { validate };