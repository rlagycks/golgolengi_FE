import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../theme';
import { Avatar } from '../../components/Avatar';
import { RiskBadge } from '../../components/RiskBadge';
import { ProgressBar } from '../../components/ProgressBar';
import { Card } from '../../components/Card';
import { LoadingView, ErrorView } from '../../components/StateViews';
import { useHomeData } from './hooks';
import type { FamilyMember, Badge, Challenge } from '../../types';

// ─── Family Risk Hero Card ─────────────────────────────────────────────────────

function FamilyRiskCard({
  score,
  level,
  delta,
  familyName,
  members,
}: {
  score: number;
  level: 'low' | 'warning' | 'high' | 'critical';
  delta?: number;
  familyName: string;
  members: FamilyMember[];
}) {
  const deltaLabel =
    delta === undefined ? '' : delta < 0 ? `▼${Math.abs(delta)}점 개선` : `▲${delta}점 악화`;

  return (
    <View style={styles.heroCard}>
      <Text style={styles.heroFamilyName}>{familyName}</Text>
      <View style={styles.heroScoreRow}>
        <Text style={styles.heroScore}>{score}</Text>
        <View style={styles.heroScoreRight}>
          <RiskBadge score={score} level={level} />
          {delta !== undefined && (
            <Text style={[styles.heroDelta, delta < 0 && styles.heroDeltaGood]}>
              {deltaLabel}
            </Text>
          )}
        </View>
      </View>
      <Text style={styles.heroLabel}>가족 통합 건강 리스크</Text>
      <View style={styles.miniMembers}>
        {members.map((m) => (
          <View key={m.id} style={styles.miniMember}>
            <Avatar name={m.name} size="sm" uri={m.avatarUrl} />
            <View
              style={[
                styles.miniScore,
                {
                  backgroundColor:
                    m.riskScore.level === 'low' ? Colors.riskLow
                    : m.riskScore.level === 'warning' ? Colors.riskWarning
                    : m.riskScore.level === 'high' ? Colors.riskHigh
                    : Colors.riskCritical,
                },
              ]}
            >
              <Text style={styles.miniScoreText}>{m.riskScore.score}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── Info Chips ────────────────────────────────────────────────────────────────

function InfoChips({
  streak,
  completedCount,
  totalCount,
}: {
  streak: number;
  completedCount: number;
  totalCount: number;
}) {
  return (
    <View style={styles.chipRow}>
      <View style={styles.infoPill}>
        <Text style={styles.infoPillText}>🔥 {streak}일 연속 스트리크</Text>
      </View>
      <View style={styles.infoPill}>
        <Text style={styles.infoPillText}>
          오늘 {completedCount}/{totalCount}명 완료
        </Text>
      </View>
    </View>
  );
}

// ─── Urgent Challenge Card ─────────────────────────────────────────────────────

function UrgentChallengeCard({
  challenge,
  onCheckIn,
}: {
  challenge: Challenge;
  onCheckIn: () => void;
}) {
  return (
    <Card variant="default" topAccentColor={Colors.accent} style={styles.challengeCard}>
      <View style={styles.challengeHeader}>
        <View>
          <Text style={styles.challengeTag}>⚡ AI 추천 오늘의 챌린지</Text>
          <Text style={styles.challengeTitle}>{challenge.title}</Text>
          <Text style={styles.challengeDesc}>{challenge.description}</Text>
        </View>
      </View>
      <View style={styles.challengeProgress}>
        <ProgressBar
          value={challenge.currentValue}
          total={challenge.targetValue}
          color={Colors.accent}
        />
        <View style={styles.challengeProgressLabels}>
          <Text style={styles.challengeProgressText}>
            {challenge.currentValue.toLocaleString()} / {challenge.targetValue.toLocaleString()} {challenge.unit}
          </Text>
          <Text style={styles.challengeProgressText}>
            {Math.round((challenge.currentValue / challenge.targetValue) * 100)}%
          </Text>
        </View>
      </View>
      <View style={styles.challengeFooter}>
        <Text style={styles.challengeFamily}>
          가족 {challenge.completedCount}/{challenge.totalFamilyCount}명 완료
        </Text>
        <Pressable style={styles.checkInBtn} onPress={onCheckIn}>
          <Text style={styles.checkInBtnText}>체크인하기</Text>
        </Pressable>
      </View>
    </Card>
  );
}

// ─── Family Status List ────────────────────────────────────────────────────────

function FamilyStatusList({ members }: { members: FamilyMember[] }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>가족 현황</Text>
      <Card variant="default" style={styles.noPadCard}>
        {members.map((m, i) => (
          <View key={m.id} style={[styles.memberRow, i < members.length - 1 && styles.memberDivider]}>
            <Avatar name={m.name} size="md" uri={m.avatarUrl} />
            <View style={styles.memberInfo}>
              <Text style={styles.memberName}>
                {m.name} {m.isSelf && '(나)'}
              </Text>
              <Text style={styles.memberRelation}>
                {RELATION_LABELS[m.relationship]} ·{' '}
                {m.sharingStatus === 'sharing'
                  ? '공유중'
                  : m.sharingStatus === 'protected'
                  ? '보호됨'
                  : '제외'}
              </Text>
            </View>
            <RiskBadge score={m.riskScore.score} level={m.riskScore.level} size="sm" />
          </View>
        ))}
      </Card>
    </View>
  );
}

const RELATION_LABELS: Record<string, string> = {
  self: '본인',
  spouse: '배우자',
  parent: '부모',
  child: '자녀',
  sibling: '형제자매',
  other: '기타',
};

// ─── Badge Grid ────────────────────────────────────────────────────────────────

function BadgeGrid({ badges }: { badges: Badge[] }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>배지</Text>
      <View style={styles.badgeGrid}>
        {badges.map((b) => (
          <View key={b.id} style={[styles.badgeItem, b.locked && styles.badgeItemLocked]}>
            <Text style={[styles.badgeIcon, b.locked && styles.badgeIconLocked]}>
              {b.locked ? '🔒' : b.icon}
            </Text>
            <Text style={[styles.badgeTitle, b.locked && styles.badgeTitleLocked]}>
              {b.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export function HomeScreen() {
  const { state, refresh } = useHomeData();

  if (state.status === 'loading') return <LoadingView />;
  if (state.status === 'error') return <ErrorView message={state.message} />;
  if (state.status === 'empty') return null;

  const { data } = state;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.appBar}>
        <Text style={styles.appBarTitle}>안녕하세요, {data.userName}님</Text>
        <Pressable onPress={refresh} accessibilityLabel="새로고침">
          <Text style={styles.refreshIcon}>↻</Text>
        </Pressable>
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <FamilyRiskCard
          score={data.familyRiskScore.score}
          level={data.familyRiskScore.level}
          delta={data.familyRiskScore.delta}
          familyName={data.familyName}
          members={data.members}
        />

        <InfoChips
          streak={data.todayStreak}
          completedCount={data.todayCompletedCount}
          totalCount={data.todayTotalCount}
        />

        {data.urgentChallenge && (
          <View style={styles.section}>
            <UrgentChallengeCard
              challenge={data.urgentChallenge}
              onCheckIn={() => {}}
            />
          </View>
        )}

        <FamilyStatusList members={data.members} />

        <BadgeGrid badges={data.recentBadges} />

        <View style={{ height: Spacing.lg }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },

  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    height: 56,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  appBarTitle: { ...Typography.titleSM, color: Colors.textPrimary },
  refreshIcon: { fontSize: 20, color: Colors.textSecondary },

  scroll: { flex: 1 },
  scrollContent: { gap: Spacing.lg, paddingBottom: Spacing.lg },

  heroCard: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    backgroundColor: Colors.primary,
    borderRadius: Radius.xl,
    padding: Spacing['2xl'],
    gap: Spacing.sm,
    ...Shadows.lg,
  },
  heroFamilyName: { ...Typography.labelLG, color: 'rgba(255,255,255,0.8)' },
  heroScoreRow: { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.md },
  heroScore: { ...Typography.scoreHero, color: Colors.textInverse, lineHeight: 72 },
  heroScoreRight: { gap: Spacing.xs, paddingBottom: Spacing.sm },
  heroDelta: { ...Typography.bodySM, color: 'rgba(255,255,255,0.8)' },
  heroDeltaGood: { color: '#A7F3D0' },
  heroLabel: { ...Typography.bodySM, color: 'rgba(255,255,255,0.7)' },
  miniMembers: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  miniMember: { alignItems: 'center', gap: 4 },
  miniScore: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  miniScoreText: { ...Typography.labelSM, color: Colors.textInverse, fontSize: 10 },

  chipRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    flexWrap: 'wrap',
  },
  infoPill: {
    backgroundColor: Colors.primaryContainer,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
  },
  infoPillText: { ...Typography.labelMD, color: Colors.primary },

  section: { paddingHorizontal: Spacing.lg, gap: Spacing.sm },
  sectionTitle: { ...Typography.titleSM, color: Colors.textPrimary },

  challengeCard: { gap: Spacing.md },
  challengeHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  challengeTag: { ...Typography.labelSM, color: Colors.accent, marginBottom: Spacing.xs },
  challengeTitle: { ...Typography.titleSM, color: Colors.textPrimary },
  challengeDesc: { ...Typography.bodyMD, color: Colors.textSecondary, marginTop: 2 },
  challengeProgress: { gap: Spacing.xs },
  challengeProgressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  challengeProgressText: { ...Typography.caption, color: Colors.textSecondary },
  challengeFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  challengeFamily: { ...Typography.bodySM, color: Colors.textSecondary },
  checkInBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  checkInBtnText: { ...Typography.labelMD, color: Colors.textInverse },

  noPadCard: { padding: 0 },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  memberDivider: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  memberInfo: { flex: 1, gap: 2 },
  memberName: { ...Typography.labelLG, color: Colors.textPrimary },
  memberRelation: { ...Typography.bodySM, color: Colors.textSecondary },

  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  badgeItem: {
    width: '30%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    gap: Spacing.xs,
    ...Shadows.sm,
  },
  badgeItemLocked: { backgroundColor: Colors.surfaceVariant },
  badgeIcon: { fontSize: 32 },
  badgeIconLocked: { opacity: 0.4 },
  badgeTitle: { ...Typography.labelSM, color: Colors.textPrimary, textAlign: 'center' },
  badgeTitleLocked: { color: Colors.textTertiary },
});
