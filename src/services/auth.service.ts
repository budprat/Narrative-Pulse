import api, { setTokens, clearTokens } from './api';
import type { User, AuthResponse, RegisterInput, LoginInput } from '@/types/api';

export async function register(input: RegisterInput): Promise<{ user: User } | { error: string }> {
  const response = await api.post<AuthResponse>('/auth/register', input, false);

  if (response.success && response.data) {
    setTokens(response.data.accessToken, response.data.refreshToken);
    return { user: response.data.user };
  }

  return { error: response.error?.message || 'Registration failed' };
}

export async function login(input: LoginInput): Promise<{ user: User } | { error: string }> {
  const response = await api.post<AuthResponse>('/auth/login', input, false);

  if (response.success && response.data) {
    setTokens(response.data.accessToken, response.data.refreshToken);
    return { user: response.data.user };
  }

  return { error: response.error?.message || 'Login failed' };
}

export async function logout(): Promise<void> {
  const refreshToken = localStorage.getItem('refreshToken');
  if (refreshToken) {
    await api.post('/auth/logout', { refreshToken }, false);
  }
  clearTokens();
}

export async function getCurrentUser(): Promise<User | null> {
  const response = await api.get<User>('/auth/me');

  if (response.success && response.data) {
    return response.data;
  }

  return null;
}

export async function updateProfile(data: { name?: string; avatar?: string }): Promise<User | null> {
  const response = await api.patch<User>('/auth/profile', data);

  if (response.success && response.data) {
    return response.data;
  }

  return null;
}

export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  const response = await api.post<{ message: string }>('/auth/change-password', {
    currentPassword,
    newPassword,
  });

  if (response.success) {
    return { success: true };
  }

  return { success: false, error: response.error?.message || 'Failed to change password' };
}

export default {
  register,
  login,
  logout,
  getCurrentUser,
  updateProfile,
  changePassword,
};
