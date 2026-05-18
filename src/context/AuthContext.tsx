import React, { createContext, useContext, useEffect, useState } from 'react';
import { tokenStorage } from '../storage/tokenStorage';

export interface LoginTokens {
  access_token: string;
  refresh_token: string;
  user_id: string;
  is_new_user: boolean;
}

interface AuthState {
  userId: string | null;
  familyId: string | null;
  isAuthenticated: boolean;
  isOnboarded: boolean;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login(tokens: LoginTokens): Promise<void>;
  setOnboarded(familyId: string): void;
  logout(): Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const FAMILY_ID_KEY = 'fhos_family_id';

import * as SecureStore from 'expo-secure-store';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    userId: null,
    familyId: null,
    isAuthenticated: false,
    isOnboarded: false,
    isLoading: true,
  });

  useEffect(() => {
    (async () => {
      try {
        const [userId, accessToken, familyId] = await Promise.all([
          tokenStorage.getUserId(),
          tokenStorage.getAccessToken(),
          SecureStore.getItemAsync(FAMILY_ID_KEY),
        ]);

        setState({
          userId,
          familyId,
          isAuthenticated: !!accessToken && !!userId,
          isOnboarded: !!familyId,
          isLoading: false,
        });
      } catch {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    })();
  }, []);

  async function login(tokens: LoginTokens): Promise<void> {
    await tokenStorage.saveTokens(tokens.access_token, tokens.refresh_token, tokens.user_id);
    setState(prev => ({
      ...prev,
      userId: tokens.user_id,
      isAuthenticated: true,
      isOnboarded: !tokens.is_new_user,
    }));
  }

  function setOnboarded(familyId: string): void {
    SecureStore.setItemAsync(FAMILY_ID_KEY, familyId);
    setState(prev => ({ ...prev, familyId, isOnboarded: true }));
  }

  async function logout(): Promise<void> {
    await Promise.all([
      tokenStorage.clearTokens(),
      SecureStore.deleteItemAsync(FAMILY_ID_KEY),
    ]);
    setState({
      userId: null,
      familyId: null,
      isAuthenticated: false,
      isOnboarded: false,
      isLoading: false,
    });
  }

  return (
    <AuthContext.Provider value={{ ...state, login, setOnboarded, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
