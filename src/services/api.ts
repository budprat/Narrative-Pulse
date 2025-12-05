import type { ApiResponse } from '@/types/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// ============================================
// TOKEN MANAGEMENT
// ============================================

let accessToken: string | null = null;
let refreshToken: string | null = null;

export function setTokens(access: string, refresh: string): void {
  accessToken = access;
  refreshToken = refresh;
  localStorage.setItem('accessToken', access);
  localStorage.setItem('refreshToken', refresh);
}

export function getAccessToken(): string | null {
  if (!accessToken) {
    accessToken = localStorage.getItem('accessToken');
  }
  return accessToken;
}

export function getRefreshToken(): string | null {
  if (!refreshToken) {
    refreshToken = localStorage.getItem('refreshToken');
  }
  return refreshToken;
}

export function clearTokens(): void {
  accessToken = null;
  refreshToken = null;
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}

// ============================================
// API CLIENT
// ============================================

interface RequestOptions extends RequestInit {
  requireAuth?: boolean;
}

async function refreshAccessToken(): Promise<boolean> {
  const token = getRefreshToken();
  if (!token) return false;

  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken: token }),
    });

    if (!response.ok) {
      clearTokens();
      return false;
    }

    const data = await response.json();
    if (data.success && data.data) {
      setTokens(data.data.accessToken, data.data.refreshToken);
      return true;
    }

    clearTokens();
    return false;
  } catch {
    clearTokens();
    return false;
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const { requireAuth = true, ...fetchOptions } = options;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };

  if (requireAuth) {
    const token = getAccessToken();
    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;

  try {
    let response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    // Handle token expiration
    if (response.status === 401 && requireAuth) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        const newToken = getAccessToken();
        if (newToken) {
          (headers as Record<string, string>)['Authorization'] = `Bearer ${newToken}`;
        }
        response = await fetch(url, {
          ...fetchOptions,
          headers,
        });
      }
    }

    const data = await response.json();
    return data as ApiResponse<T>;
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: error instanceof Error ? error.message : 'Network request failed',
      },
    };
  }
}

// ============================================
// CONVENIENCE METHODS
// ============================================

export async function get<T>(endpoint: string, requireAuth = true): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, { method: 'GET', requireAuth });
}

export async function post<T>(
  endpoint: string,
  body: unknown,
  requireAuth = true
): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
    requireAuth,
  });
}

export async function patch<T>(
  endpoint: string,
  body: unknown,
  requireAuth = true
): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(body),
    requireAuth,
  });
}

export async function del<T>(endpoint: string, requireAuth = true): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, { method: 'DELETE', requireAuth });
}

export default {
  get,
  post,
  patch,
  delete: del,
  setTokens,
  getAccessToken,
  getRefreshToken,
  clearTokens,
};
