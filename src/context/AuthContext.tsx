import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { tokenStorage } from '../storage/tokenStorage';
import { setAuthFailureCallback } from '../api/client';
import { getMe } from '../features/login/api';

export interface LoginTokens {
  access_token: string;
  refresh_token: string;
  user_id: string;
  is_new_user: boolean;
  onboardingCompleted: boolean;
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
  setOnboarded(familyId: string): Promise<void>;
  logout(): Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const FAMILY_ID_KEY = 'fhos_family_id';

async function persistFamilyId(familyId: string | null): Promise<void> {
  if (familyId) {
    await SecureStore.setItemAsync(FAMILY_ID_KEY, familyId);
    return;
  }

  await SecureStore.deleteItemAsync(FAMILY_ID_KEY);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    userId: null,
    familyId: null,
    isAuthenticated: false,
    isOnboarded: false,
    isLoading: true,
  });

  useEffect(() => {
    setAuthFailureCallback(logout);

    (async () => {
      try {
        const [userId, accessToken, cachedFamilyId] = await Promise.all([
          tokenStorage.getUserId(),
          tokenStorage.getAccessToken(),
          SecureStore.getItemAsync(FAMILY_ID_KEY),
        ]);

        if (!accessToken || !userId) {
          setState({
            userId: null,
            familyId: null,
            isAuthenticated: false,
            isOnboarded: false,
            isLoading: false,
          });
          return;
        }

        try {
          const me = await getMe();
          await persistFamilyId(me.familyId);

          setState({
            userId: me.userId,
            familyId: me.familyId,
            isAuthenticated: true,
            isOnboarded: me.onboardingCompleted,
            isLoading: false,
          });
          return;
        } catch {
          // Fall back to locally cached state when profile restoration fails transiently.
        }

        setState({
          userId,
          familyId: cachedFamilyId,
          isAuthenticated: true,
          isOnboarded: !!cachedFamilyId,
          isLoading: false,
        });
      } catch {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    })();
  }, []);

  async function login(tokens: LoginTokens): Promise<void> {
    await tokenStorage.saveTokens(tokens.access_token, tokens.refresh_token, tokens.user_id);

    let familyId: string | null = null;
    if (tokens.onboardingCompleted) {
      const me = await getMe();
      familyId = me.familyId;
    }

    await persistFamilyId(familyId);

    setState(prev => ({
      ...prev,
      userId: tokens.user_id,
      familyId,
      isAuthenticated: true,
      isOnboarded: tokens.onboardingCompleted,
    }));
  }

  async function setOnboarded(familyId: string): Promise<void> {
    await persistFamilyId(familyId);
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
