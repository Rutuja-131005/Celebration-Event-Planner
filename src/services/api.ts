const API_BASE = '/api/v1';

export class ApiError extends Error {
  public code: string;
  public status: number;

  constructor(message: string, status: number, code: string = 'API_ERROR') {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

let refreshPromise: Promise<string | null> | null = null;

async function acquireDemoToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'rutuja@atelier.com', password: 'atelier2025' }),
      });
      const data = await res.json().catch(() => ({}));
      if (data?.success && data?.token) {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem('atelier_token', data.token);
        }
        return data.token as string;
      }
      return null;
    } catch {
      return null;
    } finally {
      refreshPromise = null;
    }
  })();
  return refreshPromise;
}

async function request<T>(endpoint: string, options: RequestInit = {}, isRetry = false): Promise<T> {
  let token = typeof window !== 'undefined' && window.localStorage ? localStorage.getItem('atelier_token') : null;

  // Proactively acquire a session token if none exists and not calling auth routes
  if (!token && !endpoint.startsWith('/auth/')) {
    token = await acquireDemoToken();
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const url = `${API_BASE}${endpoint}`;
  try {
    const res = await fetch(url, { ...options, headers });
    const data = await res.json().catch(() => ({}));

    // If 401 occurs and not already retrying, refresh token and retry once
    if (res.status === 401 && !isRetry && !endpoint.startsWith('/auth/')) {
      const freshToken = await acquireDemoToken();
      if (freshToken) {
        return request<T>(endpoint, options, true);
      }
    }

    if (!res.ok) {
      const errorMsg = data?.error?.message || `Request failed with status ${res.status}`;
      const errorCode = data?.error?.code || 'UNKNOWN_ERROR';
      throw new ApiError(errorMsg, res.status, errorCode);
    }

    return data;
  } catch (err: any) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(err.message || 'Network request failed', 0, 'NETWORK_ERROR');
  }
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint, { method: 'GET' }),
  post: <T>(endpoint: string, body?: any) =>
    request<T>(endpoint, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  put: <T>(endpoint: string, body?: any) =>
    request<T>(endpoint, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(endpoint: string, body?: any) =>
    request<T>(endpoint, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),
};
