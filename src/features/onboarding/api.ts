import { request } from '../../api/client';
import { tokenStorage } from '../../storage/tokenStorage';
export { completeOnboarding } from '../login/api';
import type {
  OnboardingData,
  RiskScore,
  RiskLevel,
  HealthCondition,
  EatingHabit,
  HealthGoal,
} from '../../types';

const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === 'true';

export interface OnboardingSubmitResult {
  familyId: string;
  initialRiskScore: RiskScore;
}

const CONDITION_CODE: Record<Exclude<HealthCondition, 'none'>, string> = {
  hypertension: 'HTN',
  diabetes: 'DM2',
  heart: 'HRT',
  liver: 'LVR',
  cancer: 'CA',
};

const GOAL_TYPE: Record<HealthGoal, string> = {
  risk_reduction: 'risk_reduction',
  weight: 'diet',
  sleep: 'sleep',
  family_health: 'family_health',
  habit: 'habit',
};

function toTakeoutFreq(habits: EatingHabit[]): 'rarely' | 'sometimes' | 'often' {
  if (habits.includes('processed')) return 'often';
  if (habits.includes('irregular')) return 'sometimes';
  return 'rarely';
}

function toRiskLevel(raw: string): RiskLevel {
  const valid: RiskLevel[] = ['low', 'warning', 'high', 'critical'];
  if (valid.includes(raw as RiskLevel)) return raw as RiskLevel;
  throw new Error(`Unexpected risk_level from server: "${raw}"`);
}

interface FamilyCreateResponse {
  family_id: string;
  invite_code: string;
}

interface HealthProfileCreateResponse {
  health_profile_id: string;
}

interface RiskCalculateResponse {
  score: number;
  risk_level: string;
}

export async function submitOnboarding(data: OnboardingData): Promise<OnboardingSubmitResult> {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    return {
      familyId: 'family_001',
      initialRiskScore: { score: 55, level: 'warning', delta: 0 },
    };
  }

  const memberId = await tokenStorage.getUserId();
  if (!memberId) throw new Error('인증 정보가 없습니다. 다시 로그인해주세요.');

  // Step 1: 개인정보 동의
  await request<void>('POST', '/consents', {
    member_id: memberId,
    health_data: true,
    family_share: true,
    marketing: false,
  });

  // Step 2a: 가족 생성
  const { family_id: familyId } = await request<FamilyCreateResponse>('POST', '/families', {
    family_name: data.familyName,
  });

  // Step 2b: 생성자를 self로 가족에 등록
  await request<void>('POST', '/family-members', {
    family_id: familyId,
    member_id: memberId,
    relation_type: 'self',
  });

  // Step 2c: 추가 가족 구성원 슬롯 등록 (초대 대기 상태, member_id 없음)
  const additionalMembers = data.members.filter((m) => m.relationship !== 'self');
  if (additionalMembers.length > 0) {
    await Promise.all(
      additionalMembers.map((m) =>
        request<void>('POST', '/family-members', {
          family_id: familyId,
          relation_type: m.relationship,
        }),
      ),
    );
  }

  // Step 3: 신체 정보 등록
  const { health_profile_id: healthProfileId } = await request<HealthProfileCreateResponse>(
    'POST',
    '/health-profiles',
    {
      member_id: memberId,
      height: data.healthInfo.height,
      weight: data.healthInfo.weight,
      birth_date: data.healthInfo.birthDate,
      gender: data.healthInfo.gender,
    },
  );

  // Step 4: 현재 질환 등록 (none 제외)
  const conditionBodies = data.healthInfo.conditions
    .filter((c): c is Exclude<HealthCondition, 'none'> => c !== 'none')
    .map((c) => ({ condition_code: CONDITION_CODE[c] }));
  if (conditionBodies.length > 0) {
    await request<void>(
      'POST',
      `/health-profiles/${healthProfileId}/conditions`,
      conditionBodies,
    );
  }

  // Step 5: 가족력 — 온보딩에서 미수집, 생략

  // Step 6: 생활습관 + 생활리듬
  await request<void>('PATCH', `/health-profiles/${healthProfileId}/lifestyle`, {
    shared_meals_per_week: data.lifestyle.mealDaysPerWeek,
    takeout_freq: toTakeoutFreq(data.lifestyle.eatingHabits),
    sleep_time: data.rhythm.sleepTime,
    wake_time: data.rhythm.wakeTime,
    weekend_sleep_diff: 0,
  });

  // Step 7: 건강 목표 등록 (독립적 → 병렬 호출)
  await Promise.all(
    data.goals.map((goal) =>
      request<void>('POST', '/goals', {
        member_id: memberId,
        family_id: familyId,
        goal_type: GOAL_TYPE[goal],
      }),
    ),
  );

  // Step 8: 리스크 점수 계산
  const riskResp = await request<RiskCalculateResponse>('POST', '/risk-scores/calculate', {
    member_id: memberId,
  });

  return {
    familyId,
    initialRiskScore: {
      score: riskResp.score,
      level: toRiskLevel(riskResp.risk_level),
      delta: 0,
    },
  };
}
