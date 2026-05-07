const { z } = require('zod');

// Auth 
const loginSchema = z.object({
  correo: z.string().email('Correo inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

const registerSchema = z.object({
  id: z.string().min(1),
  nombres: z.string().min(2, 'Nombre demasiado corto'),
  correo: z.string().email('Correo inválido'),
  cedula: z.string().refine(
    v => v.replace(/\D/g, '').length >= 9,
    'La cédula debe tener al menos 9 dígitos',
  ),
  telefono: z.string().refine(
    v => v.replace(/\D/g, '').length >= 8,
    'El teléfono debe tener al menos 8 dígitos',
  ),
  telefonoSinpe: z.string().optional().default(''),
  alias: z.string().min(2, 'Alias demasiado corto'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  direccion: z.string().optional().default(''),
  role: z.enum(['scout', 'admin']),
  avatar: z.string().optional().default(''),
  createdAt: z.string().optional(),
});

// Users 
const updateUserSchema = z.object({
  nombres: z.string().min(2).optional(),
  alias: z.string().min(2).optional(),
  telefono: z.string().refine(
    v => v.replace(/\D/g, '').length >= 8,
    'El teléfono debe tener al menos 8 dígitos',
  ).optional(),
  telefonoSinpe: z.string().optional(),
  direccion: z.string().optional(),
  avatar: z.string().optional(),
  totalIngresos: z.number().nonnegative().optional(),
  propiedadesCapturadas: z.number().int().nonnegative().optional(),
  propiedadesGestionadas: z.number().int().nonnegative().optional(),
  propiedadesVendidas: z.number().int().nonnegative().optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'La contraseña actual es obligatoria'),
  newPassword: z.string().min(6, 'La nueva contraseña debe tener al menos 6 caracteres'),
});

// Properties 
const propertyStatusEnum = z.enum([
  'nueva',
  'en_negociacion',
  'contrato_cerrado',
  'invalida',
]);

const addPropertySchema = z.object({
  id: z.string().min(1),
  capturedBy: z.string().min(1),
  tipo: z.enum(['Casa', 'Terreno', 'Comercial', 'Apartamento', 'Finca']),
  status: propertyStatusEnum,
  telefono: z.string().refine(
    v => v.replace(/\D/g, '').length >= 8,
    'El teléfono debe tener al menos 8 dígitos',
  ),
  lat: z.number(),
  lng: z.number(),
  provincia: z.string().min(1),
  canton: z.string().min(1),
  distrito: z.string().min(1),
  descripcion: z.string().optional().default(''),
  precioAproximado: z.number().nonnegative().optional().default(0),
  esDuplicada: z.boolean().optional().default(false),
  esDeAgencia: z.boolean(),
  exclusividad: z.boolean(),
  notas: z.string().optional().default(''),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

const updatePropertyStatusSchema = z.object({
  status: propertyStatusEnum,
  notas: z.string().optional(),
});

const updatePropertySchema = z.object({
  tipo: z.enum(['Casa', 'Terreno', 'Comercial', 'Apartamento', 'Finca']).optional(),
  status: propertyStatusEnum.optional(),
  descripcion: z.string().optional(),
  precioAproximado: z.number().nonnegative().optional(),
  notas: z.string().optional(),
});

// Community 
const addPostSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  userName: z.string().min(1),
  userAvatar: z.string().optional().default(''),
  mensaje: z.string().min(1, 'El mensaje no puede estar vacío').max(500),
  createdAt: z.string().optional(),
});

module.exports = {
  loginSchema,
  registerSchema,
  updateUserSchema,
  changePasswordSchema,
  addPropertySchema,
  updatePropertyStatusSchema,
  updatePropertySchema,
  addPostSchema,
};
