import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Platform,
  StatusBar,
} from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../theme';
import { Chip } from '../../components/Chip';
import { ProgressBar } from '../../components/ProgressBar';
import { Card } from '../../components/Card';
import { LoadingView, ErrorView, EmptyView } from '../../components/StateViews';
import { useChallenges } from './hooks';
import type { Challenge, ChallengeCategory, CheckInMethod } from '../../types';

// ─── Category chips ────────────────────────────────────────────────────────────

const CATEGORIES: Array<{ value: ChallengeCategory; label: string }> = [
  { value: 'all', label: '전체' },
  { value: 'walk', label: '걷기' },
  { value: 'diet', label: '식단' },
  { value: 'sleep', label: '수면' },
  { value: 'water', label: '수분' },
];

function CategoryFilter({
  active,
  onChange,
}: {
  active: ChallengeCategory;
  onChange: (c: ChallengeCategory) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filterRow}
    >
      {CATEGORIES.map((c) => (
        <Chip
          key={c.value}
          label={c.label}
          selected={active === c.value}
          onPress={() => onChange(c.value)}
        />
      ))}
    </ScrollView>
  );
}

// ─── Challenge Card ────────────────────────────────────────────────────────────

function ChallengeCard({
  challenge,
  onCheckIn,
  onPostpone,
}: {
  challenge: Challenge;
  onCheckIn: (c: Challenge) => void;
  onPostpone: (id: string) => void;
}) {
  const progress = challenge.targetValue === 0 ? 0 : challenge.currentValue / challenge.targetValue;
  const isCompleted = challenge.status === 'completed';

  return (
    <Card
      variant="default"
      topAccentColor={challenge.isUrgent ? Colors.accent : undefined}
      style={styles.challengeCard}
    >
      <View style={styles.challengeTop}>
        {challenge.isAiRecommended && (
          <Text style={styles.aiTag}>⚡ AI 추천</Text>
        )}
        <Text style={styles.challengeTitle}>{challenge.title}</Text>
        <Text style={styles.challengeDesc}>{challenge.description}</Text>
      </View>

      <ProgressBar
        value={challenge.currentValue}
        total={challenge.targetValue}
        color={isCompleted ? Colors.success : challenge.isUrgent ? Colors.accent : Colors.primary}
      />
      <View style={styles.progressRow}>
        <Text style={styles.progressLabel}>
          {challenge.currentValue.toLocaleString()} / {challenge.targetValue.toLocaleString()} {challenge.unit}
        </Text>
        <Text style={styles.progressLabel}>{Math.round(progress * 100)}%</Text>
      </View>

      <View style={styles.familyRow}>
        <Text style={styles.familyLabel}>
          가족 {challenge.completedCount}/{challenge.totalFamilyCount}명 완료
        </Text>
      </View>

      {isCompleted ? (
        <View style={styles.completedBadge}>
          <Text style={styles.completedText}>✅ 완료</Text>
        </View>
      ) : (
        <View style={styles.actionRow}>
          {challenge.isUrgent && (
            <Pressable
              style={styles.postponeBtn}
              onPress={() => onPostpone(challenge.id)}
              accessibilityLabel="내일로 미루기"
            >
              <Text style={styles.postponeBtnText}>내일로 미루기</Text>
            </Pressable>
          )}
          <Pressable
            style={styles.checkInBtn}
            onPress={() => onCheckIn(challenge)}
            accessibilityLabel="체크인하기"
          >
            <Text style={styles.checkInBtnText}>체크인하기</Text>
          </Pressable>
        </View>
      )}
    </Card>
  );
}

// ─── Check-In Bottom Sheet ─────────────────────────────────────────────────────

function CheckInSheet({
  challenge,
  wearableSteps,
  visible,
  onClose,
  onSubmit,
  loading,
}: {
  challenge: Challenge | null;
  wearableSteps: number | null;
  visible: boolean;
  onClose: () => void;
  onSubmit: (value: number) => void;
  loading: boolean;
}) {
  const [method, setMethod] = useState<CheckInMethod>('wearable');
  const [manualValue, setManualValue] = useState('');

  if (!challenge) return null;

  const handleSubmit = () => {
    if (method === 'wearable' && wearableSteps !== null) {
      onSubmit(wearableSteps);
    } else {
      const v = Number(manualValue);
      if (v > 0) onSubmit(v);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.overlayTouchable} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>{challenge.title} 체크인</Text>

          {/* Method selector */}
          <View style={styles.methodRow}>
            {(['wearable', 'manual'] as CheckInMethod[]).map((m) => (
              <Pressable
                key={m}
                style={[styles.methodBtn, method === m && styles.methodBtnActive]}
                onPress={() => setMethod(m)}
              >
                <Text style={[styles.methodBtnText, method === m && styles.methodBtnTextActive]}>
                  {m === 'wearable' ? '⌚ 웨어러블' : '✍️ 직접 입력'}
                </Text>
              </Pressable>
            ))}
          </View>

          {method === 'wearable' && wearableSteps !== null ? (
            <View style={styles.wearableInfo}>
              <Text style={styles.wearableValue}>
                {wearableSteps.toLocaleString()} {challenge.unit}
              </Text>
              <Text style={styles.wearableLabel}>감지됨</Text>
            </View>
          ) : (
            <TextInput
              style={styles.manualInput}
              value={manualValue}
              onChangeText={setManualValue}
              keyboardType="numeric"
              placeholder={`${challenge.unit} 입력`}
              placeholderTextColor={Colors.textTertiary}
            />
          )}

          <View style={styles.sheetFooter}>
            <Pressable style={styles.sheetCancelBtn} onPress={onClose}>
              <Text style={styles.sheetCancelText}>취소</Text>
            </Pressable>
            <Pressable
              style={[styles.sheetSubmitBtn, loading && styles.btnDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.sheetSubmitText}>{loading ? '처리 중…' : '완료'}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── Medical Disclaimer ────────────────────────────────────────────────────────

function MedicalDisclaimer() {
  return (
    <Card variant="alert" style={styles.disclaimer}>
      <Text style={styles.disclaimerText}>
        ⚠️ 이 챌린지는 의료 행위가 아니며, 건강 개선을 위한 참고 자료입니다.
        증상이 있을 경우 반드시 의사와 상담하세요.
      </Text>
    </Card>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export function ChallengeScreen() {
  const {
    state,
    filteredChallenges,
    activeCategory,
    setActiveCategory,
    checkIn,
    postpone,
    checkInLoading,
  } = useChallenges();

  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);

  const wearableSteps =
    state.status === 'success' ? (state.data.wearableData?.steps ?? null) : null;

  function handleCheckIn(challenge: Challenge) {
    setSelectedChallenge(challenge);
    setSheetVisible(true);
  }

  async function handleSubmitCheckIn(value: number) {
    if (!selectedChallenge) return;
    await checkIn(selectedChallenge.id, value);
    setSheetVisible(false);
    setSelectedChallenge(null);
  }

  if (state.status === 'loading') return <LoadingView />;
  if (state.status === 'error') return <ErrorView message={state.message} />;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.appBar}>
        <Text style={styles.appBarTitle}>챌린지</Text>
      </View>

      <CategoryFilter active={activeCategory} onChange={setActiveCategory} />

      {filteredChallenges.length === 0 ? (
        <EmptyView message="해당 카테고리의 챌린지가 없습니다." />
      ) : (
        <FlatList
          data={filteredChallenges}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              <ChallengeCard
                challenge={item}
                onCheckIn={handleCheckIn}
                onPostpone={postpone}
              />
            </View>
          )}
          ListFooterComponent={
            <View style={styles.footer}>
              <MedicalDisclaimer />
              <View style={{ height: Spacing.lg }} />
            </View>
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      <CheckInSheet
        challenge={selectedChallenge}
        wearableSteps={wearableSteps}
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        onSubmit={handleSubmitCheckIn}
        loading={checkInLoading}
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

  filterRow: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },

  listContent: { paddingTop: Spacing.sm },
  cardWrapper: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md },

  challengeCard: { gap: Spacing.md },
  challengeTop: { gap: Spacing.xs },
  aiTag: { ...Typography.labelSM, color: Colors.accent },
  challengeTitle: { ...Typography.titleSM, color: Colors.textPrimary },
  challengeDesc: { ...Typography.bodyMD, color: Colors.textSecondary },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  progressLabel: { ...Typography.caption, color: Colors.textSecondary },
  familyRow: { flexDirection: 'row' },
  familyLabel: { ...Typography.bodySM, color: Colors.textTertiary },

  actionRow: { flexDirection: 'row', gap: Spacing.sm, justifyContent: 'flex-end' },
  checkInBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  checkInBtnText: { ...Typography.labelMD, color: Colors.textInverse },
  postponeBtn: {
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  postponeBtnText: { ...Typography.labelMD, color: Colors.textSecondary },
  completedBadge: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.secondaryContainer,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  completedText: { ...Typography.labelMD, color: Colors.success },

  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  overlayTouchable: { flex: 1 },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius['2xl'],
    borderTopRightRadius: Radius['2xl'],
    padding: Spacing.xl,
    paddingBottom: Spacing['4xl'],
    gap: Spacing.lg,
    ...Shadows.lg,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: Radius.full,
    alignSelf: 'center',
    marginBottom: Spacing.xs,
  },
  sheetTitle: { ...Typography.titleMD, color: Colors.textPrimary },
  methodRow: { flexDirection: 'row', gap: Spacing.sm },
  methodBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  methodBtnActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryContainer },
  methodBtnText: { ...Typography.labelMD, color: Colors.textSecondary },
  methodBtnTextActive: { color: Colors.primary },
  wearableInfo: { alignItems: 'center', paddingVertical: Spacing.xl, gap: Spacing.xs },
  wearableValue: { ...Typography.titleXL, color: Colors.primary },
  wearableLabel: { ...Typography.bodyMD, color: Colors.textSecondary },
  manualInput: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    ...Typography.bodyLG,
    color: Colors.textPrimary,
  },
  sheetFooter: { flexDirection: 'row', gap: Spacing.md },
  sheetCancelBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  sheetCancelText: { ...Typography.labelLG, color: Colors.textSecondary },
  sheetSubmitBtn: {
    flex: 2,
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  sheetSubmitText: { ...Typography.labelLG, color: Colors.textInverse },
  btnDisabled: { opacity: 0.4 },

  footer: { paddingHorizontal: Spacing.lg },
  disclaimer: { gap: 0 },
  disclaimerText: { ...Typography.bodySM, color: Colors.textSecondary },
});
