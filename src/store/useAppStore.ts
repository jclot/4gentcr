import { create } from 'zustand';
import {
  MockDatabase,
  User,
  Property,
  CommunityPost,
  PropertyStatus,
} from '../data/mockData';
import {
  apiInit,
  apiLogin,
  apiRegister,
  apiUpdateUser,
  apiChangePassword,
  apiDeleteUser,
  apiAddProperty,
  apiUpdatePropertyStatus,
  apiUpdateProperty,
  apiDeleteProperty,
  apiAddPost,
  apiLikePost,
  apiGetProperties,
  setToken,
  clearToken,
  loadToken,
  InitMeta,
} from '../services/api';

// ── Estado inicial limpio ────────────────────────────────────────────────────
const EMPTY_DB: MockDatabase = {
  users: [],
  properties: [],
  community: [],
  currentUserId: null,
};

interface PaginationState {
  propertiesMeta: InitMeta | null;
  isLoadingMore: boolean;
}

interface AppStore extends PaginationState {
  db: MockDatabase;
  isLoading: boolean;

  // ── Init ──
  initStore: () => Promise<void>;

  // ── Auth ──
  /**
   * Lanza un Error con el mensaje del servidor si las credenciales fallan.
   * El componente de login debe envolver la llamada en try/catch.
   */
  login: (correo: string, password: string) => Promise<User>;
  register: (data: Omit<User, 'id' | 'totalIngresos' | 'propiedadesCapturadas' | 'propiedadesGestionadas' | 'propiedadesVendidas' | 'createdAt'>) => Promise<User>;
  logout: () => Promise<void>;
  getCurrentUser: () => User | null;

  // ── Users CRUD ──
  updateUser: (userId: string, data: Partial<User>) => Promise<void>;
  changePassword: (userId: string, currentPassword: string, newPassword: string) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;

  // ── Properties CRUD ──
  getPropertiesByUser: (userId: string) => Property[];
  loadMoreProperties: (page: number, userId?: string) => Promise<void>;
  addProperty: (data: Omit<Property, 'id' | 'createdAt' | 'updatedAt' | 'ingreso' | 'esDuplicada'>) => Promise<Property>;
  updatePropertyStatus: (propertyId: string, status: PropertyStatus, notas?: string) => Promise<void>;
  updateProperty: (propertyId: string, data: Partial<Property>) => Promise<void>;
  deleteProperty: (propertyId: string) => Promise<void>;

  // ── Community CRUD ──
  addPost: (userId: string, mensaje: string) => Promise<void>;
  likePost: (postId: string) => Promise<void>;
}

// ── Helper interno: hidrata el store con los datos de la sesión activa ────────
// Separado para que tanto initStore como login lo usen sin duplicar código.
async function _hydrateSession(
  token: string,
  set: (partial: Partial<AppStore>) => void,
): Promise<void> {
  // Decodificar userId del payload JWT (no requiere librería extra)
  let currentUserId: string | null = null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    currentUserId = payload.id ?? null;
  } catch {
    // Token mal formado
    await clearToken();
    set({ db: EMPTY_DB, isLoading: false });
    return;
  }

  if (!currentUserId) {
    await clearToken();
    set({ db: EMPTY_DB, isLoading: false });
    return;
  }

  // Cargar datos iniciales (primera página ya paginada)
  const apiData = await apiInit();

  set({
    db: {
      users: apiData.users,
      properties: apiData.properties,
      community: apiData.community,
      currentUserId,
    },
    propertiesMeta: apiData.meta,
    isLoading: false,
  });
}

export const useAppStore = create<AppStore>((set, get) => ({
  db: EMPTY_DB,
  isLoading: true,
  isLoadingMore: false,
  propertiesMeta: null,

  // ── INIT ─────────────────────────────────────────────────────────────────
  initStore: async () => {
    set({ isLoading: true });
    try {
      const token = await loadToken();

      if (!token) {
        set({ db: EMPTY_DB, isLoading: false });
        return;
      }

      await _hydrateSession(token, set);
    } catch (err: any) {
      // UNAUTHORIZED → token expirado, forzar login
      set({ db: EMPTY_DB, isLoading: false });
    }
  },

  // ── AUTH ─────────────────────────────────────────────────────────────────

  /**
   * BUG FIX — Login Fantasma:
   * Antes: catch { return null } tragaba el error y la UI no recibía nada.
   * Ahora: propaga el Error para que el componente muestre el mensaje.
   *
   * BUG FIX — Pérdida de Estado:
   * Antes: login solo agregaba el usuario al array, sin cargar props/community.
   * Ahora: llama a _hydrateSession que carga todos los datos de la sesión.
   */
  login: async (correo, password) => {
    // Puede lanzar Error con mensaje del servidor (ej. "Credenciales incorrectas.")
    const { token, user } = await apiLogin(correo, password);

    await setToken(token);

    // Hidratar toda la sesión: users, properties, community
    await _hydrateSession(token, set);

    // Asegurarse de que currentUserId queda apuntando a este usuario
    // (_hydrateSession ya lo hace, pero si el usuario no estaba en la lista lo añadimos)
    set((s) => ({
      db: {
        ...s.db,
        currentUserId: user.id,
        users: s.db.users.some((u) => u.id === user.id)
          ? s.db.users.map((u) => (u.id === user.id ? user : u))
          : [...s.db.users, user],
      },
    }));

    return user;
  },

  register: async (data) => {
    const payload = {
      ...data,
      id: `u_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    // Puede lanzar Error (ej. "Este correo ya está registrado.")
    const { token, user } = await apiRegister(payload);

    await setToken(token);
    await _hydrateSession(token, set);

    set((s) => ({
      db: {
        ...s.db,
        currentUserId: user.id,
        users: s.db.users.some((u) => u.id === user.id)
          ? s.db.users.map((u) => (u.id === user.id ? user : u))
          : [...s.db.users, user],
      },
    }));

    return user;
  },

  /**
   * BUG FIX — Pérdida de Estado:
   * Antes: logout solo seteaba db: EMPTY_DB pero dejaba isLoading y propertiesMeta sucios.
   * Ahora: resetea TODO el estado a valores iniciales para evitar colisiones entre sesiones.
   */
  logout: async () => {
    await clearToken();
    set({
      db: EMPTY_DB,
      isLoading: false,
      isLoadingMore: false,
      propertiesMeta: null,
    });
  },

  getCurrentUser: () => {
    const { db } = get();
    if (!db.currentUserId) return null;
    return db.users.find((u) => u.id === db.currentUserId) ?? null;
  },

  // ── USERS CRUD ────────────────────────────────────────────────────────────
  updateUser: async (userId, data) => {
    const updated = await apiUpdateUser(userId, data);
    set((s) => ({
      db: {
        ...s.db,
        users: s.db.users.map((u) => (u.id === userId ? { ...u, ...updated } : u)),
      },
    }));
  },

  changePassword: async (userId, currentPassword, newPassword) => {
    await apiChangePassword(userId, currentPassword, newPassword);
  },

  deleteUser: async (userId) => {
    const { db } = get();
    await apiDeleteUser(userId);

    if (db.currentUserId === userId) {
      await clearToken();
      set({
        db: EMPTY_DB,
        isLoading: false,
        isLoadingMore: false,
        propertiesMeta: null,
      });
      return;
    }

    set((s) => ({
      db: {
        ...s.db,
        users: s.db.users.filter((u) => u.id !== userId),
        properties: s.db.properties.filter((p) => p.capturedBy !== userId),
        community: s.db.community.filter((c) => c.userId !== userId),
      },
    }));
  },

  // ── PROPERTIES CRUD ───────────────────────────────────────────────────────
  getPropertiesByUser: (userId) =>
    get().db.properties.filter((p) => p.capturedBy === userId),

  /**
   * Carga una página adicional de propiedades y las añade al array local.
   * El componente de lista llama a esto al llegar al final del scroll.
   */
  loadMoreProperties: async (page, userId) => {
    const { propertiesMeta, isLoadingMore } = get();

    // Evitar llamadas redundantes
    if (isLoadingMore) return;
    if (propertiesMeta && page > propertiesMeta.propertiesTotal / propertiesMeta.propertiesLimit) return;

    set({ isLoadingMore: true });
    try {
      const response = await apiGetProperties(page, 20, userId);

      set((s) => {
        // Fusionar sin duplicados (por si acaso)
        const existingIds = new Set(s.db.properties.map((p) => p.id));
        const newProps = response.data.filter((p) => !existingIds.has(p.id));

        return {
          db: {
            ...s.db,
            properties: [...s.db.properties, ...newProps],
          },
          propertiesMeta: {
            ...s.propertiesMeta!,
            propertiesTotal: response.meta.total,
            propertiesPage: response.meta.page,
          },
          isLoadingMore: false,
        };
      });
    } catch (err) {
      set({ isLoadingMore: false });
      throw err;
    }
  },

  addProperty: async (data) => {
    const payload = {
      ...data,
      id: `p_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const { property: newProp, user: updatedUser } = await apiAddProperty(payload);

    set((s) => ({
      db: {
        ...s.db,
        properties: [newProp, ...s.db.properties],
        users: s.db.users.map((u) => (u.id === updatedUser.id ? updatedUser : u)),
      },
    }));

    return newProp;
  },

  updatePropertyStatus: async (propertyId, status, notas) => {
    const { property: updatedProp, user: updatedUser } =
      await apiUpdatePropertyStatus(propertyId, status, notas);

    set((s) => ({
      db: {
        ...s.db,
        properties: s.db.properties.map((p) => (p.id === propertyId ? updatedProp : p)),
        users: s.db.users.map((u) => (u.id === updatedUser.id ? updatedUser : u)),
      },
    }));
  },

  updateProperty: async (propertyId, data) => {
    await apiUpdateProperty(propertyId, data);
    set((s) => ({
      db: {
        ...s.db,
        properties: s.db.properties.map((p) =>
          p.id === propertyId ? { ...p, ...data, updatedAt: new Date().toISOString() } : p,
        ),
      },
    }));
  },

  deleteProperty: async (propertyId) => {
    await apiDeleteProperty(propertyId);
    set((s) => ({
      db: {
        ...s.db,
        properties: s.db.properties.filter((p) => p.id !== propertyId),
      },
    }));
  },

  // ── COMMUNITY CRUD ────────────────────────────────────────────────────────
  addPost: async (userId, mensaje) => {
    const { db } = get();
    const user = db.users.find((u) => u.id === userId);
    if (!user) return;

    const payload = {
      id: `c_${Date.now()}`,
      userId,
      userName: user.nombres.split(' ').slice(0, 2).join(' '),
      userAvatar: user.avatar,
      mensaje,
      createdAt: new Date().toISOString(),
    };

    const newPost: CommunityPost = await apiAddPost(payload);

    set((s) => ({
      db: { ...s.db, community: [newPost, ...s.db.community] },
    }));
  },

  likePost: async (postId) => {
    await apiLikePost(postId);
    set((s) => ({
      db: {
        ...s.db,
        community: s.db.community.map((c) =>
          c.id === postId ? { ...c, likes: c.likes + 1 } : c,
        ),
      },
    }));
  },
}));
