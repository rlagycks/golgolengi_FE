import React from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../theme';

interface TermsModalProps {
  visible: boolean;
  onAgree: () => void;
}

export function TermsModal({ visible, onAgree }: TermsModalProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <SafeAreaView style={styles.sheet}>
          <View style={styles.content}>
            <Text style={styles.title}>서비스 이용 동의</Text>
            <Text style={styles.desc}>
              FHOS를 이용하시려면 아래 약관에 동의해주세요.
            </Text>

            <View style={styles.termsList}>
              <TermsRow label="서비스 이용약관 동의" required />
              <TermsRow label="개인정보 처리방침 동의" required />
              <TermsRow label="건강 데이터 수집 · 이용 동의" required />
              <TermsRow label="가족 간 건강 데이터 공유 동의" required />
            </View>

            <Pressable style={styles.agreeBtn} onPress={onAgree}>
              <Text style={styles.agreeBtnText}>모두 동의하고 시작하기</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

function TermsRow({ label, required }: { label: string; required?: boolean }) {
  return (
    <View style={styles.termRow}>
      <View style={styles.termCheck}>
        <Text style={styles.termCheckText}>✓</Text>
      </View>
      <Text style={styles.termLabel}>
        {label}
        {required && <Text style={styles.required}> (필수)</Text>}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    ...Shadows.lg,
  },
  content: {
    padding: Spacing['2xl'],
    gap: Spacing.lg,
  },
  title: { ...Typography.titleMD, color: Colors.textPrimary },
  desc: { ...Typography.bodyMD, color: Colors.textSecondary },
  termsList: { gap: Spacing.md },
  termRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  termCheck: {
    width: 24,
    height: 24,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  termCheckText: { color: Colors.textInverse, fontSize: 12, fontWeight: '700' },
  termLabel: { ...Typography.bodyMD, color: Colors.textPrimary, flex: 1 },
  required: { color: Colors.primary },
  agreeBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    marginTop: Spacing.sm,
    ...Shadows.sm,
  },
  agreeBtnText: { ...Typography.labelLG, color: Colors.textInverse },
});
