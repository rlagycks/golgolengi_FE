import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../theme';
import { RiskBadge } from '../../components/RiskBadge';
import { LoadingView } from '../../components/StateViews';
import { useOnboarding } from './hooks';
import type {
  Relationship,
  HealthCondition,
  EatingHabit,
  HealthGoal,
} from '../../types';

// ─── Step progress bar ────────────────────────────────────────────────────────

function StepProgress({ current, total }: { current: number; total: number }) {
  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: `${((current - 1) / (total - 1)) * 100}%` },
          ]}
        />
        {Array.from({ length: total }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.progressDot,
              i + 1 <= current && styles.progressDotActive,
              i + 1 === current && styles.progressDotCurrent,
            ]}
          />
        ))}
      </View>
      <Text style={styles.progressLabel}>
        {current} / {total}
      </Text>
    </View>
  );
}

// ─── Step footer ──────────────────────────────────────────────────────────────

interface StepFooterProps {
  onNext: () => void;
  onBack?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  loading?: boolean;
}

function StepFooter({
  onNext,
  onBack,
  nextLabel = '다음',
  nextDisabled = false,
  loading = false,
}: StepFooterProps) {
  return (
    <View style={styles.footer}>
      {onBack && (
        <Pressable style={styles.btnSecondary} onPress={onBack}>
          <Text style={styles.btnSecondaryText}>이전</Text>
        </Pressable>
      )}
      <Pressable
        style={[styles.btnPrimary, nextDisabled && styles.btnDisabled, !onBack && { flex: 1 }]}
        onPress={onNext}
        disabled={nextDisabled || loading}
      >
        <Text style={styles.btnPrimaryText}>{loading ? '처리 중…' : nextLabel}</Text>
      </Pressable>
    </View>
  );
}

// ─── Step 1: Welcome ──────────────────────────────────────────────────────────

function Step1Welcome({ onNext }: { onNext: () => void }) {
  return (
    <View style={styles.stepContent}>
      <View style={styles.heroSection}>
        <Text style={styles.welcomeEmoji}>💚</Text>
        <Text style={styles.welcomeTitle}>가족 건강을{'\n'}함께 지켜요</Text>
        <Text style={styles.welcomeSubtitle}>
          AI 기반 가족 리스크 분석으로{'\n'}건강을 예방하고 관리하세요
        </Text>
      </View>
      <View style={styles.socialSection}>
        <Pressable style={[styles.socialBtn, styles.kakaoBtn]} onPress={onNext}>
          <Text style={styles.kakaoBtnText}>카카오로 시작하기</Text>
        </Pressable>
        <Pressable style={[styles.socialBtn, styles.appleBtn]} onPress={onNext}>
          <Text style={styles.appleBtnText}>Apple로 시작하기</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ─── Step 2: PIPA Consent ─────────────────────────────────────────────────────

function Step2Consent({
  onNext,
  onBack,
}: {
  onNext: () => void;
  onBack: () => void;
}) {
  const [agreed, setAgreed] = useState(false);

  return (
    <>
      <View style={styles.stepContent}>
        <Text style={styles.stepTitle}>개인정보 동의</Text>
        <Text style={styles.stepSubtitle}>서비스 이용을 위해 동의가 필요해요</Text>
        <View style={styles.consentList}>
          {CONSENT_ITEMS.map((item, i) => (
            <View key={i} style={styles.consentItem}>
              <Text style={styles.consentDot}>•</Text>
              <Text style={styles.consentText}>{item}</Text>
            </View>
          ))}
        </View>
        <Pressable
          style={styles.consentCheck}
          onPress={() => setAgreed((v) => !v)}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: agreed }}
        >
          <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
            {agreed && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.consentCheckLabel}>
            위 내용에 모두 동의합니다 (필수)
          </Text>
        </Pressable>
      </View>
      <StepFooter onNext={onNext} onBack={onBack} nextDisabled={!agreed} />
    </>
  );
}

const CONSENT_ITEMS = [
  '건강 정보는 AI 분석 목적으로만 사용됩니다',
  '제3자 제공 없이 서비스 내에서만 활용됩니다',
  '언제든지 데이터 삭제를 요청할 수 있습니다',
  '미성년 자녀 데이터는 보호자 동의가 필요합니다',
];

// ─── Step 3: Family Name ──────────────────────────────────────────────────────

function Step3FamilyName({
  value,
  onChange,
  onNext,
  onBack,
}: {
  value: string;
  onChange: (v: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <>
      <View style={styles.stepContent}>
        <Text style={styles.stepTitle}>우리 가족 이름</Text>
        <Text style={styles.stepSubtitle}>가족 그룹 이름을 입력해 주세요</Text>
        <TextInput
          style={styles.textInput}
          value={value}
          onChangeText={onChange}
          placeholder="예: 김씨 가족"
          placeholderTextColor={Colors.textTertiary}
          maxLength={20}
        />
        <Text style={styles.inputHint}>{value.length}/20</Text>
      </View>
      <StepFooter onNext={onNext} onBack={onBack} nextDisabled={value.trim().length === 0} />
    </>
  );
}

// ─── Step 4: Relationship ─────────────────────────────────────────────────────

const RELATIONSHIPS: Array<{ value: Relationship; emoji: string; label: string }> = [
  { value: 'self', emoji: '🙋', label: '본인' },
  { value: 'spouse', emoji: '💑', label: '배우자' },
  { value: 'parent', emoji: '👴', label: '부모' },
  { value: 'child', emoji: '👧', label: '자녀' },
  { value: 'sibling', emoji: '🤝', label: '형제자매' },
  { value: 'other', emoji: '👤', label: '기타' },
];

function Step4Relationship({
  selected,
  onToggle,
  onNext,
  onBack,
}: {
  selected: Relationship[];
  onToggle: (v: Relationship) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <>
      <View style={styles.stepContent}>
        <Text style={styles.stepTitle}>가족 관계 선택</Text>
        <Text style={styles.stepSubtitle}>해당하는 관계를 모두 선택해 주세요</Text>
        <View style={styles.selectionGrid}>
          {RELATIONSHIPS.map((rel) => {
            const isSelected = selected.includes(rel.value);
            return (
              <Pressable
                key={rel.value}
                style={[styles.selectCard, isSelected && styles.selectCardActive]}
                onPress={() => onToggle(rel.value)}
              >
                <Text style={styles.selectCardEmoji}>{rel.emoji}</Text>
                <Text style={[styles.selectCardLabel, isSelected && styles.selectCardLabelActive]}>
                  {rel.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
      <StepFooter onNext={onNext} onBack={onBack} nextDisabled={selected.length === 0} />
    </>
  );
}

// ─── Step 5: Health Info ──────────────────────────────────────────────────────

const CONDITIONS: Array<{ value: HealthCondition; label: string }> = [
  { value: 'hypertension', label: '고혈압' },
  { value: 'diabetes', label: '당뇨' },
  { value: 'heart', label: '심장질환' },
  { value: 'liver', label: '간질환' },
  { value: 'cancer', label: '암' },
  { value: 'none', label: '없음' },
];

function Step5HealthInfo({
  height,
  weight,
  conditions,
  onChangeHeight,
  onChangeWeight,
  onToggleCondition,
  onNext,
  onBack,
}: {
  height: number;
  weight: number;
  conditions: HealthCondition[];
  onChangeHeight: (v: number) => void;
  onChangeWeight: (v: number) => void;
  onToggleCondition: (v: HealthCondition) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <>
      <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.stepTitle}>건강 기본 정보</Text>
        <Text style={styles.stepSubtitle}>정확한 분석을 위해 입력해 주세요</Text>
        <View style={styles.row}>
          <View style={styles.halfInput}>
            <Text style={styles.fieldLabel}>키 (cm)</Text>
            <TextInput
              style={styles.textInput}
              value={height > 0 ? String(height) : ''}
              onChangeText={(v) => onChangeHeight(Number(v) || 0)}
              keyboardType="numeric"
              placeholder="170"
              placeholderTextColor={Colors.textTertiary}
            />
          </View>
          <View style={styles.halfInput}>
            <Text style={styles.fieldLabel}>몸무게 (kg)</Text>
            <TextInput
              style={styles.textInput}
              value={weight > 0 ? String(weight) : ''}
              onChangeText={(v) => onChangeWeight(Number(v) || 0)}
              keyboardType="numeric"
              placeholder="65"
              placeholderTextColor={Colors.textTertiary}
            />
          </View>
        </View>
        <Text style={[styles.fieldLabel, { marginTop: Spacing.xl }]}>기저질환 (복수 선택)</Text>
        <View style={styles.selectionGrid}>
          {CONDITIONS.map((c) => {
            const isSelected = conditions.includes(c.value);
            return (
              <Pressable
                key={c.value}
                style={[styles.conditionChip, isSelected && styles.conditionChipActive]}
                onPress={() => onToggleCondition(c.value)}
              >
                <Text
                  style={[styles.conditionChipText, isSelected && styles.conditionChipTextActive]}
                >
                  {c.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
      <StepFooter onNext={onNext} onBack={onBack} nextDisabled={height === 0 || weight === 0} />
    </>
  );
}

// ─── Step 6: Lifestyle ────────────────────────────────────────────────────────

const EATING_HABITS: Array<{ value: EatingHabit; label: string }> = [
  { value: 'fast', label: '빨리 먹는 편' },
  { value: 'irregular', label: '불규칙한 식사' },
  { value: 'salty', label: '짜게 먹는 편' },
  { value: 'sweet', label: '단 것 선호' },
  { value: 'processed', label: '가공식품 자주 섭취' },
];

function Step6Lifestyle({
  mealDays,
  habits,
  onChangeMealDays,
  onToggleHabit,
  onNext,
  onBack,
}: {
  mealDays: number;
  habits: EatingHabit[];
  onChangeMealDays: (v: number) => void;
  onToggleHabit: (v: EatingHabit) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <>
      <View style={styles.stepContent}>
        <Text style={styles.stepTitle}>생활 습관</Text>
        <Text style={styles.stepSubtitle}>평소 식습관을 알려 주세요</Text>
        <Text style={styles.fieldLabel}>주간 가족 식사 횟수</Text>
        <View style={styles.sliderRow}>
          <Pressable onPress={() => onChangeMealDays(Math.max(0, mealDays - 1))} style={styles.stepperBtn}>
            <Text style={styles.stepperBtnText}>−</Text>
          </Pressable>
          <Text style={styles.sliderValue}>{mealDays}회</Text>
          <Pressable onPress={() => onChangeMealDays(Math.min(7, mealDays + 1))} style={styles.stepperBtn}>
            <Text style={styles.stepperBtnText}>+</Text>
          </Pressable>
        </View>
        <Text style={[styles.fieldLabel, { marginTop: Spacing.xl }]}>식습관 특징</Text>
        <View style={styles.chipWrap}>
          {EATING_HABITS.map((h) => {
            const isSelected = habits.includes(h.value);
            return (
              <Pressable
                key={h.value}
                style={[styles.conditionChip, isSelected && styles.conditionChipActive]}
                onPress={() => onToggleHabit(h.value)}
              >
                <Text
                  style={[styles.conditionChipText, isSelected && styles.conditionChipTextActive]}
                >
                  {h.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
      <StepFooter onNext={onNext} onBack={onBack} />
    </>
  );
}

// ─── Step 7: Daily Rhythm ─────────────────────────────────────────────────────

function Step7Rhythm({
  sleepTime,
  wakeTime,
  onChangeSleep,
  onChangeWake,
  onNext,
  onBack,
}: {
  sleepTime: string;
  wakeTime: string;
  onChangeSleep: (v: string) => void;
  onChangeWake: (v: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <>
      <View style={styles.stepContent}>
        <Text style={styles.stepTitle}>일상 리듬</Text>
        <Text style={styles.stepSubtitle}>평균적인 수면 패턴을 입력해 주세요</Text>
        <Text style={styles.fieldLabel}>취침 시간</Text>
        <TextInput
          style={styles.textInput}
          value={sleepTime}
          onChangeText={onChangeSleep}
          placeholder="23:00"
          placeholderTextColor={Colors.textTertiary}
        />
        <Text style={[styles.fieldLabel, { marginTop: Spacing.xl }]}>기상 시간</Text>
        <TextInput
          style={styles.textInput}
          value={wakeTime}
          onChangeText={onChangeWake}
          placeholder="07:00"
          placeholderTextColor={Colors.textTertiary}
        />
      </View>
      <StepFooter onNext={onNext} onBack={onBack} />
    </>
  );
}

// ─── Step 8: Goals + Completion ───────────────────────────────────────────────

const GOALS: Array<{ value: HealthGoal; emoji: string; label: string }> = [
  { value: 'risk_reduction', emoji: '🎯', label: '건강 리스크 감소' },
  { value: 'weight', emoji: '⚖️', label: '체중 관리' },
  { value: 'sleep', emoji: '😴', label: '수면 개선' },
  { value: 'family_health', emoji: '👨‍👩‍👧', label: '가족 건강 관리' },
  { value: 'habit', emoji: '✅', label: '건강 습관 형성' },
];

function Step8Goals({
  selected,
  onToggle,
  onSubmit,
  onBack,
  isSubmitting,
  initialRiskScore,
  onComplete,
}: {
  selected: HealthGoal[];
  onToggle: (v: HealthGoal) => void;
  onSubmit: () => void;
  onBack: () => void;
  isSubmitting: boolean;
  initialRiskScore?: { score: number; level: 'low' | 'warning' | 'high' | 'critical' };
  onComplete?: () => void;
}) {
  if (initialRiskScore) {
    return (
      <View style={[styles.stepContent, styles.completionContent]}>
        <Text style={styles.completionEmoji}>🎉</Text>
        <Text style={styles.completionTitle}>설정 완료!</Text>
        <Text style={styles.completionSubtitle}>첫 번째 건강 리스크 점수예요</Text>
        <View style={styles.completionCard}>
          <Text style={styles.completionScore}>{initialRiskScore.score}</Text>
          <RiskBadge score={initialRiskScore.score} level={initialRiskScore.level} />
          <Text style={styles.completionHint}>챌린지를 통해 점수를 낮춰보세요!</Text>
        </View>
        <Pressable style={styles.completionBtn} onPress={onComplete}>
          <Text style={styles.completionBtnText}>홈으로 가기</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <>
      <View style={styles.stepContent}>
        <Text style={styles.stepTitle}>건강 목표</Text>
        <Text style={styles.stepSubtitle}>달성하고 싶은 목표를 선택해 주세요</Text>
        <View style={styles.goalList}>
          {GOALS.map((g) => {
            const isSelected = selected.includes(g.value);
            return (
              <Pressable
                key={g.value}
                style={[styles.goalItem, isSelected && styles.goalItemActive]}
                onPress={() => onToggle(g.value)}
              >
                <Text style={styles.goalEmoji}>{g.emoji}</Text>
                <Text style={[styles.goalLabel, isSelected && styles.goalLabelActive]}>
                  {g.label}
                </Text>
                <View style={[styles.goalCheck, isSelected && styles.goalCheckActive]}>
                  {isSelected && <Text style={styles.goalCheckMark}>✓</Text>}
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>
      <StepFooter
        onNext={onSubmit}
        onBack={onBack}
        nextLabel="시작하기"
        nextDisabled={selected.length === 0}
        loading={isSubmitting}
      />
    </>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export function OnboardingScreen({ onComplete }: { onComplete?: (familyId: string) => Promise<void> }) {
  const {
    step,
    totalSteps,
    data,
    updateData,
    nextStep,
    prevStep,
    submit,
    submitState,
  } = useOnboarding();

  const [relationships, setRelationships] = useState<Relationship[]>([]);

  function toggleRelationship(r: Relationship) {
    setRelationships((prev) =>
      prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r],
    );
  }

  function toggleCondition(c: import('../../types').HealthCondition) {
    const conditions = data.healthInfo.conditions.includes(c)
      ? data.healthInfo.conditions.filter((x) => x !== c)
      : [...data.healthInfo.conditions, c];
    updateData({ healthInfo: { ...data.healthInfo, conditions } });
  }

  function toggleHabit(h: EatingHabit) {
    const eatingHabits = data.lifestyle.eatingHabits.includes(h)
      ? data.lifestyle.eatingHabits.filter((x) => x !== h)
      : [...data.lifestyle.eatingHabits, h];
    updateData({ lifestyle: { ...data.lifestyle, eatingHabits } });
  }

  function toggleGoal(g: HealthGoal) {
    const goals = data.goals.includes(g)
      ? data.goals.filter((x) => x !== g)
      : [...data.goals, g];
    updateData({ goals });
  }

  const isSubmitting = submitState.status === 'loading';
  const initialRiskScore =
    submitState.status === 'success' ? submitState.data.initialRiskScore : undefined;

  function renderStep() {
    switch (step) {
      case 1:
        return <Step1Welcome onNext={nextStep} />;
      case 2:
        return <Step2Consent onNext={nextStep} onBack={prevStep} />;
      case 3:
        return (
          <Step3FamilyName
            value={data.familyName}
            onChange={(v) => updateData({ familyName: v })}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 4:
        return (
          <Step4Relationship
            selected={relationships}
            onToggle={toggleRelationship}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 5:
        return (
          <Step5HealthInfo
            height={data.healthInfo.height}
            weight={data.healthInfo.weight}
            conditions={data.healthInfo.conditions}
            onChangeHeight={(v) => updateData({ healthInfo: { ...data.healthInfo, height: v } })}
            onChangeWeight={(v) => updateData({ healthInfo: { ...data.healthInfo, weight: v } })}
            onToggleCondition={toggleCondition}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 6:
        return (
          <Step6Lifestyle
            mealDays={data.lifestyle.mealDaysPerWeek}
            habits={data.lifestyle.eatingHabits}
            onChangeMealDays={(v) =>
              updateData({ lifestyle: { ...data.lifestyle, mealDaysPerWeek: v } })
            }
            onToggleHabit={toggleHabit}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 7:
        return (
          <Step7Rhythm
            sleepTime={data.rhythm.sleepTime}
            wakeTime={data.rhythm.wakeTime}
            onChangeSleep={(v) => updateData({ rhythm: { ...data.rhythm, sleepTime: v } })}
            onChangeWake={(v) => updateData({ rhythm: { ...data.rhythm, wakeTime: v } })}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 8:
        return (
          <Step8Goals
            selected={data.goals}
            onToggle={toggleGoal}
            onSubmit={submit}
            onBack={prevStep}
            isSubmitting={isSubmitting}
            initialRiskScore={initialRiskScore}
            onComplete={
              submitState.status === 'success'
                ? () => onComplete?.(submitState.data.familyId)
                : undefined
            }
          />
        );
      default:
        return null;
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {step > 1 && step < totalSteps && (
          <StepProgress current={step} total={totalSteps} />
        )}
        {isSubmitting && step === 8 ? <LoadingView /> : renderStep()}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1 },

  progressContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
    gap: Spacing.xs,
  },
  progressTrack: {
    height: 4,
    backgroundColor: Colors.surfaceVariant,
    borderRadius: Radius.full,
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  progressDotActive: { backgroundColor: Colors.primary },
  progressDotCurrent: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
    ...Shadows.sm,
  },
  progressLabel: {
    ...Typography.caption,
    color: Colors.textTertiary,
    textAlign: 'right',
  },

  stepContent: { flex: 1, padding: Spacing.lg },
  stepTitle: { ...Typography.titleLG, color: Colors.textPrimary, marginBottom: Spacing.xs },
  stepSubtitle: { ...Typography.bodyMD, color: Colors.textSecondary, marginBottom: Spacing.xl },

  footer: {
    flexDirection: 'row',
    padding: Spacing.lg,
    gap: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  btnPrimary: {
    flex: 2,
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  btnPrimaryText: { ...Typography.labelLG, color: Colors.textInverse },
  btnSecondary: {
    flex: 1,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    minHeight: 48,
    justifyContent: 'center',
  },
  btnSecondaryText: { ...Typography.labelLG, color: Colors.textSecondary },
  btnDisabled: { opacity: 0.4 },

  heroSection: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.lg },
  welcomeEmoji: { fontSize: 64 },
  welcomeTitle: { ...Typography.titleXL, color: Colors.textPrimary, textAlign: 'center' },
  welcomeSubtitle: { ...Typography.bodyLG, color: Colors.textSecondary, textAlign: 'center' },
  socialSection: { gap: Spacing.md, paddingBottom: Spacing.lg },
  socialBtn: {
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
  },
  kakaoBtn: { backgroundColor: '#FEE500' },
  kakaoBtnText: { ...Typography.labelLG, color: '#3C1E1E' },
  appleBtn: { backgroundColor: Colors.textPrimary },
  appleBtnText: { ...Typography.labelLG, color: Colors.textInverse },

  consentList: { gap: Spacing.sm, marginBottom: Spacing.xl },
  consentItem: { flexDirection: 'row', gap: Spacing.sm },
  consentDot: { ...Typography.bodyMD, color: Colors.primary },
  consentText: { ...Typography.bodyMD, color: Colors.textSecondary, flex: 1 },
  consentCheck: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: Radius.sm,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  checkmark: { color: Colors.textInverse, fontSize: 14, fontWeight: '700' },
  consentCheckLabel: { ...Typography.bodyMD, color: Colors.textPrimary },

  textInput: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    ...Typography.bodyLG,
    color: Colors.textPrimary,
    backgroundColor: Colors.surface,
    minHeight: 52,
  },
  inputHint: { ...Typography.caption, color: Colors.textTertiary, textAlign: 'right', marginTop: 4 },
  fieldLabel: { ...Typography.labelLG, color: Colors.textPrimary, marginBottom: Spacing.sm },
  row: { flexDirection: 'row', gap: Spacing.md },
  halfInput: { flex: 1 },

  selectionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  selectCard: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.surface,
    ...Shadows.sm,
  },
  selectCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryContainer,
  },
  selectCardEmoji: { fontSize: 28 },
  selectCardLabel: { ...Typography.labelSM, color: Colors.textSecondary },
  selectCardLabelActive: { color: Colors.primary },

  conditionChip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  conditionChipActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryContainer },
  conditionChipText: { ...Typography.labelMD, color: Colors.textSecondary },
  conditionChipTextActive: { color: Colors.primary },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },

  sliderRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xl, justifyContent: 'center' },
  stepperBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnText: { ...Typography.titleMD, color: Colors.primary },
  sliderValue: { ...Typography.titleLG, color: Colors.textPrimary, minWidth: 60, textAlign: 'center' },

  goalList: { gap: Spacing.md },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    gap: Spacing.md,
    ...Shadows.sm,
  },
  goalItemActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryContainer },
  goalEmoji: { fontSize: 24 },
  goalLabel: { ...Typography.bodyLG, color: Colors.textPrimary, flex: 1 },
  goalLabelActive: { color: Colors.primary, fontWeight: '600' },
  goalCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalCheckActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  goalCheckMark: { color: Colors.textInverse, fontSize: 12, fontWeight: '700' },

  completionContent: { alignItems: 'center', justifyContent: 'center' },
  completionEmoji: { fontSize: 64, marginBottom: Spacing.md },
  completionTitle: { ...Typography.titleXL, color: Colors.textPrimary, marginBottom: Spacing.xs },
  completionSubtitle: { ...Typography.bodyLG, color: Colors.textSecondary, marginBottom: Spacing['2xl'] },
  completionCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing['2xl'],
    alignItems: 'center',
    gap: Spacing.md,
    ...Shadows.md,
    width: '100%',
  },
  completionScore: { ...Typography.scoreHero, color: Colors.textPrimary },
  completionHint: { ...Typography.bodyMD, color: Colors.textSecondary, textAlign: 'center' },
  completionBtn: {
    marginTop: Spacing.xl,
    width: '100%',
    paddingVertical: Spacing.lg,
    borderRadius: Radius.md,
    backgroundColor: Colors.primary,
    alignItems: 'center' as const,
  },
  completionBtnText: { ...Typography.labelLG, color: Colors.textInverse },
});
