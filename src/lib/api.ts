/**
 * Backend API client.
 * Base URL: VITE_API_URL (e.g. http://localhost:8080). All paths use /api prefix.
 *
 * Auth (per backend spec):
 * - Header: Authorization: Bearer <jwt>
 * - One space after "Bearer", no quotes around the token, raw JWT string.
 * - Token from login/register (e.g. data.token or token). Missing/invalid format → 401.
 */

const TOKEN_KEY = 'hfd_token';

function getBaseUrl(): string {
  const url = import.meta.env.VITE_API_URL;
  return typeof url === 'string' && url.trim() ? url.trim().replace(/\/$/, '') : 'http://localhost:8080';
}

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null): void {
  try {
    if (token) {
      const jwt = token.trim();
      if (jwt) localStorage.setItem(TOKEN_KEY, jwt);
      else localStorage.removeItem(TOKEN_KEY);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    // ignore
  }
}

export function clearToken(): void {
  setToken(null);
}

export interface ApiError {
  success: false;
  error: { message?: string };
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

function isApiError(r: unknown): r is ApiError {
  return typeof r === 'object' && r !== null && 'success' in r && (r as ApiError).success === false;
}

export class ApiClientError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: unknown
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

export interface RequestOptions {
  /** Skip adding Authorization header */
  skipAuth?: boolean;
}

/**
 * Low-level request. Path must include /api (e.g. /api/products).
 * On 401/403 throws ApiClientError. On success returns response data (unwrap from { data } if present).
 */
export async function request<T = unknown>(
  method: string,
  path: string,
  body?: unknown,
  options: RequestOptions = {}
): Promise<T> {
  const base = getBaseUrl();
  const url = path.startsWith('/') ? `${base}${path}` : `${base}/${path}`;
  const token = options.skipAuth ? null : getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    const jwt = token.trim();
    if (jwt) headers['Authorization'] = `Bearer ${jwt}`;
  }

  const init: RequestInit = { method, headers };
  if (body !== undefined && body !== null && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    init.body = JSON.stringify(body);
  }

  const res = await fetch(url, init);
  let json: unknown;
  const text = await res.text();
  try {
    json = text ? JSON.parse(text) : undefined;
  } catch {
    json = undefined;
  }

  if (!res.ok) {
    const msg = isApiError(json) && json.error?.message ? json.error.message : res.statusText || `HTTP ${res.status}`;
    throw new ApiClientError(msg, res.status, json);
  }

  if (json === undefined) return undefined as T;
  if (typeof json === 'object' && json !== null && 'data' in json) {
    const raw = json as Record<string, unknown>;
    const inner = raw.data as Record<string, unknown> | undefined;
    // Backend may send token at top level (e.g. { data: { user }, token }) — don't drop it
    const authKeys = ['token', 'accessToken', 'access_token', 'jwt', 'id_token'];
    let result = inner && typeof inner === 'object' ? { ...inner } : {};
    for (const k of authKeys) {
      if (typeof raw[k] === 'string' && !(result as Record<string, unknown>)[k]) {
        (result as Record<string, unknown>)[k] = raw[k];
      }
    }
    return result as T;
  }
  return json as T;
}

// ——— Auth / Users ———

export interface LoginBody {
  email: string;
  password: string;
}

export interface LoginResponse {
  token?: string;
  accessToken?: string;
  user?: { name?: string; email?: string };
}

const TOKEN_KEYS = ['token', 'accessToken', 'access_token', 'jwt', 'id_token'];

function tryTokenFrom(obj: Record<string, unknown>, keys: string[]): string | null {
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  return null;
}

/** Extract JWT from common backend response shapes (token, accessToken, data.token, data.auth.token, etc.). */
export function getTokenFromResponse(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null;
  const obj = data as Record<string, unknown>;
  const top = tryTokenFrom(obj, TOKEN_KEYS);
  if (top) return top;
  const nested = obj.data as Record<string, unknown> | undefined;
  if (nested && typeof nested === 'object') {
    const fromNested = tryTokenFrom(nested, TOKEN_KEYS);
    if (fromNested) return fromNested;
    const auth = nested.auth as Record<string, unknown> | undefined;
    if (auth && typeof auth === 'object') {
      const fromAuth = tryTokenFrom(auth, TOKEN_KEYS);
      if (fromAuth) return fromAuth;
    }
  }
  return null;
}

export interface RegisterBody {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  role?: string;
}

export const auth = {
  login: (email: string, password: string) =>
    request<LoginResponse>('POST', '/api/users/login', { email, password }, { skipAuth: true }),

  register: (body: RegisterBody) =>
    request<LoginResponse>('POST', '/api/users/register', body, { skipAuth: true }),

  forgotPassword: (email: string) =>
    request<unknown>('POST', '/api/users/forgot-password', { email }, { skipAuth: true }),

  resetPassword: (token: string, newPassword: string) =>
    request<unknown>('POST', '/api/users/reset-password', { token, newPassword }, { skipAuth: true }),

  profile: () => request<{ name?: string; email?: string; phone?: string; address?: string; city?: string; state?: string }>('GET', '/api/users/profile'),

  updateProfile: (body: { name?: string; phone?: string; address?: string; city?: string; state?: string; password?: string }) =>
    request<unknown>('PUT', '/api/users/profile', body),
};

// ——— Products ———

export interface ProductQuery {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  items?: T[];
  products?: T[];
  pagination?: { page: number; limit: number; total: number; pages: number };
}

export const products = {
  list: (params?: ProductQuery) => {
    const sp = new URLSearchParams();
    if (params?.category) sp.set('category', params.category);
    if (params?.search) sp.set('search', params.search);
    if (params?.minPrice != null) sp.set('minPrice', String(params.minPrice));
    if (params?.maxPrice != null) sp.set('maxPrice', String(params.maxPrice));
    if (params?.page != null) sp.set('page', String(params.page));
    if (params?.limit != null) sp.set('limit', String(params.limit));
    const q = sp.toString();
    return request<PaginatedResponse<Record<string, unknown>>>('GET', `/api/products${q ? `?${q}` : ''}`);
  },

  get: (id: string) => request<Record<string, unknown>>('GET', `/api/products/${id}`),

  create: (body: Record<string, unknown>) => request<Record<string, unknown>>('POST', '/api/products', body),

  update: (id: string, body: Record<string, unknown>) =>
    request<Record<string, unknown>>('PUT', `/api/products/${id}`, body),

  delete: (id: string) => request<unknown>('DELETE', `/api/products/${id}`),
};

// ——— Cart ———

export const cart = {
  get: () => request<{ items?: Array<{ productId: string; quantity: number; itemId?: string }> }>('GET', '/api/cart'),

  add: (productId: string, quantity: number) =>
    request<unknown>('POST', '/api/cart', { productId, quantity }),

  update: (itemId: string, quantity: number) =>
    request<unknown>('PUT', `/api/cart/${itemId}`, { quantity }),

  remove: (itemId: string) => request<unknown>('DELETE', `/api/cart/${itemId}`),

  clear: () => request<unknown>('DELETE', '/api/cart'),
};

// ——— Orders ———

export interface CreateOrderBody {
  shippingAddress: {
    fullName: string;
    email: string;
    phone: string;
    addressLine1: string;
    city: string;
    state: string;
    pincode: string;
  };
  paymentMethod: string;
  shipping?: number;
}

export const orders = {
  list: (params?: { page?: number; limit?: number }) => {
    const sp = new URLSearchParams();
    if (params?.page != null) sp.set('page', String(params.page));
    if (params?.limit != null) sp.set('limit', String(params.limit));
    const q = sp.toString();
    return request<PaginatedResponse<Record<string, unknown>>>('GET', `/api/orders${q ? `?${q}` : ''}`);
  },

  create: (body: CreateOrderBody) => request<Record<string, unknown>>('POST', '/api/orders', body),

  get: (id: string) => request<Record<string, unknown>>('GET', `/api/orders/${id}`),

  updateStatus: (id: string, status: 'confirmed' | 'shipped' | 'delivered') =>
    request<unknown>('PATCH', `/api/orders/${id}/status`, { status }),
};

// ——— Inventory ———

export const inventory = {
  getByProduct: (productId: string) =>
    request<{ quantity?: number }>('GET', `/api/inventory/product/${productId}`),
};

// ——— General ———

export const general = {
  health: () => request<unknown>('GET', '/health', undefined, { skipAuth: true }),
};
