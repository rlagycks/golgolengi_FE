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
import { makeRedirectUri } from 'expo-auth-session';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../theme';
import { useAuth, type LoginTokens } from '../../context/AuthContext';
import { TermsModal } from './TermsModal';
import {
  postGoogleCallback,
  postAppleCallback,
  postTermsAgreement,
  GOOGLE_OAUTH_URL,
  APPLE_OAUTH_URL,
} from './api';
import { FhosApiError } from '../../api/client';

WebBrowser.maybeCompleteAuthSession();

const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === 'true';

const REDIRECT_URI = makeRedirectUri({ scheme: 'fhos', path: 'oauth/callback' });

type OAuthProvider = 'google' | 'apple';

export function LoginScreen() {
  const { login } = useAuth();
  const [loading, setLoading] = useState<OAuthProvider | null>(null);
  const [pendingTokens, setPendingTokens] = useState<LoginTokens | null>(null);

  async function handleOAuth(provider: OAuthProvider) {
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

    setLoading(provider);
    try {
      const oauthUrl =
        provider === 'google'
          ? `${GOOGLE_OAUTH_URL}?redirect_uri=${encodeURIComponent(REDIRECT_URI)}`
          : `${APPLE_OAUTH_URL}?redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;

      const result = await WebBrowser.openAuthSessionAsync(oauthUrl, REDIRECT_URI);

      if (result.type !== 'success') return;

      const url = new URL(result.url);
      const code = url.searchParams.get('code');
      const idToken = url.searchParams.get('id_token') ?? '';

      if (!code) {
        Alert.alert('로그인 오류', '인증 코드를 받지 못했습니다. 다시 시도해주세요.');
        return;
      }

      const tokens =
        provider === 'google'
          ? await postGoogleCallback(code)
          : await postAppleCallback(code, idToken);

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
      setLoading(null);
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
          <SocialButton
            label="Google로 시작하기"
            style={styles.googleBtn}
            textStyle={styles.googleBtnText}
            loading={loading === 'google'}
            onPress={() => handleOAuth('google')}
          />
          <SocialButton
            label="Apple로 시작하기"
            style={styles.appleBtn}
            textStyle={styles.appleBtnText}
            loading={loading === 'apple'}
            onPress={() => handleOAuth('apple')}
          />
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

function SocialButton({
  label,
  style,
  textStyle,
  loading,
  onPress,
}: {
  label: string;
  style: object;
  textStyle?: object;
  loading: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={[styles.socialBtn, style]} onPress={onPress} disabled={loading}>
      {loading ? (
        <ActivityIndicator color={Colors.textSecondary} />
      ) : (
        <Text style={[styles.socialBtnText, textStyle]}>{label}</Text>
      )}
    </Pressable>
  );
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
  socialBtn: {
    borderRadius: Radius.md,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    height: 52,
    justifyContent: 'center',
    ...Shadows.sm,
  },
  googleBtn: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  appleBtn: { backgroundColor: '#000' },
  socialBtnText: { ...Typography.labelLG, color: Colors.textPrimary },
  googleBtnText: { color: Colors.textPrimary },
  appleBtnText: { color: '#fff' },
  terms: {
    ...Typography.caption,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginTop: Spacing.lg,
    lineHeight: 18,
  },
});
