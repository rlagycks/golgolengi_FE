import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../theme';
import { useAuth, type LoginTokens } from '../../context/AuthContext';
import { TermsModal } from './TermsModal';
import { postTermsAgreement } from './api';
import { FhosApiError } from '../../api/client';

const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === 'true';
const KAKAO_REST_API_KEY = process.env.EXPO_PUBLIC_KAKAO_REST_API_KEY ?? '';
const KAKAO_REDIRECT_URI = process.env.EXPO_PUBLIC_KAKAO_REDIRECT_URI ?? '';

const KAKAO_AUTH_URL =
  `https://kauth.kakao.com/oauth/authorize` +
  `?client_id=${KAKAO_REST_API_KEY}` +
  `&redirect_uri=${encodeURIComponent(KAKAO_REDIRECT_URI)}` +
  `&response_type=code`;

export function LoginScreen() {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [pendingTokens, setPendingTokens] = useState<LoginTokens | null>(null);

  async function handleKakaoLogin() {
    if (USE_MOCK) {
      const mockTokens: LoginTokens = {
        access_token: 'mock_access_token',
        refresh_token: 'mock_refresh_token',
        user_id: 'user_mock_001',
        is_new_user: true,
        onboardingCompleted: false,
      };
      setPendingTokens(mockTokens);
      return;
    }

    setLoading(true);
    try {
      const result = await WebBrowser.openAuthSessionAsync(KAKAO_AUTH_URL, 'fhos://');

      if (result.type !== 'success') {
        return;
      }

      const parsed = new URL(result.url);
      const code = parsed.searchParams.get('code');
      if (!code) throw new Error('카카오 인가 코드를 받지 못했습니다.');

      const kakaoAccessToken = await exchangeCodeForToken(code);
      const { postKakaoCallback } = await import('./api');
      const tokens = await postKakaoCallback(kakaoAccessToken);

      if (tokens.is_new_user) {
        setPendingTokens(tokens);
      } else {
        await login(tokens);
      }
    } catch (err) {
      const message =
        err instanceof FhosApiError ? err.message : '로그인 중 오류가 발생했습니다.';
      Alert.alert('로그인 실패', message);
    } finally {
      setLoading(false);
    }
  }

  async function handleTermsAgree() {
    if (!pendingTokens) return;
    try {
      await postTermsAgreement(pendingTokens.user_id);
      await login(pendingTokens);
      setPendingTokens(null);
    } catch (err) {
      const message =
        err instanceof FhosApiError ? err.message : '약관 동의 처리 중 오류가 발생했습니다.';
      Alert.alert('오류', message);
    }
  }

  function handleTermsClose() {
    setPendingTokens(null);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.hero}>
          <Text style={styles.logo}>FHOS</Text>
          <Text style={styles.subtitle}>Family Health OS</Text>
          <Text style={styles.tagline}>가족 건강을 함께 관리하세요</Text>
        </View>

        <View style={styles.buttons}>
          <Pressable style={styles.kakaoBtn} onPress={handleKakaoLogin} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.kakaoBtnText}>카카오로 시작하기</Text>
            )}
          </Pressable>
        </View>

        <Text style={styles.terms}>
          계속하면 서비스 이용약관 및 개인정보처리방침에{'\n'}동의하는 것으로 간주됩니다.
        </Text>
      </View>

      <TermsModal
        visible={pendingTokens !== null}
        onAgree={handleTermsAgree}
        onClose={handleTermsClose}
      />
    </SafeAreaView>
  );
}

async function exchangeCodeForToken(code: string): Promise<string> {
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: KAKAO_REST_API_KEY,
    redirect_uri: KAKAO_REDIRECT_URI,
    code,
  });

  const res = await fetch('https://kauth.kakao.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  if (!res.ok) throw new Error('카카오 토큰 교환 실패');
  const data = await res.json() as { access_token?: string };
  if (!data.access_token) throw new Error('카카오 access_token 없음');
  return data.access_token;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: {
    flex: 1,
    paddingHorizontal: Spacing['2xl'],
    justifyContent: 'space-between',
    paddingVertical: Spacing['2xl'],
  },
  hero: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.sm },
  logo: { fontSize: 52, fontWeight: '800', color: Colors.primary, letterSpacing: -1 },
  subtitle: { ...Typography.labelMD, color: Colors.primary, opacity: 0.7 },
  tagline: { ...Typography.bodyLG, color: Colors.textSecondary, textAlign: 'center', marginTop: Spacing.sm },
  buttons: { gap: Spacing.md },
  kakaoBtn: {
    backgroundColor: '#FEE500',
    borderRadius: Radius.md,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    height: 52,
    justifyContent: 'center',
    ...Shadows.sm,
  },
  kakaoBtnText: { ...Typography.labelLG, color: '#000' },
  terms: {
    ...Typography.caption,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginTop: Spacing.lg,
    lineHeight: 18,
  },
});
