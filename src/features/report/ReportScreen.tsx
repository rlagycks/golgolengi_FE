import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../theme';
import { RiskBadge } from '../../components/RiskBadge';
import { Card } from '../../components/Card';
import { LoadingView, ErrorView } from '../../components/StateViews';
import { useReport } from './hooks';
import type { MemberReport, FactorScore, WeeklyDataPoint, RiskFactor } from '../../types';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CHART_HEIGHT = 120;
const CHART_PADDING = Spacing.lg;

const FACTOR_LABELS: Record<RiskFactor, string> = {
  genetic: '유전',
  lifestyle: '생활습관',
  behavior: '행동',
  environment: '환경',
  clinical: '임상',
};

// ─── Tab Bar ───────────────────────────────────────────────────────────────────

function ReportTabs({
  tabs,
  activeIndex,
  onChange,
}: {
  tabs: string[];
  activeIndex: number;
  onChange: (i: number) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.tabScroll}
      contentContainerStyle={styles.tabRow}
    >
      {tabs.map((tab, i) => (
        <Pressable
          key={i}
          style={[styles.tab, activeIndex === i && styles.tabActive]}
          onPress={() => onChange(i)}
        >
          <Text style={[styles.tabText, activeIndex === i && styles.tabTextActive]}>
            {tab}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

// ─── Mini Line Chart ───────────────────────────────────────────────────────────
// Pure RN implementation using View stripes (no SVG dependency)

function MiniLineChart({ data }: { data: WeeklyDataPoint[] }) {
  if (data.length < 2) return null;

  const scores = data.map((d) => d.score);
  const minScore = Math.min(...scores);
  const maxScore = Math.max(...scores);
  const range = maxScore - minScore || 1;
  const chartWidth = SCREEN_WIDTH - CHART_PADDING * 2 - Spacing.lg * 2;
  const step = chartWidth / (data.length - 1);

  const points = scores.map((score, i) => ({
    x: i * step,
    y: CHART_HEIGHT - ((score - minScore) / range) * (CHART_HEIGHT - 20) - 10,
    score,
    date: data[i].date,
  }));

  return (
    <View style={[styles.chartContainer, { height: CHART_HEIGHT + 24 }]}>
      {/* Grid lines */}
      {[0, 0.5, 1].map((t, i) => (
        <View
          key={i}
          style={[styles.gridLine, { top: t * CHART_HEIGHT }]}
        />
      ))}

      {/* Connecting lines (drawn as thin rectangles between points) */}
      {points.slice(0, -1).map((p, i) => {
        const next = points[i + 1];
        const dx = next.x - p.x;
        const dy = next.y - p.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        return (
          <View
            key={i}
            style={[
              styles.line,
              {
                width: length,
                left: p.x,
                top: p.y + 4,
                transform: [{ rotate: `${angle}deg` }],
              },
            ]}
          />
        );
      })}

      {/* Dots + labels */}
      {points.map((p, i) => (
        <View key={i} style={[styles.chartPoint, { left: p.x - 4, top: p.y }]}>
          <View style={styles.dot} />
          <Text style={styles.dotLabel}>{p.score}</Text>
          <Text style={styles.dateLabel}>{p.date}</Text>
        </View>
      ))}
    </View>
  );
}

// ─── Factor Bars ───────────────────────────────────────────────────────────────

const LEVEL_COLORS: Record<string, string> = {
  low: Colors.riskLow,
  warning: Colors.riskWarning,
  high: Colors.riskHigh,
  critical: Colors.riskCritical,
};

function FactorBars({ factors }: { factors: FactorScore[] }) {
  return (
    <View style={styles.factorList}>
      {factors.map((f) => (
        <View key={f.factor} style={styles.factorRow}>
          <View style={styles.factorLabelGroup}>
            <Text style={styles.factorName}>{FACTOR_LABELS[f.factor]}</Text>
            <Text style={styles.factorWeight}>가중치 {f.weight}%</Text>
          </View>
          <View style={styles.factorBarTrack}>
            <View
              style={[
                styles.factorBarFill,
                {
                  width: `${f.score}%`,
                  backgroundColor: LEVEL_COLORS[f.level] ?? Colors.primary,
                },
              ]}
            />
          </View>
          <Text style={[styles.factorScore, { color: LEVEL_COLORS[f.level] ?? Colors.primary }]}>
            {f.score}점
          </Text>
        </View>
      ))}
    </View>
  );
}

// ─── Score Explanation ─────────────────────────────────────────────────────────

function ScoreExplanation({ report }: { report: MemberReport }) {
  return (
    <Card variant="soft">
      <Text style={styles.explainTitle}>점수 영향 요인</Text>
      {report.improvingFactors.length > 0 && (
        <View style={styles.explainGroup}>
          <Text style={styles.explainLabel}>↑ 점수 개선 중</Text>
          <View style={styles.explainChips}>
            {report.improvingFactors.map((f) => (
              <View key={f} style={[styles.explainChip, styles.explainChipGood]}>
                <Text style={styles.explainChipTextGood}>{f}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
      {report.worseningFactors.length > 0 && (
        <View style={styles.explainGroup}>
          <Text style={styles.explainLabel}>↓ 주의 필요</Text>
          <View style={styles.explainChips}>
            {report.worseningFactors.map((f) => (
              <View key={f} style={[styles.explainChip, styles.explainChipBad]}>
                <Text style={styles.explainChipTextBad}>{f}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </Card>
  );
}

// ─── Risk Level Legend ─────────────────────────────────────────────────────────

function RiskLegend() {
  const levels = [
    { range: '0 ~ 30', label: '낮음', color: Colors.riskLow },
    { range: '31 ~ 60', label: '주의', color: Colors.riskWarning },
    { range: '61 ~ 80', label: '높음', color: Colors.riskHigh },
    { range: '81+', label: '위험', color: Colors.riskCritical },
  ];
  return (
    <View style={styles.legendRow}>
      {levels.map((l) => (
        <View key={l.label} style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: l.color }]} />
          <Text style={styles.legendRange}>{l.range}</Text>
          <Text style={styles.legendLabel}>{l.label}</Text>
        </View>
      ))}
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export function ReportScreen() {
  const { state, activeTabIndex, setActiveTabIndex, activeReport, tabs } = useReport();

  if (state.status === 'loading') return <LoadingView />;
  if (state.status === 'error') return <ErrorView message={state.message} />;
  if (!activeReport) return null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.appBar}>
        <Text style={styles.appBarTitle}>건강 리포트</Text>
      </View>

      <ReportTabs tabs={tabs} activeIndex={activeTabIndex} onChange={setActiveTabIndex} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero score card */}
        <Card variant="hero" style={styles.heroCard}>
          <Text style={styles.heroMemberName}>{activeReport.memberName}</Text>
          <View style={styles.heroScoreRow}>
            <Text style={styles.heroScore}>{activeReport.riskScore.score}</Text>
            <View style={styles.heroRight}>
              <RiskBadge score={activeReport.riskScore.score} level={activeReport.riskScore.level} />
              {activeReport.riskScore.delta !== undefined && (
                <Text style={[styles.heroDelta, activeReport.riskScore.delta < 0 && styles.heroDeltaGood]}>
                  {activeReport.riskScore.delta < 0
                    ? `▼${Math.abs(activeReport.riskScore.delta)}점 개선`
                    : `▲${activeReport.riskScore.delta}점 악화`}
                </Text>
              )}
            </View>
          </View>
        </Card>

        {/* Weekly trend chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>주간 추이</Text>
          <Card variant="default">
            <MiniLineChart data={activeReport.weeklyTrend} />
          </Card>
        </View>

        {/* Factor breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>요인별 분석</Text>
          <Card variant="default">
            <FactorBars factors={activeReport.factors} />
          </Card>
        </View>

        {/* Score explanation */}
        <View style={styles.section}>
          <ScoreExplanation report={activeReport} />
        </View>

        {/* Legend */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>리스크 단계</Text>
          <Card variant="default">
            <RiskLegend />
          </Card>
        </View>

        <View style={{ height: Spacing.lg }} />
      </ScrollView>
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

  tabScroll: { backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  tabRow: { paddingHorizontal: Spacing.lg, gap: 0 },
  tab: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: Colors.primary },
  tabText: { ...Typography.labelMD, color: Colors.textSecondary },
  tabTextActive: { color: Colors.primary },

  scroll: { flex: 1 },
  scrollContent: { gap: Spacing.lg, paddingBottom: Spacing.lg },

  heroCard: { marginHorizontal: Spacing.lg, marginTop: Spacing.lg, gap: Spacing.sm },
  heroMemberName: { ...Typography.labelLG, color: 'rgba(255,255,255,0.8)' },
  heroScoreRow: { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.md },
  heroScore: { ...Typography.scoreHero, color: Colors.textInverse, lineHeight: 72 },
  heroRight: { gap: Spacing.xs, paddingBottom: Spacing.sm },
  heroDelta: { ...Typography.bodySM, color: 'rgba(255,255,255,0.8)' },
  heroDeltaGood: { color: '#A7F3D0' },

  section: { paddingHorizontal: Spacing.lg, gap: Spacing.sm },
  sectionTitle: { ...Typography.titleSM, color: Colors.textPrimary },

  chartContainer: {
    position: 'relative',
    width: '100%',
    overflow: 'visible',
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: Colors.borderLight,
  },
  line: {
    position: 'absolute',
    height: 2,
    backgroundColor: Colors.primary,
    transformOrigin: 'left center',
    borderRadius: 1,
  },
  chartPoint: {
    position: 'absolute',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  dotLabel: {
    ...Typography.caption,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginTop: 2,
  },
  dateLabel: {
    ...Typography.caption,
    color: Colors.textTertiary,
    fontSize: 9,
    marginTop: 2,
  },

  factorList: { gap: Spacing.md },
  factorRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  factorLabelGroup: { width: 72, gap: 2 },
  factorName: { ...Typography.labelSM, color: Colors.textPrimary },
  factorWeight: { ...Typography.caption, color: Colors.textTertiary, fontSize: 9 },
  factorBarTrack: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.surfaceVariant,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  factorBarFill: { height: '100%', borderRadius: Radius.full },
  factorScore: { ...Typography.labelSM, width: 36, textAlign: 'right' },

  explainTitle: { ...Typography.titleSM, color: Colors.textPrimary, marginBottom: Spacing.md },
  explainGroup: { gap: Spacing.sm, marginBottom: Spacing.sm },
  explainLabel: { ...Typography.labelMD, color: Colors.textSecondary },
  explainChips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  explainChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  explainChipGood: { backgroundColor: Colors.secondaryContainer },
  explainChipBad: { backgroundColor: Colors.errorContainer },
  explainChipTextGood: { ...Typography.labelSM, color: Colors.success },
  explainChipTextBad: { ...Typography.labelSM, color: Colors.error },

  legendRow: { flexDirection: 'row', justifyContent: 'space-between' },
  legendItem: { alignItems: 'center', gap: 4 },
  legendDot: { width: 12, height: 12, borderRadius: 6 },
  legendRange: { ...Typography.caption, color: Colors.textSecondary, fontSize: 9 },
  legendLabel: { ...Typography.labelSM, color: Colors.textPrimary },
});
