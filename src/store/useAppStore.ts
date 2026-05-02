import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  MockDatabase,
  User,
  Property,
  CommunityPost,
  initialMockData,
  PropertyStatus,
} from '../data/mockData';

const STORAGE_KEY = '@virtualagent_db';

// ── Ingreso calculation ──────────────────────────────────────────────
export const calcularIngreso = (
  status: PropertyStatus,
  esDuplicada: boolean,
  esDeAgencia: boolean,
  exclusividad: boolean,
): number => {
  if (esDuplicada || esDeAgencia) return 0;
  let total = 250; // Nueva válida
  if (exclusividad) total += 2000; // Gestión
  if (status === 'contrato_cerrado') total += 100000; // Venta exitosa
  return total;
};

interface AppStore {
  db: MockDatabase;
  isLoading: boolean;

  // ── Init ──
  initStore: () => Promise<void>;
  persistStore: (db: MockDatabase) => Promise<void>;

  // ── Auth ──
  login: (correo: string, password: string) => User | null;
  register: (data: Omit<User, 'id' | 'totalIngresos' | 'propiedadesCapturadas' | 'propiedadesGestionadas' | 'propiedadesVendidas' | 'createdAt'>) => User;
  logout: () => void;
  getCurrentUser: () => User | null;

  // ── Users CRUD ──
  updateUser: (userId: string, data: Partial<User>) => void;

  // ── Properties CRUD ──
  getPropertiesByUser: (userId: string) => Property[];
  addProperty: (data: Omit<Property, 'id' | 'createdAt' | 'updatedAt' | 'ingreso'>) => Property;
  updatePropertyStatus: (propertyId: string, status: PropertyStatus, notas?: string) => void;
  updateProperty: (propertyId: string, data: Partial<Property>) => void;
  deleteProperty: (propertyId: string) => void;
  checkDuplicate: (lat: number, lng: number, excludeId?: string) => boolean;

  // ── Community CRUD ──
  addPost: (userId: string, mensaje: string) => void;
  likePost: (postId: string) => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
  db: initialMockData,
  isLoading: true,

  // ── INIT ─────────────────────────────────────────────────────────────
  initStore: async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: MockDatabase = JSON.parse(stored);
        set({ db: parsed, isLoading: false });
      } else {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(initialMockData));
        set({ db: initialMockData, isLoading: false });
      }
    } catch {
      set({ db: initialMockData, isLoading: false });
    }
  },

  persistStore: async (db: MockDatabase) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    } catch (e) {
      console.warn('Persist error:', e);
    }
  },

  // ── AUTH ─────────────────────────────────────────────────────────────
  login: (correo, password) => {
    const { db } = get();
    const user = db.users.find(
      u => u.correo.toLowerCase() === correo.toLowerCase() && u.password === password,
    );
    if (user) {
      const newDb = { ...db, currentUserId: user.id };
      set({ db: newDb });
      get().persistStore(newDb);
      return user;
    }
    return null;
  },

  register: (data) => {
    const { db } = get();
    const newUser: User = {
      ...data,
      id: `u_${Date.now()}`,
      totalIngresos: 0,
      propiedadesCapturadas: 0,
      propiedadesGestionadas: 0,
      propiedadesVendidas: 0,
      createdAt: new Date().toISOString(),
    };
    const newDb = {
      ...db,
      users: [...db.users, newUser],
      currentUserId: newUser.id,
    };
    set({ db: newDb });
    get().persistStore(newDb);
    return newUser;
  },

  logout: () => {
    const { db } = get();
    const newDb = { ...db, currentUserId: null };
    set({ db: newDb });
    get().persistStore(newDb);
  },

  getCurrentUser: () => {
    const { db } = get();
    if (!db.currentUserId) return null;
    return db.users.find(u => u.id === db.currentUserId) ?? null;
  },

  // ── USERS CRUD ───────────────────────────────────────────────────────
  updateUser: (userId, data) => {
    const { db } = get();
    const newDb = {
      ...db,
      users: db.users.map(u => (u.id === userId ? { ...u, ...data } : u)),
    };
    set({ db: newDb });
    get().persistStore(newDb);
  },

  // ── PROPERTIES CRUD ──────────────────────────────────────────────────
  getPropertiesByUser: (userId) => {
    return get().db.properties.filter(p => p.capturedBy === userId);
  },

  checkDuplicate: (lat, lng, excludeId) => {
    const { db } = get();
    const THRESHOLD = 0.0003; // ~30 metros
    return db.properties.some(
      p =>
        p.id !== excludeId &&
        Math.abs(p.lat - lat) < THRESHOLD &&
        Math.abs(p.lng - lng) < THRESHOLD,
    );
  },

  addProperty: (data) => {
    const { db, checkDuplicate } = get();
    const isDup = checkDuplicate(data.lat, data.lng);
    const ingreso = calcularIngreso(
      data.status,
      isDup || data.esDuplicada,
      data.esDeAgencia,
      data.exclusividad,
    );
    const newProp: Property = {
      ...data,
      id: `p_${Date.now()}`,
      esDuplicada: isDup || data.esDuplicada,
      ingreso,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Actualizar stats del usuario
    const newDb = {
      ...db,
      properties: [...db.properties, newProp],
      users: db.users.map(u => {
        if (u.id === data.capturedBy) {
          return {
            ...u,
            propiedadesCapturadas: u.propiedadesCapturadas + 1,
            totalIngresos: u.totalIngresos + ingreso,
          };
        }
        return u;
      }),
    };
    set({ db: newDb });
    get().persistStore(newDb);
    return newProp;
  },

  updatePropertyStatus: (propertyId, status, notas) => {
    const { db, calcularIngreso: calc } = get() as any;
    const prop = db.properties.find((p: Property) => p.id === propertyId);
    if (!prop) return;

    const ingreso = calcularIngreso(status, prop.esDuplicada, prop.esDeAgencia, prop.exclusividad);
    const incomeDiff = ingreso - prop.ingreso;

    const newDb = {
      ...db,
      properties: db.properties.map((p: Property) =>
        p.id === propertyId
          ? { ...p, status, ingreso, notas: notas ?? p.notas, updatedAt: new Date().toISOString() }
          : p,
      ),
      users: db.users.map((u: User) => {
        if (u.id === prop.capturedBy && incomeDiff !== 0) {
          return {
            ...u,
            totalIngresos: Math.max(0, u.totalIngresos + incomeDiff),
            propiedadesVendidas:
              status === 'contrato_cerrado'
                ? u.propiedadesVendidas + 1
                : u.propiedadesVendidas,
            propiedadesGestionadas:
              status === 'en_negociacion'
                ? u.propiedadesGestionadas + 1
                : u.propiedadesGestionadas,
          };
        }
        return u;
      }),
    };
    set({ db: newDb });
    get().persistStore(newDb);
  },

  updateProperty: (propertyId, data) => {
    const { db } = get();
    const newDb = {
      ...db,
      properties: db.properties.map(p =>
        p.id === propertyId ? { ...p, ...data, updatedAt: new Date().toISOString() } : p,
      ),
    };
    set({ db: newDb });
    get().persistStore(newDb);
  },

  deleteProperty: (propertyId) => {
    const { db } = get();
    const newDb = {
      ...db,
      properties: db.properties.filter(p => p.id !== propertyId),
    };
    set({ db: newDb });
    get().persistStore(newDb);
  },

  // ── COMMUNITY CRUD ───────────────────────────────────────────────────
  addPost: (userId, mensaje) => {
    const { db } = get();
    const user = db.users.find(u => u.id === userId);
    if (!user) return;
    const newPost: CommunityPost = {
      id: `c_${Date.now()}`,
      userId,
      userName: user.nombres.split(' ').slice(0, 2).join(' '),
      userAvatar: user.avatar,
      mensaje,
      likes: 0,
      createdAt: new Date().toISOString(),
    };
    const newDb = { ...db, community: [newPost, ...db.community] };
    set({ db: newDb });
    get().persistStore(newDb);
  },

  likePost: (postId) => {
    const { db } = get();
    const newDb = {
      ...db,
      community: db.community.map(c =>
        c.id === postId ? { ...c, likes: c.likes + 1 } : c,
      ),
    };
    set({ db: newDb });
    get().persistStore(newDb);
  },
}));