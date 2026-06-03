export type UserRole = 'scout' | 'admin';
export type PropertyStatus = 'nueva' | 'en_negociacion' | 'contrato_cerrado' | 'invalida';
export type PropertyType = 'Casa' | 'Terreno' | 'Comercial' | 'Apartamento' | 'Finca';

export interface User {
  id: string;
  nombres: string;
  correo: string;
  cedula: string;
  telefono: string;
  telefonoSinpe: string;
  alias: string;
  password: string;
  direccion: string;
  role: UserRole;
  avatar: string;
  totalIngresos: number;
  propiedadesCapturadas: number;
  propiedadesGestionadas: number;
  propiedadesVendidas: number;
  createdAt: string;
  twoFAEnabled?: boolean;
}

export interface Property {
  id: string;
  capturedBy: string; // userId
  tipo: PropertyType;
  status: PropertyStatus;
  telefono: string;
  fotos: string[];
  lat: number;
  lng: number;
  provincia: string;
  canton: string;
  distrito: string;
  descripcion: string;
  precioAproximado: number;
  esDuplicada: boolean;
  esDeAgencia: boolean;
  exclusividad: boolean;
  ingreso: number;
  createdAt: string;
  updatedAt: string;
  notas: string;
}

export interface CommunityPost {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  mensaje: string;
  likes: number;
  createdAt: string;
}

export interface MockDatabase {
  users: User[];
  properties: Property[];
  community: CommunityPost[];
  currentUserId: string | null;
}

export const initialMockData: MockDatabase = {
  currentUserId: null,
  users: [
    {
      id: 'u1',
      nombres: 'Carlos Ramírez Solís',
      correo: 'carlos@virtualagent.cr',
      cedula: '1-0852-0341',
      telefono: '8888-1234',
      telefonoSinpe: '8888-1234',
      alias: 'carlosR',
      password: '123456',
      direccion: 'Curridabat, San José',
      role: 'scout',
      avatar: 'https://i.pravatar.cc/150?u=u1',
      totalIngresos: 104250,
      propiedadesCapturadas: 8,
      propiedadesGestionadas: 2,
      propiedadesVendidas: 1,
      createdAt: '2024-11-01T08:00:00Z',
    },
    {
      id: 'u2',
      nombres: 'Andrea Vargas Mora',
      correo: 'andrea@virtualagent.cr',
      cedula: '2-0614-0889',
      telefono: '7777-5678',
      telefonoSinpe: '7777-5678',
      alias: 'andreaV',
      password: '123456',
      direccion: 'San Pedro, Montes de Oca',
      role: 'scout',
      avatar: 'https://i.pravatar.cc/150?u=u2',
      totalIngresos: 52500,
      propiedadesCapturadas: 12,
      propiedadesGestionadas: 1,
      propiedadesVendidas: 0,
      createdAt: '2024-10-15T10:00:00Z',
    },
    {
      id: 'admin1',
      nombres: 'Administrador Virtual Agent',
      correo: 'admin@virtualagent.cr',
      cedula: '0-0000-0001',
      telefono: '2222-0000',
      telefonoSinpe: '2222-0000',
      alias: 'admin',
      password: 'admin123',
      direccion: 'San José Centro',
      role: 'admin',
      avatar: 'https://i.pravatar.cc/150?u=admin1',
      totalIngresos: 0,
      propiedadesCapturadas: 0,
      propiedadesGestionadas: 0,
      propiedadesVendidas: 0,
      createdAt: '2024-01-01T00:00:00Z',
    },
  ],
  properties: [
    {
      id: 'p1',
      capturedBy: 'u1',
      tipo: 'Casa',
      status: 'nueva',
      telefono: '8844-2211',
      fotos: [],
      lat: 9.9281,
      lng: -84.0907,
      provincia: 'San José',
      canton: 'Curridabat',
      distrito: 'Curridabat',
      descripcion: 'Casa de dos plantas, cartel en esquina, sin logo de agencia.',
      precioAproximado: 120000000,
      esDuplicada: false,
      esDeAgencia: false,
      exclusividad: false,
      ingreso: 250,
      createdAt: '2025-01-10T09:30:00Z',
      updatedAt: '2025-01-10T09:30:00Z',
      notas: '',
    },
    {
      id: 'p2',
      capturedBy: 'u1',
      tipo: 'Terreno',
      status: 'en_negociacion',
      telefono: '6633-9900',
      fotos: [],
      lat: 9.9335,
      lng: -84.0821,
      provincia: 'San José',
      canton: 'Curridabat',
      distrito: 'Granadilla',
      descripcion: 'Lote de 500m², cerco metálico, propietario interesado en exclusividad.',
      precioAproximado: 45000000,
      esDuplicada: false,
      esDeAgencia: false,
      exclusividad: true,
      ingreso: 2250,
      createdAt: '2025-01-08T11:00:00Z',
      updatedAt: '2025-01-12T14:00:00Z',
      notas: 'Propietario llamó, quiere reunión.',
    },
    {
      id: 'p3',
      capturedBy: 'u2',
      tipo: 'Apartamento',
      status: 'contrato_cerrado',
      telefono: '8811-3344',
      fotos: [],
      lat: 9.9358,
      lng: -84.0512,
      provincia: 'San José',
      canton: 'Montes de Oca',
      distrito: 'San Pedro',
      descripcion: 'Apto 3 habitaciones, condominio privado, vendido exitosamente.',
      precioAproximado: 95000000,
      esDuplicada: false,
      esDeAgencia: false,
      exclusividad: true,
      ingreso: 102250,
      createdAt: '2024-12-01T08:00:00Z',
      updatedAt: '2025-01-05T16:00:00Z',
      notas: 'Comisión pagada al scout.',
    },
    {
      id: 'p4',
      capturedBy: 'u2',
      tipo: 'Comercial',
      status: 'invalida',
      telefono: '2222-8888',
      fotos: [],
      lat: 9.9415,
      lng: -84.0689,
      provincia: 'San José',
      canton: 'San José',
      distrito: 'Merced',
      descripcion: 'Local comercial con logo de agencia RE/MAX en el cartel.',
      precioAproximado: 0,
      esDuplicada: false,
      esDeAgencia: true,
      exclusividad: false,
      ingreso: 0,
      createdAt: '2024-12-20T10:00:00Z',
      updatedAt: '2024-12-20T10:30:00Z',
      notas: 'Anulada: cartel de RE/MAX visible.',
    },
    {
      id: 'p5',
      capturedBy: 'u1',
      tipo: 'Finca',
      status: 'nueva',
      telefono: '7755-1122',
      fotos: [],
      lat: 9.8937,
      lng: -84.1198,
      provincia: 'San José',
      canton: 'Desamparados',
      distrito: 'San Miguel',
      descripcion: 'Finca de 2 hectáreas, cartel artesanal, sin intermediario.',
      precioAproximado: 200000000,
      esDuplicada: false,
      esDeAgencia: false,
      exclusividad: false,
      ingreso: 250,
      createdAt: '2025-01-14T07:00:00Z',
      updatedAt: '2025-01-14T07:00:00Z',
      notas: '',
    },
  ],
  community: [
    {
      id: 'c1',
      userId: 'u2',
      userName: 'Andrea Vargas',
      userAvatar: 'https://i.pravatar.cc/150?u=u2',
      mensaje: '💡 TIP: En Curridabat los carteles más comunes son de madera pintados a mano. Siempre revisen que no tengan logo de agencia detrás del poste.',
      likes: 14,
      createdAt: '2025-01-13T10:30:00Z',
    },
    {
      id: 'c2',
      userId: 'u1',
      userName: 'Carlos Ramírez',
      userAvatar: 'https://i.pravatar.cc/150?u=u1',
      mensaje: '🎉 Acabo de cerrar mi primera venta en San Pedro. ¡+100,000 colones! El OCR leyó el número perfecto.',
      likes: 22,
      createdAt: '2025-01-11T15:00:00Z',
    },
    {
      id: 'c3',
      userId: 'u2',
      userName: 'Andrea Vargas',
      userAvatar: 'https://i.pravatar.cc/150?u=u2',
      mensaje: 'Pregunta: ¿Si el cartel dice "SE VENDE" sin teléfono visible pero tiene un QR, cuenta igual?',
      likes: 5,
      createdAt: '2025-01-10T08:00:00Z',
    },
    {
      id: 'c4',
      userId: 'admin1',
      userName: 'Admin Virtual Agent',
      userAvatar: 'https://i.pravatar.cc/150?u=admin1',
      mensaje: '📢 Recordatorio: Propiedades con logos de agencias externas (RE/MAX, Century 21, etc.) son automáticamente anuladas. Por favor verificar antes de capturar.',
      likes: 30,
      createdAt: '2025-01-09T09:00:00Z',
    },
  ],
};