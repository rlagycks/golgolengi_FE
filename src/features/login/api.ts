import { request } from '../../api/client';
import type { LoginTokens } from '../../context/AuthContext';

const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === 'true';

interface KakaoCallbackResponse {
  access_token: string;
  refresh_token: string;
  user_id: string;
  is_new_user: boolean;
  onboardingCompleted?: boolean;
  onboarding_completed?: boolean;
}

interface MeResponse {
  memberId?: string;
  member_id?: string;
  onboardingCompleted?: boolean;
  onboarding_completed?: boolean;
  familyId?: string | null;
  family_id?: string | null;
}

export interface CurrentMember {
  userId: string;
  onboardingCompleted: boolean;
  familyId: string | null;
}

function normalizeLoginTokens(response: KakaoCallbackResponse): LoginTokens {
  return {
    access_token: response.access_token,
    refresh_token: response.refresh_token,
    user_id: response.user_id,
    is_new_user: response.is_new_user,
    onboardingCompleted:
      response.onboardingCompleted ?? response.onboarding_completed ?? false,
  };
}

function normalizeMe(response: MeResponse): CurrentMember {
  const userId = response.memberId ?? response.member_id;
  if (!userId) {
    throw new Error('User profile response is missing memberId');
  }

  return {
    userId,
    onboardingCompleted:
      response.onboardingCompleted ?? response.onboarding_completed ?? false,
    familyId: response.familyId ?? response.family_id ?? null,
  };
}

export async function postKakaoCallback(kakaoAccessToken: string): Promise<LoginTokens> {
  if (USE_MOCK) {
    return {
      access_token: 'mock_access_token',
      refresh_token: 'mock_refresh_token',
      user_id: 'user_mock_001',
      is_new_user: false,
      onboardingCompleted: true,
    };
  }
  const response = await request<KakaoCallbackResponse>('POST', '/oauth/kakao/callback', {
    kakao_access_token: kakaoAccessToken,
  });
  return normalizeLoginTokens(response);
}

export async function postTermsAgreement(memberId: string): Promise<void> {
  if (USE_MOCK) return;
  await request<void>('POST', '/auth/terms', {
    member_id: memberId,
    terms_agreed: true,
    privacy_agreed: true,
  });
}

export async function getMe(): Promise<CurrentMember> {
  if (USE_MOCK) {
    return {
      userId: 'user_mock_001',
      onboardingCompleted: true,
      familyId: 'family_001',
    };
  }

  const response = await request<MeResponse>('GET', '/auth/me');
  return normalizeMe(response);
}

export async function completeOnboarding(): Promise<void> {
  if (USE_MOCK) return;
  await request<void>('PATCH', '/member/onboarding');
}
