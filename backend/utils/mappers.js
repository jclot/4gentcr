/** Convierte 0/1 de MySQL a booleano */
const boolField = (val) => val === 1 || val === true;

const mapUser = (row) => ({
  id: row.id,
  nombres: row.nombres,
  correo: row.correo,
  cedula: row.cedula,
  telefono: row.telefono,
  telefonoSinpe: row.telefonoSinpe,
  alias: row.alias,
  // ⚠️  Nunca enviamos el hash de contraseña al cliente
  direccion: row.direccion,
  role: row.role,
  avatar: row.avatar || '',
  totalIngresos: row.totalIngresos || 0,
  propiedadesCapturadas: row.propiedadesCapturadas || 0,
  propiedadesGestionadas: row.propiedadesGestionadas || 0,
  propiedadesVendidas: row.propiedadesVendidas || 0,
  createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt,
});

const mapProperty = (row) => ({
  id: row.id,
  capturedBy: row.capturedBy,
  tipo: row.tipo,
  status: row.status,
  telefono: row.telefono,
  fotos: [],
  lat: parseFloat(row.lat),
  lng: parseFloat(row.lng),
  provincia: row.provincia,
  canton: row.canton,
  distrito: row.distrito,
  descripcion: row.descripcion || '',
  precioAproximado: row.precioAproximado || 0,
  esDuplicada: boolField(row.esDuplicada),
  esDeAgencia: boolField(row.esDeAgencia),
  exclusividad: boolField(row.exclusividad),
  ingreso: row.ingreso || 0,
  createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt,
  updatedAt: row.updatedAt instanceof Date ? row.updatedAt.toISOString() : row.updatedAt,
  notas: row.notas || '',
});

const mapPost = (row) => ({
  id: row.id,
  userId: row.userId,
  userName: row.userName,
  userAvatar: row.userAvatar || '',
  mensaje: row.mensaje,
  likes: row.likes || 0,
  createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt,
});

module.exports = { mapUser, mapProperty, mapPost };