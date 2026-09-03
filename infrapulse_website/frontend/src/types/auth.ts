export type Role = 'USER' | 'STAFF';

export type StaffCategory = 'Structural' | 'Functional' | 'Performance';

export interface UserPublic {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

export interface StaffPublic {
  id: string;
  name: string;
  username: string;
  email?: string | null;
  category: StaffCategory | string;
  role: string;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user?: UserPublic | null;
  staff?: StaffPublic | null;
}

export interface AuthenticatedPrincipal {
  id: string;
  name: string;
  email_or_username: string;
  role: 'USER' | 'STAFF';
  category?: StaffCategory | string | null;
}

export interface UserRegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface UserLoginPayload {
  email: string;
  password: string;
}

export interface StaffLoginPayload {
  username: string;
  password: string;
}
