-- Referencia de conexión:
-- jdbc:mysql://3KctLc2XPTMdNf8.root:UNIQIuVzpjCSL2Wu@gateway01.us-east-1.prod.aws.tidbcloud.com:4000/sys?sslMode=VERIFY_IDENTITY

USE VirtualAgent;

-- Tabla de usuarios
CREATE TABLE users (
  id VARCHAR(16) PRIMARY KEY,
  nombres VARCHAR(100) NOT NULL,
  correo VARCHAR(100) NOT NULL UNIQUE,
  cedula VARCHAR(20) NOT NULL,
  telefono VARCHAR(20) NOT NULL,
  telefonoSinpe VARCHAR(20) NOT NULL,
  alias VARCHAR(50) NOT NULL,
  password VARCHAR(255) NOT NULL,
  direccion VARCHAR(255) NOT NULL,
  role ENUM('scout','admin') NOT NULL,
  avatar VARCHAR(255),
  totalIngresos INT DEFAULT 0,
  propiedadesCapturadas INT DEFAULT 0,
  propiedadesGestionadas INT DEFAULT 0,
  propiedadesVendidas INT DEFAULT 0,
  createdAt DATETIME NOT NULL
);

-- Tabla de propiedades
CREATE TABLE properties (
  id VARCHAR(16) PRIMARY KEY,
  capturedBy VARCHAR(16) NOT NULL,
  tipo ENUM('Casa','Terreno','Comercial','Apartamento','Finca') NOT NULL,
  status ENUM('nueva','en_negociacion','contrato_cerrado','invalida') NOT NULL,
  telefono VARCHAR(20) NOT NULL,
  lat DECIMAL(10,7) NOT NULL,
  lng DECIMAL(10,7) NOT NULL,
  provincia VARCHAR(50) NOT NULL,
  canton VARCHAR(50) NOT NULL,
  distrito VARCHAR(50) NOT NULL,
  descripcion TEXT,
  precioAproximado BIGINT DEFAULT 0,
  esDuplicada BOOLEAN DEFAULT FALSE,
  esDeAgencia BOOLEAN DEFAULT FALSE,
  exclusividad BOOLEAN DEFAULT FALSE,
  ingreso INT DEFAULT 0,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  notas TEXT,
  FOREIGN KEY (capturedBy) REFERENCES users(id)
);

-- Tabla de publicaciones de comunidad
CREATE TABLE community (
  id VARCHAR(16) PRIMARY KEY,
  userId VARCHAR(16) NOT NULL,
  userName VARCHAR(100) NOT NULL,
  userAvatar VARCHAR(255),
  mensaje TEXT NOT NULL,
  likes INT DEFAULT 0,
  createdAt DATETIME NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id)
);

-- Inserts mínimos de usuarios
INSERT INTO users (id, nombres, correo, cedula, telefono, telefonoSinpe, alias, password, direccion, role, avatar, totalIngresos, propiedadesCapturadas, propiedadesGestionadas, propiedadesVendidas, createdAt) VALUES
  ('u1', 'Carlos Ramírez Solís', 'carlos@virtualagent.cr', '1-0852-0341', '8888-1234', '8888-1234', 'carlosR', '123456', 'Curridabat, San José', 'scout', 'https://i.pravatar.cc/150?u=u1', 104250, 8, 2, 1, '2024-11-01 08:00:00'),
  ('u2', 'Andrea Vargas Mora', 'andrea@virtualagent.cr', '2-0614-0889', '7777-5678', '7777-5678', 'andreaV', '123456', 'San Pedro, Montes de Oca', 'scout', 'https://i.pravatar.cc/150?u=u2', 52500, 12, 1, 0, '2024-10-15 10:00:00'),
  ('admin1', 'Administrador Virtual Agent', 'admin@virtualagent.cr', '0-0000-0001', '2222-0000', '2222-0000', 'admin', 'admin123', 'San José Centro', 'admin', 'https://i.pravatar.cc/150?u=admin1', 0, 0, 0, 0, '2024-01-01 00:00:00');

-- Otros scouts de ejemplo
INSERT INTO users (id, nombres, correo, cedula, telefono, telefonoSinpe, alias, password, direccion, role, avatar, totalIngresos, propiedadesCapturadas, propiedadesGestionadas, propiedadesVendidas, createdAt) VALUES
  ('u3', 'Juan Pérez Soto', 'juan@virtualagent.cr', '1-1234-5678', '8999-1111', '8999-1111', 'juanP', 'scoutpass', 'Desamparados, San José', 'scout', 'https://i.pravatar.cc/150?u=u3', 30000, 5, 0, 0, '2025-01-15 09:00:00'),
  ('u4', 'María López Quesada', 'maria@virtualagent.cr', '2-4321-8765', '8777-2222', '8777-2222', 'mariaL', 'scoutpass', 'Escazú, San José', 'scout', 'https://i.pravatar.cc/150?u=u4', 15000, 2, 0, 0, '2025-01-16 10:00:00');

-- Inserts mínimos de propiedades
INSERT INTO properties (id, capturedBy, tipo, status, telefono, lat, lng, provincia, canton, distrito, descripcion, precioAproximado, esDuplicada, esDeAgencia, exclusividad, ingreso, createdAt, updatedAt, notas) VALUES
  ('p1', 'u1', 'Casa', 'nueva', '8844-2211', 9.9281, -84.0907, 'San José', 'Curridabat', 'Curridabat', 'Casa de dos plantas, cartel en esquina, sin logo de agencia.', 120000000, FALSE, FALSE, FALSE, 250, '2025-01-10 09:30:00', '2025-01-10 09:30:00', ''),
  ('p2', 'u1', 'Terreno', 'en_negociacion', '6633-9900', 9.9335, -84.0821, 'San José', 'Curridabat', 'Granadilla', 'Lote de 500m², cerco metálico, propietario interesado en exclusividad.', 45000000, FALSE, FALSE, TRUE, 2250, '2025-01-08 11:00:00', '2025-01-12 14:00:00', 'Propietario llamó, quiere reunión.'),
  ('p3', 'u2', 'Apartamento', 'contrato_cerrado', '8811-3344', 9.9358, -84.0512, 'San José', 'Montes de Oca', 'San Pedro', 'Apto 3 habitaciones, condominio privado, vendido exitosamente.', 95000000, FALSE, FALSE, TRUE, 102250, '2024-12-01 08:00:00', '2025-01-05 16:00:00', 'Comisión pagada al scout.'),
  ('p4', 'u2', 'Comercial', 'invalida', '2222-8888', 9.9415, -84.0689, 'San José', 'San José', 'Merced', 'Local comercial con logo de agencia RE/MAX en el cartel.', 0, FALSE, TRUE, FALSE, 0, '2024-12-20 10:00:00', '2024-12-20 10:30:00', 'Anulada: cartel de RE/MAX visible.'),
  ('p5', 'u1', 'Finca', 'nueva', '7755-1122', 9.8937, -84.1198, 'San José', 'Desamparados', 'San Miguel', 'Finca de 2 hectáreas, cartel artesanal, sin intermediario.', 200000000, FALSE, FALSE, FALSE, 250, '2025-01-14 07:00:00', '2025-01-14 07:00:00', '');

-- Inserts mínimos de publicaciones de comunidad
INSERT INTO community (id, userId, userName, userAvatar, mensaje, likes, createdAt) VALUES
  ('c1', 'u2', 'Andrea Vargas', 'https://i.pravatar.cc/150?u=u2', '💡 TIP: En Curridabat los carteles más comunes son de madera pintados a mano. Siempre revisen que no tengan logo de agencia detrás del poste.', 14, '2025-01-13 10:30:00'),
  ('c2', 'u1', 'Carlos Ramírez', 'https://i.pravatar.cc/150?u=u1', '🎉 Acabo de cerrar mi primera venta en San Pedro. ¡+100,000 colones! El OCR leyó el número perfecto.', 22, '2025-01-11 15:00:00'),
  ('c3', 'u2', 'Andrea Vargas', 'https://i.pravatar.cc/150?u=u2', 'Pregunta: ¿Si el cartel dice "SE VENDE" sin teléfono visible pero tiene un QR, cuenta igual?', 5, '2025-01-10 08:00:00'),
  ('c4', 'admin1', 'Admin Virtual Agent', 'https://i.pravatar.cc/150?u=admin1', '📢 Recordatorio: Propiedades con logos de agencias externas (RE/MAX, Century 21, etc.) son automáticamente anuladas. Por favor verificar antes de capturar.', 30, '2025-01-09 09:00:00');
