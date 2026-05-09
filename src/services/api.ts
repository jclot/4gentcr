/**
 * 
 *
 * 
 * - Guarda el JWT en AsyncStorage y lo inyecta.
 * - Lanza errores con mensajes legibles para que el store los capture.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// CONFIGURACION
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.20.6:3001';
const TOKEN_KEY = '@virtualagent_token';

let _token: string | null = null;

// Token helpers 
export const setToken = async (token: string) => {
  _token = token;
  await AsyncStorage.setItem(TOKEN_KEY, token);
};

export const clearToken = async () => {
  _token = null;
  await AsyncStorage.removeItem(TOKEN_KEY);
};

export const loadToken = async (): Promise<string | null> => {
  const saved = await AsyncStorage.getItem(TOKEN_KEY);
  _token = saved;
  return saved;
};

// Helper HTTP 
async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  };

  if (_token) {
    headers['Authorization'] = `Bearer ${_token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  } catch (networkErr) {
    // Sin conexión o IP incorrecta
    throw new Error('Sin conexión con el servidor. Verifica tu red.');
  }

  if (res.status === 401) {
    await clearToken();
    throw new Error('UNAUTHORIZED');
  }

  // Intentar parsear el body siempre, exitoso o no
  let body: any;
  try {
    body = await res.json();
  } catch {
    throw new Error(`Error ${res.status}: respuesta inválida del servidor.`);
  }

  if (!res.ok) {
    // { error: string } o { error: string, detalles: [] }
    const message = body?.error ?? `Error ${res.status}`;
    const err = new Error(message) as any;
    err.status = res.status;
    err.detalles = body?.detalles ?? null;
    throw err;
  }

  return body as T;
}

// DB INIT 
export interface InitMeta {
  propertiesTotal: number;
  propertiesPage: number;
  propertiesLimit: number;
  communityTotal: number;
  communityPage: number;
  communityLimit: number;
}

export interface InitResponse {
  users: any[];
  properties: any[];
  community: any[];
  meta: InitMeta;
}

export const apiInit = () => apiFetch<InitResponse>('/db/init?page=1&limit=20&communityPage=1&communityLimit=20');

// AUTH
export const apiLogin = (correo: string, password: string) =>
  apiFetch<{ token: string; user: any }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ correo, password }),
  });

export const apiRegister = (userData: any) =>
  apiFetch<{ token: string; user: any }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });

// USERS 
export const apiUpdateUser = (userId: string, data: any) =>
  apiFetch<any>(`/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const apiChangePassword = (
  userId: string,
  currentPassword: string,
  newPassword: string,
) =>
  apiFetch<{ ok: boolean; message: string }>(`/users/${userId}/password`, {
    method: 'PUT',
    body: JSON.stringify({ currentPassword, newPassword }),
  });

export const apiDeleteUser = (userId: string) =>
  apiFetch<{ ok: boolean }>(`/users/${userId}`, { method: 'DELETE' });

// PROPERTIES (paginado)
export interface PropertiesPageResponse {
  data: any[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
  };
}

export const apiGetProperties = (page = 1, limit = 20, userId?: string) => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    ...(userId ? { userId } : {}),
  });
  return apiFetch<PropertiesPageResponse>(`/properties?${params.toString()}`);
};

export const apiAddProperty = (property: any) =>
  apiFetch<{ property: any; user: any }>('/properties', {
    method: 'POST',
    body: JSON.stringify(property),
  });

export const apiUpdatePropertyStatus = (
  propertyId: string,
  status: string,
  notas?: string,
) =>
  apiFetch<{ property: any; user: any }>(`/properties/${propertyId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status, notas }),
  });

export const apiUpdateProperty = (propertyId: string, data: any) =>
  apiFetch<any>(`/properties/${propertyId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const apiDeleteProperty = (propertyId: string) =>
  apiFetch<{ ok: boolean }>(`/properties/${propertyId}`, { method: 'DELETE' });

// COMMUNITY 
export const apiAddPost = (post: any) =>
  apiFetch<any>('/community', {
    method: 'POST',
    body: JSON.stringify(post),
  });

export const apiLikePost = (postId: string) =>
  apiFetch<any>(`/community/${postId}/like`, { method: 'PUT' });
