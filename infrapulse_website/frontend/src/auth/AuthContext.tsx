import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  AuthenticatedPrincipal,
  UserLoginPayload,
  StaffLoginPayload,
  UserRegisterPayload,
} from '../types/auth';
import {
  loginUser as apiLoginUser,
  loginStaff as apiLoginStaff,
  registerUser as apiRegisterUser,
  getMe as apiGetMe,
  logoutUser as apiLogoutUser,
} from '../api/auth';
import { getStoredToken, setStoredToken } from '../api/client';

export interface AuthContextType {
  token: string | null;
  principal: AuthenticatedPrincipal | null;
  role: 'USER' | 'STAFF' | null;
  category: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  loginUser: (payload: UserLoginPayload) => Promise<AuthenticatedPrincipal>;
  loginStaff: (payload: StaffLoginPayload) => Promise<AuthenticatedPrincipal>;
  registerUser: (payload: UserRegisterPayload) => Promise<AuthenticatedPrincipal>;
  logout: () => Promise<void>;
  refreshPrincipal: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [principal, setPrincipal] = useState<AuthenticatedPrincipal | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchPrincipal = useCallback(async (authToken?: string) => {
    const activeToken = authToken || getStoredToken();
    if (!activeToken) {
      setPrincipal(null);
      setIsLoading(false);
      return;
    }

    try {
      const me = await apiGetMe();
      setPrincipal(me);
    } catch {
      // Invalid/expired token
      setStoredToken(null);
      setToken(null);
      setPrincipal(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrincipal();
  }, [fetchPrincipal]);

  const loginUser = async (payload: UserLoginPayload): Promise<AuthenticatedPrincipal> => {
    setIsLoading(true);
    try {
      const res = await apiLoginUser(payload);
      setStoredToken(res.access_token);
      setToken(res.access_token);
      const me = await apiGetMe();
      setPrincipal(me);
      return me;
    } finally {
      setIsLoading(false);
    }
  };

  const loginStaff = async (payload: StaffLoginPayload): Promise<AuthenticatedPrincipal> => {
    setIsLoading(true);
    try {
      const res = await apiLoginStaff(payload);
      setStoredToken(res.access_token);
      setToken(res.access_token);
      const me = await apiGetMe();
      setPrincipal(me);
      return me;
    } finally {
      setIsLoading(false);
    }
  };

  const registerUser = async (payload: UserRegisterPayload): Promise<AuthenticatedPrincipal> => {
    setIsLoading(true);
    try {
      const res = await apiRegisterUser(payload);
      setStoredToken(res.access_token);
      setToken(res.access_token);
      const me = await apiGetMe();
      setPrincipal(me);
      return me;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await apiLogoutUser();
    } finally {
      setStoredToken(null);
      setToken(null);
      setPrincipal(null);
    }
  };

  const role = principal?.role || null;
  const category = principal?.category || null;
  const isAuthenticated = Boolean(token && principal);

  return (
    <AuthContext.Provider
      value={{
        token,
        principal,
        role,
        category,
        isLoading,
        isAuthenticated,
        loginUser,
        loginStaff,
        registerUser,
        logout,
        refreshPrincipal: fetchPrincipal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      principal: null,
      token: null,
      role: null,
      category: null,
      isAuthenticated: false,
      isLoading: false,
      loginUser: async () => { throw new Error('No AuthProvider'); },
      loginStaff: async () => { throw new Error('No AuthProvider'); },
      registerUser: async () => { throw new Error('No AuthProvider'); },
      logout: async () => {},
      refreshPrincipal: async () => {},
    };
  }
  return context;
}
