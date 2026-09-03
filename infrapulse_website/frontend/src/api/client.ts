export function getApiBaseUrl(): string {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== 'undefined' && window.location?.origin) {
    const port = window.location.port;
    if (port !== '5173' && port !== '3000') {
      return window.location.origin;
    }
  }
  return 'http://localhost:8000';
}

export const API_BASE_URL = getApiBaseUrl();


export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

const TOKEN_KEY = 'infrapulse_token';

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    // Ignore localStorage errors
  }
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined | null>;
}

export async function apiClient<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, headers: customHeaders, ...restOptions } = options;

  let url = `${API_BASE_URL}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        searchParams.append(key, String(val));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  const token = getStoredToken();
  const headers = new Headers(customHeaders);

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Set default JSON Content-Type only if not FormData
  if (!(restOptions.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...restOptions,
    headers,
  });

  if (response.status === 204) {
    return {} as T;
  }

  // Check content type to parse json or text
  const contentType = response.headers.get('content-type') || '';
  let responseData: unknown;
  if (contentType.includes('application/json')) {
    try {
      responseData = await response.json();
    } catch {
      responseData = null;
    }
  } else {
    responseData = await response.text();
  }

  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`;
    if (responseData && typeof responseData === 'object' && 'detail' in responseData) {
      const detail = (responseData as { detail: unknown }).detail;
      if (typeof detail === 'string') {
        errorMessage = detail;
      } else if (Array.isArray(detail)) {
        errorMessage = detail.map((d: { msg?: string }) => d.msg || JSON.stringify(d)).join(', ');
      }
    }
    throw new ApiError(errorMessage, response.status, responseData);
  }

  return responseData as T;
}

export async function fetchAuthenticatedBlob(endpoint: string): Promise<Blob> {
  let url = endpoint;
  if (!endpoint.startsWith('http')) {
    url = `${API_BASE_URL}${endpoint}`;
  }

  const token = getStoredToken();
  const headers = new Headers();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new ApiError(`Failed to fetch image: ${response.statusText}`, response.status);
  }
  return await response.blob();
}
