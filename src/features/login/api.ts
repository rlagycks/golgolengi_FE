import { request } from '../../api/client';
import type { LoginTokens } from '../../context/AuthContext';

const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === 'true';

interface OAuthCallbackResponse {
  access_token: string;
  refresh_token: string;
  user_id: string;
  is_new_user: boolean;
}

export async function postGoogleCallback(code: string): Promise<LoginTokens> {
  if (USE_MOCK) {
    return {
      access_token: 'mock_access_token',
      refresh_token: 'mock_refresh_token',
      user_id: 'user_mock_001',
      is_new_user: false,
    };
  }
  return request<OAuthCallbackResponse>('POST', '/oauth/google/callback', { code });
}

export async function postAppleCallback(code: string, id_token: string): Promise<LoginTokens> {
  if (USE_MOCK) {
    return {
      access_token: 'mock_access_token',
      refresh_token: 'mock_refresh_token',
      user_id: 'user_mock_001',
      is_new_user: false,
    };
  }
  return request<OAuthCallbackResponse>('POST', '/oauth/apple/callback', { code, id_token });
}

export async function postTermsAgreement(memberId: string): Promise<void> {
  if (USE_MOCK) return;
  await request<void>('POST', '/auth/terms', {
    member_id: memberId,
    terms_agreed: true,
    privacy_agreed: true,
  });
}

export const GOOGLE_OAUTH_URL = 'https://api.fhos.app/v1/oauth/google/login';
export const APPLE_OAUTH_URL = 'https://api.fhos.app/v1/oauth/apple/login';
