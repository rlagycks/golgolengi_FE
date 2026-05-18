import React from 'react';
import { View, Text, Pressable, StyleSheet, SafeAreaView } from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../theme';
import { useAuth, type LoginTokens } from '../../context/AuthContext';

export function LoginScreen() {
  const { login } = useAuth();

  async function handleMockLogin() {
    const mockTokens: LoginTokens = {
      access_token: 'mock_access_token',
      refresh_token: 'mock_refresh_token',
      user_id: 'user_mock_001',
      is_new_user: false,
    };
    await login(mockTokens);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.hero}>
          <Text style={styles.logo}>FHOS</Text>
          <Text style={styles.tagline}>가족 건강을 함께 관리하세요</Text>
        </View>

        <View style={styles.buttons}>
          <Pressable style={[styles.socialBtn, styles.googleBtn]} onPress={handleMockLogin}>
            <Text style={styles.socialBtnText}>Google로 시작하기</Text>
          </Pressable>
          <Pressable style={[styles.socialBtn, styles.appleBtn]} onPress={handleMockLogin}>
            <Text style={[styles.socialBtnText, styles.appleBtnText]}>Apple로 시작하기</Text>
          </Pressable>
        </View>

        <Text style={styles.terms}>
          계속하면 서비스 이용약관 및 개인정보처리방침에 동의하는 것으로 간주됩니다.
        </Text>
      </View>
    </SafeAreaView>
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
  hero: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.md },
  logo: { fontSize: 48, fontWeight: '800', color: Colors.primary },
  tagline: { ...Typography.bodyLG, color: Colors.textSecondary, textAlign: 'center' },
  buttons: { gap: Spacing.md },
  socialBtn: {
    borderRadius: Radius.md,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    ...Shadows.sm,
  },
  googleBtn: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  appleBtn: { backgroundColor: '#000' },
  socialBtnText: { ...Typography.labelLG, color: Colors.textPrimary },
  appleBtnText: { color: '#fff' },
  terms: {
    ...Typography.caption,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginTop: Spacing.lg,
  },
});
