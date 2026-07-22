const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
};

let accessToken: string | null = null;
let refreshPromise: Promise<string | null> | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (res.ok) {
        const body = await res.json();
        const token = body.data?.access_token;
        if (token) {
          accessToken = token;
          return token;
        }
      }
    } catch (err) {
      console.error('Failed to silent refresh token:', err);
    } finally {
      refreshPromise = null;
    }
    accessToken = null;
    return null;
  })();

  return refreshPromise;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, ...rest } = options;

  const isAuthRoute =
    path.startsWith('/auth/login') ||
    path.startsWith('/auth/register') ||
    path.startsWith('/auth/refresh');

  if (!accessToken && !isAuthRoute && typeof window !== 'undefined') {
    await refreshAccessToken();
  }

  const makeRequest = async (tokenToUse: string | null): Promise<Response> => {
    const fetchHeaders: Record<string, string> = {
      ...(headers as Record<string, string>),
    };

    if (!(body instanceof FormData)) {
      fetchHeaders['Content-Type'] = 'application/json';
    }

    if (tokenToUse) {
      fetchHeaders['Authorization'] = `Bearer ${tokenToUse}`;
    }

    return fetch(`${API_BASE_URL}/api${path}`, {
      credentials: 'include',
      headers: fetchHeaders,
      body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
      ...rest,
    });
  };

  let res = await makeRequest(accessToken);

  if (res.status === 401 && !isAuthRoute && typeof window !== 'undefined') {
    const newToken = await refreshAccessToken();
    if (newToken) {
      res = await makeRequest(newToken);
    }
  }

  if (!res.ok) {
    const data = await res.json().catch(() => undefined);
    throw new ApiError(res.status, res.statusText, data);
  }

  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string, opts?: RequestOptions) => request<T>(path, { ...opts, method: 'GET' }),

  post: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>(path, { ...opts, method: 'POST', body }),

  put: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>(path, { ...opts, method: 'PUT', body }),

  patch: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>(path, { ...opts, method: 'PATCH', body }),

  delete: <T>(path: string, opts?: RequestOptions) =>
    request<T>(path, { ...opts, method: 'DELETE' }),
};
