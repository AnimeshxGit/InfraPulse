import { apiClient } from './client';
import {
  TokenResponse,
  UserRegisterPayload,
  UserLoginPayload,
  StaffLoginPayload,
  AuthenticatedPrincipal,
} from '../types/auth';

export async function registerUser(payload: UserRegisterPayload): Promise<TokenResponse> {
  return apiClient<TokenResponse>('/api/v1/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function loginUser(payload: UserLoginPayload): Promise<TokenResponse> {
  return apiClient<TokenResponse>('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function loginStaff(payload: StaffLoginPayload): Promise<TokenResponse> {
  return apiClient<TokenResponse>('/api/v1/auth/staff/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getMe(): Promise<AuthenticatedPrincipal> {
  return apiClient<AuthenticatedPrincipal>('/api/v1/auth/me', {
    method: 'GET',
  });
}

export async function logoutUser(): Promise<void> {
  try {
    await apiClient<void>('/api/v1/auth/logout', {
      method: 'POST',
    });
  } catch {
    // Ignore server error on logout
  }
}
