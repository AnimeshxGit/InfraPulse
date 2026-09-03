import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getStoredToken, setStoredToken, apiClient, ApiError } from '../api/client';

describe('API Client', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('correctly persists and retrieves token in localStorage', () => {
    expect(getStoredToken()).toBeNull();
    setStoredToken('test-jwt-token-value');
    expect(getStoredToken()).toBe('test-jwt-token-value');
    setStoredToken(null);
    expect(getStoredToken()).toBeNull();
  });

  it('injects Authorization header when token is stored', async () => {
    setStoredToken('my-secret-bearer-token');

    let capturedAuthHeader: string | null = null;

    vi.spyOn(globalThis, 'fetch').mockImplementation((_url, init) => {
      const headers = new Headers(init?.headers);
      capturedAuthHeader = headers.get('Authorization');
      return Promise.resolve(
        new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });

    const res = await apiClient<{ success: boolean }>('/api/v1/auth/me');
    expect(res.success).toBe(true);
    expect(capturedAuthHeader).toBe('Bearer my-secret-bearer-token');
  });

  it('throws ApiError with normalized message on 401 response', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(() => {
      return Promise.resolve(
        new Response(JSON.stringify({ detail: 'Invalid or expired authentication token' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });

    await expect(apiClient('/api/v1/complaints')).rejects.toThrow(ApiError);
    await expect(apiClient('/api/v1/complaints')).rejects.toThrow('Invalid or expired authentication token');
  });
});
