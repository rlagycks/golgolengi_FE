import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Switch,
  Modal,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../theme';
import { Avatar } from '../../components/Avatar';
import { RiskBadge } from '../../components/RiskBadge';
import { ProgressBar } from '../../components/ProgressBar';
import { Card } from '../../components/Card';
import { LoadingView, ErrorView } from '../../components/StateViews';
import { useFamilyData } from './hooks';
import type { FamilyMember } from '../../types';
import type { SharingSettings } from './api';

const RELATION_LABELS: Record<string, string> = {
  self: '본인',
  spouse: '배우자',
  parent: '부모',
  child: '자녀',
  sibling: '형제자매',
  other: '기타',
};

// ─── Overview Card ─────────────────────────────────────────────────────────────

function FamilyOverviewCard({
  name,
  streak,
  riskScore,
  habitProgress,
}: {
  name: string;
  streak: number;
  riskScore: { score: number; level: 'low' | 'warning' | 'high' | 'critical' };
  habitProgress: number;
}) {
  return (
    <Card variant="hero" style={styles.overviewCard}>
      <Text style={styles.overviewName}>{name}</Text>
      <View style={styles.overviewStats}>
        <View style={styles.overviewStat}>
          <Text style={styles.overviewStatValue}>{streak}일</Text>
          <Text style={styles.overviewStatLabel}>연속 달성</Text>
        </View>
        <View style={styles.overviewDivider} />
        <View style={styles.overviewStat}>
          <Text style={styles.overviewStatValue}>{riskScore.score}점</Text>
          <Text style={styles.overviewStatLabel}>가족 리스크</Text>
        </View>
        <View style={styles.overviewDivider} />
        <View style={styles.overviewStat}>
          <Text style={styles.overviewStatValue}>{habitProgress}%</Text>
          <Text style={styles.overviewStatLabel}>습관 달성</Text>
        </View>
      </View>
      <ProgressBar value={habitProgress} total={100} color="rgba(255,255,255,0.9)" height={6} />
    </Card>
  );
}

// ─── Member List ───────────────────────────────────────────────────────────────

function MemberList({
  members,
  onRemove,
}: {
  members: FamilyMember[];
  onRemove: (id: string, name: string) => void;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>가족 구성원</Text>
      <Card variant="default" style={styles.noPadCard}>
        {members.map((m, i) => (
          <View
            key={m.id}
            style={[styles.memberRow, i < members.length - 1 && styles.memberDivider]}
          >
            <Avatar name={m.name} size="md" uri={m.avatarUrl} />
            <View style={styles.memberInfo}>
              <Text style={styles.memberName}>
                {m.name} {m.isSelf && '(나)'}
              </Text>
              <Text style={styles.memberMeta}>
                {RELATION_LABELS[m.relationship]} ·{' '}
                {m.sharingStatus === 'sharing'
                  ? '공유중'
                  : m.sharingStatus === 'protected'
                  ? '보호됨'
                  : '제외'}
              </Text>
            </View>
            <RiskBadge score={m.riskScore.score} level={m.riskScore.level} size="sm" />
            {!m.isSelf && (
              <Pressable
                onPress={() => onRemove(m.id, m.name)}
                style={styles.removeBtn}
                accessibilityLabel={`${m.name} 제거`}
              >
                <Text style={styles.removeBtnText}>제외</Text>
              </Pressable>
            )}
          </View>
        ))}
      </Card>
    </View>
  );
}

// ─── Invite Section ────────────────────────────────────────────────────────────

function InviteSection({
  code,
  onCopyCode,
  onRegenerate,
  onCopyLink,
  onShare,
}: {
  code: string;
  onCopyCode: () => void;
  onRegenerate: () => void;
  onCopyLink: () => void;
  onShare: () => void;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>가족 초대</Text>
      <Card variant="soft">
        <View style={styles.inviteRow}>
          <Text style={styles.inviteCode}>{code}</Text>
          <View style={styles.inviteActions}>
            <Pressable style={styles.iconBtn} onPress={onCopyCode} accessibilityLabel="코드 복사">
              <Text style={styles.iconBtnText}>복사</Text>
            </Pressable>
            <Pressable style={styles.iconBtn} onPress={onRegenerate} accessibilityLabel="코드 재생성">
              <Text style={styles.iconBtnText}>재생성</Text>
            </Pressable>
          </View>
        </View>
        <View style={styles.shareRow}>
          <Pressable style={[styles.shareBtn, { flex: 1 }]} onPress={onCopyLink}>
            <Text style={styles.shareBtnText}>링크 복사</Text>
          </Pressable>
          <Pressable style={[styles.shareBtn, styles.kakaoBtn]} onPress={onShare}>
            <Text style={styles.kakaoText}>카카오 공유</Text>
          </Pressable>
        </View>
      </Card>
    </View>
  );
}

// ─── Sharing Settings ──────────────────────────────────────────────────────────

const SHARING_ITEMS: Array<{ key: keyof SharingSettings; label: string }> = [
  { key: 'riskScore', label: '리스크 점수' },
  { key: 'challengeProgress', label: '챌린지 진행' },
  { key: 'healthSurveyDetail', label: '건강 설문 상세' },
];

function SharingSettingsSection({
  settings,
  onChange,
}: {
  settings: SharingSettings;
  onChange: (s: SharingSettings) => void;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>데이터 공유 설정</Text>
      <Card variant="default" style={styles.noPadCard}>
        {SHARING_ITEMS.map((item, i) => (
          <View
            key={item.key}
            style={[styles.settingRow, i < SHARING_ITEMS.length - 1 && styles.memberDivider]}
          >
            <Text style={styles.settingLabel}>{item.label}</Text>
            <Switch
              value={settings[item.key]}
              onValueChange={(val) => onChange({ ...settings, [item.key]: val })}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor={Colors.surface}
            />
          </View>
        ))}
      </Card>
      <Text style={styles.sharingNote}>
        ⓘ 개인정보보호법에 따라 민감한 건강 정보는 별도 동의 없이 공유되지 않습니다.
      </Text>
    </View>
  );
}

// ─── Remove Member Modal ───────────────────────────────────────────────────────

function RemoveMemberModal({
  memberName,
  visible,
  onConfirm,
  onCancel,
}: {
  memberName: string;
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.modalOverlay}>
        <View style={styles.modal}>
          <Text style={styles.modalTitle}>구성원 제외</Text>
          <Text style={styles.modalBody}>
            {memberName}님을 가족 그룹에서 제외할까요?{'\n'}
            제외된 구성원의 데이터는 더 이상 공유되지 않습니다.
          </Text>
          <View style={styles.modalActions}>
            <Pressable style={styles.modalCancelBtn} onPress={onCancel}>
              <Text style={styles.modalCancelText}>취소</Text>
            </Pressable>
            <Pressable style={styles.modalDestructiveBtn} onPress={onConfirm}>
              <Text style={styles.modalDestructiveText}>제외</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export function FamilyScreen() {
  const { state, regenCode, updateSharing, remove } = useFamilyData();
  const [removeTarget, setRemoveTarget] = useState<{ id: string; name: string } | null>(null);

  if (state.status === 'loading') return <LoadingView />;
  if (state.status === 'error') return <ErrorView message={state.message} />;
  if (state.status !== 'success') return null;

  const { family, sharing } = state.data;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.appBar}>
        <Text style={styles.appBarTitle}>가족</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <FamilyOverviewCard
          name={family.name}
          streak={family.streak}
          riskScore={
            family.members.reduce(
              (acc, m) => ({ score: acc.score + m.riskScore.score, level: 'warning' as const }),
              { score: 0, level: 'warning' as const },
            )
          }
          habitProgress={family.habitProgress}
        />

        <MemberList
          members={family.members}
          onRemove={(id, name) => setRemoveTarget({ id, name })}
        />

        <InviteSection
          code={family.inviteCode}
          onCopyCode={() => {}}
          onRegenerate={regenCode}
          onCopyLink={() => {}}
          onShare={() => {}}
        />

        <SharingSettingsSection settings={sharing} onChange={updateSharing} />

        <View style={{ height: Spacing.lg }} />
      </ScrollView>

      <RemoveMemberModal
        memberName={removeTarget?.name ?? ''}
        visible={removeTarget !== null}
        onConfirm={async () => {
          if (removeTarget) {
            await remove(removeTarget.id);
            setRemoveTarget(null);
          }
        }}
        onCancel={() => setRemoveTarget(null)}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  appBar: {
    height: 56,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  appBarTitle: { ...Typography.titleSM, color: Colors.textPrimary },
  scroll: { flex: 1 },
  scrollContent: { gap: Spacing.lg, paddingBottom: Spacing.lg },

  overviewCard: { marginHorizontal: Spacing.lg, marginTop: Spacing.lg, gap: Spacing.lg },
  overviewName: { ...Typography.titleSM, color: 'rgba(255,255,255,0.85)' },
  overviewStats: { flexDirection: 'row', alignItems: 'center' },
  overviewStat: { flex: 1, alignItems: 'center', gap: 4 },
  overviewStatValue: { ...Typography.titleMD, color: Colors.textInverse },
  overviewStatLabel: { ...Typography.caption, color: 'rgba(255,255,255,0.75)' },
  overviewDivider: { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.25)' },

  section: { paddingHorizontal: Spacing.lg, gap: Spacing.sm },
  sectionTitle: { ...Typography.titleSM, color: Colors.textPrimary },
  noPadCard: { padding: 0 },

  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  memberDivider: { borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  memberInfo: { flex: 1, gap: 2 },
  memberName: { ...Typography.labelLG, color: Colors.textPrimary },
  memberMeta: { ...Typography.bodySM, color: Colors.textSecondary },
  removeBtn: {
    borderWidth: 1,
    borderColor: Colors.error,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  removeBtnText: { ...Typography.labelSM, color: Colors.error },

  inviteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  inviteCode: { ...Typography.titleMD, color: Colors.primary, letterSpacing: 2 },
  inviteActions: { flexDirection: 'row', gap: Spacing.sm },
  iconBtn: {
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  iconBtnText: { ...Typography.labelSM, color: Colors.primary },
  shareRow: { flexDirection: 'row', gap: Spacing.sm },
  shareBtn: {
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  shareBtnText: { ...Typography.labelMD, color: Colors.textSecondary },
  kakaoBtn: { flex: 1, backgroundColor: '#FEE500', borderColor: '#FEE500' },
  kakaoText: { ...Typography.labelMD, color: '#3C1E1E' },

  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
  },
  settingLabel: { ...Typography.bodyLG, color: Colors.textPrimary },
  sharingNote: { ...Typography.caption, color: Colors.textSecondary, lineHeight: 18 },

  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  modal: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    width: '100%',
    gap: Spacing.lg,
    ...Shadows.lg,
  },
  modalTitle: { ...Typography.titleMD, color: Colors.textPrimary },
  modalBody: { ...Typography.bodyMD, color: Colors.textSecondary, lineHeight: 22 },
  modalActions: { flexDirection: 'row', gap: Spacing.md },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  modalCancelText: { ...Typography.labelLG, color: Colors.textSecondary },
  modalDestructiveBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.error,
    alignItems: 'center',
  },
  modalDestructiveText: { ...Typography.labelLG, color: Colors.textInverse },
});
