import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Modal,
  StyleSheet,
  SafeAreaView,
  Alert,
  Platform,
  StatusBar,
} from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../theme';
import { Avatar } from '../../components/Avatar';
import { RiskBadge } from '../../components/RiskBadge';
import { Card } from '../../components/Card';
import { LoadingView, ErrorView } from '../../components/StateViews';
import { useMyData } from './hooks';
import type { Badge, RankingEntry, StreakDay } from '../../types';

// ─── Profile Hero ─────────────────────────────────────────────────────────────

function ProfileHero({
  name,
  familyName,
  riskScore,
}: {
  name: string;
  familyName: string;
  riskScore: { score: number; level: 'low' | 'warning' | 'high' | 'critical'; delta?: number };
}) {
  return (
    <Card variant="hero" style={styles.heroCard}>
      <View style={styles.heroProfile}>
        <Avatar name={name} size="lg" />
        <View style={styles.heroInfo}>
          <Text style={styles.heroName}>{name}</Text>
          <Text style={styles.heroSub}>본인 · {familyName}</Text>
        </View>
      </View>

      <View style={styles.heroDivider} />

      <View style={styles.heroScoreRow}>
        <View>
          <Text style={styles.heroScore}>{riskScore.score}</Text>
          <Text style={styles.heroScoreLabel}>내 리스크 점수</Text>
        </View>
        <View style={styles.heroRight}>
          <RiskBadge score={riskScore.score} level={riskScore.level} />
          {riskScore.delta !== undefined && (
            <Text style={[styles.heroDelta, riskScore.delta < 0 && styles.heroDeltaGood]}>
              지난달 대비 {riskScore.delta < 0 ? `▼${Math.abs(riskScore.delta)}점` : `▲${riskScore.delta}점`}
            </Text>
          )}
        </View>
      </View>
    </Card>
  );
}

// ─── Metric Grid ──────────────────────────────────────────────────────────────

function MetricGrid({
  streak,
  monthlyBadgeCount,
}: {
  streak: number;
  monthlyBadgeCount: number;
}) {
  return (
    <View style={styles.metricGrid}>
      <View style={[styles.metric, { backgroundColor: Colors.streakBg }]}>
        <Text style={[styles.metricValue, { color: Colors.streak }]}>{streak}일</Text>
        <Text style={styles.metricLabel}>현재 스트리크</Text>
      </View>
      <View style={[styles.metric, { backgroundColor: Colors.primaryContainer }]}>
        <Text style={[styles.metricValue, { color: Colors.onPrimaryContainer }]}>{monthlyBadgeCount}개</Text>
        <Text style={styles.metricLabel}>이번 달 배지</Text>
      </View>
    </View>
  );
}

// ─── Badge Collection ─────────────────────────────────────────────────────────

const BADGE_BG: Record<string, string> = {
  first_challenge: Colors.secondaryContainer,
  streak_7: Colors.streakBg,
  streak_30: Colors.streakBg,
  risk_improved: Colors.primaryContainer,
  family_complete: Colors.surfaceVariant,
};

const BADGE_TEXT: Record<string, string> = {
  first_challenge: Colors.secondary,
  streak_7: Colors.streak,
  streak_30: Colors.streak,
  risk_improved: Colors.primary,
  family_complete: Colors.textSecondary,
};

function BadgeCollection({
  badges,
  onBadgePress,
}: {
  badges: Badge[];
  onBadgePress: (badge: Badge) => void;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>배지 컬렉션</Text>
      <View style={styles.badgeGrid}>
        {badges.map((badge) => (
          <Pressable
            key={badge.id}
            style={[styles.badgeCard, badge.locked && styles.badgeCardLocked]}
            onPress={() => onBadgePress(badge)}
          >
            <View
              style={[
                styles.badgeIcon,
                { backgroundColor: badge.locked ? Colors.surfaceVariant : (BADGE_BG[badge.key] ?? Colors.primaryContainer) },
              ]}
            >
              <Text
                style={[
                  styles.badgeIconText,
                  { color: badge.locked ? Colors.textTertiary : (BADGE_TEXT[badge.key] ?? Colors.primary) },
                ]}
              >
                {badge.icon}
              </Text>
            </View>
            <Text style={[styles.badgeLabel, badge.locked && styles.badgeLabelLocked]}>
              {badge.key}
            </Text>
            <Text style={styles.badgeCaption}>
              {badge.locked ? badge.condition : badge.earnedAt}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

// ─── Monthly Ranking ──────────────────────────────────────────────────────────

const LEVEL_COLORS: Record<string, string> = {
  low: Colors.riskLow,
  warning: Colors.riskWarning,
  high: Colors.riskHigh,
  critical: Colors.riskCritical,
};

const LEVEL_LABELS: Record<string, string> = {
  low: '낮음',
  warning: '주의',
  high: '위험',
  critical: '위험',
};

function MonthlyRanking({ ranking }: { ranking: RankingEntry[] }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>이번 달 랭킹</Text>
      <Card variant="default" style={styles.noPadCard}>
        {ranking.map((entry, i) => (
          <View
            key={entry.memberId}
            style={[
              styles.rankingItem,
              entry.isSelf && styles.rankingItemSelf,
              i < ranking.length - 1 && styles.rankingDivider,
            ]}
          >
            <View style={styles.rankingInfo}>
              <Text style={[styles.rankingTitle, entry.isSelf && styles.rankingTitleSelf]}>
                {entry.rank}위 · {entry.memberName}
              </Text>
              <Text style={styles.rankingMeta}>
                {entry.score}점 {LEVEL_LABELS[entry.level]} ·{' '}
                {entry.delta < 0
                  ? `▼${Math.abs(entry.delta)}점 개선`
                  : `▲${entry.delta}점 상승`}
              </Text>
            </View>
            <View
              style={[
                styles.rankBadge,
                { backgroundColor: LEVEL_COLORS[entry.level] + '22', borderColor: LEVEL_COLORS[entry.level] + '44' },
              ]}
            >
              <Text style={[styles.rankBadgeText, { color: LEVEL_COLORS[entry.level] }]}>
                {entry.isSelf ? '나' : `${entry.rank}위`}
              </Text>
            </View>
          </View>
        ))}
      </Card>
    </View>
  );
}

// ─── Streak Calendar ──────────────────────────────────────────────────────────

function StreakCalendar({ days }: { days: StreakDay[] }) {
  return (
    <View style={styles.section}>
      <Card variant="soft">
        <Text style={styles.sectionTitle}>스트리크 히스토리</Text>
        <Text style={styles.calendarSub}>이번 달 달성 현황</Text>
        <View style={styles.calendarGrid}>
          {days.map((d) => (
            <View
              key={d.date}
              style={[
                styles.calendarCell,
                d.done && styles.calendarCellDone,
                d.isToday && styles.calendarCellToday,
              ]}
            >
              <Text
                style={[
                  styles.calendarText,
                  d.done && styles.calendarTextDone,
                  d.isToday && styles.calendarTextToday,
                ]}
              >
                {d.date}
              </Text>
            </View>
          ))}
        </View>
      </Card>
    </View>
  );
}

// ─── Settings List ────────────────────────────────────────────────────────────

function SettingsList({ onDeleteAccount }: { onDeleteAccount: () => void }) {
  return (
    <View style={styles.section}>
      <Card variant="default" style={styles.noPadCard}>
        <Pressable style={[styles.settingItem, styles.settingDivider]}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>설정</Text>
            <Text style={styles.settingMeta}>알림, 데이터 공유, 약관 보기</Text>
          </View>
          <Text style={styles.settingLink}>열기</Text>
        </Pressable>

        <Pressable
          style={[styles.settingItem, styles.deleteItem]}
          onPress={onDeleteAccount}
        >
          <View style={styles.settingInfo}>
            <Text style={[styles.settingTitle, styles.deleteTitle]}>계정 탈퇴</Text>
            <Text style={styles.settingMeta}>탈퇴 시 데이터는 90일 후 자동 파기됩니다</Text>
          </View>
          <Text style={styles.deleteLink}>입력 확인</Text>
        </Pressable>
      </Card>
    </View>
  );
}

// ─── Badge Detail Modal ───────────────────────────────────────────────────────

function BadgeDetailModal({
  badge,
  visible,
  onClose,
}: {
  badge: Badge | null;
  visible: boolean;
  onClose: () => void;
}) {
  if (!badge) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modal}>
          <View
            style={[
              styles.modalBadgeIcon,
              { backgroundColor: badge.locked ? Colors.surfaceVariant : (BADGE_BG[badge.key] ?? Colors.primaryContainer) },
            ]}
          >
            <Text
              style={[
                styles.modalBadgeIconText,
                { color: badge.locked ? Colors.textTertiary : (BADGE_TEXT[badge.key] ?? Colors.primary) },
              ]}
            >
              {badge.icon}
            </Text>
          </View>

          <Text style={styles.modalBadgeKey}>{badge.key}</Text>
          <Text style={styles.modalBadgeDesc}>{badge.description}</Text>

          <Card variant="soft" style={styles.modalConditionCard}>
            <Text style={styles.modalConditionTitle}>달성 조건</Text>
            <Text style={styles.modalConditionText}>{badge.condition}</Text>
            {!badge.locked && badge.earnedAt ? (
              <Text style={styles.modalConditionDate}>달성일: {badge.earnedAt}</Text>
            ) : null}
          </Card>

          <Pressable style={styles.modalCloseBtn} onPress={onClose}>
            <Text style={styles.modalCloseBtnText}>닫기</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export function MyScreen() {
  const { state } = useMyData();
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  if (state.status === 'loading') return <LoadingView />;
  if (state.status === 'error') return <ErrorView message={state.message} />;
  if (state.status !== 'success') return null;

  const { profile, badges, ranking, streakDays } = state.data;

  const handleDeleteAccount = () => {
    Alert.alert(
      '계정 탈퇴',
      '정말 탈퇴하시겠습니까?\n탈퇴 시 데이터는 90일 후 자동 파기됩니다.',
      [
        { text: '취소', style: 'cancel' },
        { text: '탈퇴', style: 'destructive', onPress: () => {} },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.appBar}>
        <Text style={styles.appBarTitle}>마이</Text>
        <Text style={styles.appBarSub}>내 리스크와 배지, 랭킹 요약</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ProfileHero
          name={profile.name}
          familyName={profile.familyName}
          riskScore={profile.riskScore}
        />

        <MetricGrid streak={profile.currentStreak} monthlyBadgeCount={profile.monthlyBadgeCount} />

        <BadgeCollection badges={badges} onBadgePress={setSelectedBadge} />

        <MonthlyRanking ranking={ranking} />

        <StreakCalendar days={streakDays} />

        <SettingsList onDeleteAccount={handleDeleteAccount} />

        <View style={{ height: Spacing.lg }} />
      </ScrollView>

      <BadgeDetailModal
        badge={selectedBadge}
        visible={selectedBadge !== null}
        onClose={() => setSelectedBadge(null)}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  appBar: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  appBarTitle: { ...Typography.titleSM, color: Colors.textPrimary },
  appBarSub: { ...Typography.caption, color: Colors.textSecondary, marginTop: 2 },
  scroll: { flex: 1 },
  scrollContent: { gap: Spacing.lg, paddingBottom: Spacing.lg },

  heroCard: { marginHorizontal: Spacing.lg, marginTop: Spacing.lg, gap: Spacing.md },
  heroProfile: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  heroInfo: { gap: 4 },
  heroName: { ...Typography.titleMD, color: Colors.textInverse },
  heroSub: { ...Typography.bodySM, color: 'rgba(255,255,255,0.75)' },
  heroDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.2)' },
  heroScoreRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  heroScore: { fontSize: 38, fontWeight: '700', color: Colors.textInverse, lineHeight: 46 },
  heroScoreLabel: { ...Typography.bodySM, color: 'rgba(255,255,255,0.75)' },
  heroRight: { alignItems: 'flex-end', gap: Spacing.xs },
  heroDelta: { ...Typography.bodySM, color: 'rgba(255,255,255,0.8)' },
  heroDeltaGood: { color: Colors.primary },

  metricGrid: {
    flexDirection: 'row',
    marginHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  metric: {
    flex: 1,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  metricValue: { ...Typography.titleLG, fontWeight: '700' },
  metricLabel: { ...Typography.caption, color: Colors.textSecondary },

  section: { paddingHorizontal: Spacing.lg, gap: Spacing.sm },
  sectionTitle: { ...Typography.titleSM, color: Colors.textPrimary },
  noPadCard: { padding: 0 },

  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  badgeCard: {
    width: '18%',
    minWidth: 60,
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  badgeCardLocked: { opacity: 0.5 },
  badgeIcon: {
    width: 48,
    height: 48,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeIconText: { ...Typography.titleSM, fontWeight: '700' },
  badgeLabel: { ...Typography.caption, color: Colors.textPrimary, textAlign: 'center', fontSize: 9 },
  badgeLabelLocked: { color: Colors.textTertiary },
  badgeCaption: { fontSize: 9, color: Colors.textTertiary, textAlign: 'center' },

  rankingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  rankingItemSelf: { backgroundColor: Colors.primaryContainer + '55' },
  rankingDivider: { borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  rankingInfo: { flex: 1, gap: 2 },
  rankingTitle: { ...Typography.labelLG, color: Colors.textPrimary },
  rankingTitleSelf: { color: Colors.primary },
  rankingMeta: { ...Typography.bodySM, color: Colors.textSecondary },
  rankBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  rankBadgeText: { ...Typography.labelSM, fontWeight: '700' },

  calendarSub: { ...Typography.caption, color: Colors.textSecondary, marginTop: 4, marginBottom: Spacing.md },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  calendarCell: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceVariant,
  },
  calendarCellDone: { backgroundColor: Colors.primaryContainer },
  calendarCellToday: { backgroundColor: Colors.primary },
  calendarText: { ...Typography.labelSM, color: Colors.textTertiary },
  calendarTextDone: { color: Colors.primary },
  calendarTextToday: { color: Colors.textInverse },

  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  settingDivider: { borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  settingInfo: { flex: 1, gap: 2 },
  settingTitle: { ...Typography.labelLG, color: Colors.textPrimary },
  settingMeta: { ...Typography.bodySM, color: Colors.textSecondary },
  settingLink: { ...Typography.labelMD, color: Colors.primary },
  deleteItem: {
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.16)',
    borderRadius: 0,
  },
  deleteTitle: { color: Colors.error },
  deleteLink: { ...Typography.labelMD, color: Colors.error },

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
    alignItems: 'center',
    gap: Spacing.md,
    ...Shadows.lg,
  },
  modalBadgeIcon: {
    width: 64,
    height: 64,
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBadgeIconText: { fontSize: 24, fontWeight: '700' },
  modalBadgeKey: { ...Typography.titleMD, color: Colors.textPrimary },
  modalBadgeDesc: { ...Typography.bodyMD, color: Colors.textSecondary, textAlign: 'center' },
  modalConditionCard: { width: '100%', gap: Spacing.sm },
  modalConditionTitle: { ...Typography.labelLG, color: Colors.textPrimary },
  modalConditionText: { ...Typography.bodySM, color: Colors.textSecondary, lineHeight: 20 },
  modalConditionDate: { ...Typography.bodySM, color: Colors.textTertiary, marginTop: Spacing.xs },
  modalCloseBtn: {
    width: '100%',
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  modalCloseBtnText: { ...Typography.labelLG, color: Colors.textSecondary },
});
