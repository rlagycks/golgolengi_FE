import { request } from '../../api/client';
import { riskLevelFromScore } from '../../utils';
import type { OnboardingData, RiskScore } from '../../types';
import { completeOnboarding as patchCompleteOnboarding } from '../login/api';

export interface OnboardingSubmitResult {
  familyId: string;
  initialRiskScore: RiskScore;
}

function calcSleepHours(sleepTime: string, wakeTime: string): number {
  const [sh, sm] = sleepTime.split(':').map(Number);
  const [wh, wm] = wakeTime.split(':').map(Number);
  let diffMins = wh * 60 + wm - (sh * 60 + sm);
  if (diffMins < 0) diffMins += 24 * 60;
  return Math.round(diffMins / 60);
}

export async function submitOnboarding(data: OnboardingData): Promise<OnboardingSubmitResult> {
  // 1. 건강 프로필 + 질환 정보 생성
  const conditions = data.healthInfo.conditions.filter((c) => c !== 'none');
  const profile = await request<{ profileId: string }>('POST', '/health-profiles', {
    conditions,
  });

  // 2. 생활 습관 저장
  const sleepHours = calcSleepHours(data.rhythm.sleepTime, data.rhythm.wakeTime);
  const poorDiet = data.lifestyle.eatingHabits.some((h) =>
    ['processed', 'salty', 'sweet'].includes(h),
  );
  await request('PATCH', `/health-profiles/${profile.profileId}/lifestyle`, {
    smoker: false,
    drinkingFrequency: 'low',
    exerciseFrequency: data.lifestyle.mealDaysPerWeek >= 5 ? 'high' : 'medium',
    dietQuality: poorDiet ? 'poor' : 'good',
    sleepHours,
  });

  // 3. 가족 그룹 생성
  const family = await request<{ familyId: string; name: string; inviteCode: string }>(
    'POST',
    '/families',
    { name: data.familyName },
  );

  // 4. 리스크 점수 계산
  const risk = await request<{ totalScore: number }>('POST', '/risk-scores/calculate');

  return {
    familyId: family.familyId,
    initialRiskScore: {
      score: Math.round(risk.totalScore),
      level: riskLevelFromScore(risk.totalScore),
      delta: 0,
    },
  };
}

export async function completeOnboarding(): Promise<void> {
  await patchCompleteOnboarding();
}
