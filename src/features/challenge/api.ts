import type { Challenge, ChallengeCategory, WearableData } from '../../types';

export interface ChallengeListData {
  challenges: Challenge[];
  wearableData: WearableData | null;
}

const MOCK_CHALLENGES: Challenge[] = [
  {
    id: 'c1',
    title: '8,000보 걷기',
    description: '가족 건강을 위한 오늘의 걷기 목표',
    category: 'walk',
    targetValue: 8000,
    currentValue: 6000,
    unit: '보',
    status: 'ongoing',
    isAiRecommended: true,
    isUrgent: true,
    completedCount: 3,
    totalFamilyCount: 4,
    dueDate: new Date().toISOString(),
  },
  {
    id: 'c2',
    title: '물 2L 마시기',
    description: '하루 충분한 수분 섭취',
    category: 'water',
    targetValue: 2000,
    currentValue: 1200,
    unit: 'ml',
    status: 'ongoing',
    isAiRecommended: false,
    isUrgent: false,
    completedCount: 1,
    totalFamilyCount: 4,
    dueDate: new Date().toISOString(),
  },
  {
    id: 'c3',
    title: '11시 전 취침',
    description: '규칙적인 수면 습관 만들기',
    category: 'sleep',
    targetValue: 1,
    currentValue: 0,
    unit: '회',
    status: 'ongoing',
    isAiRecommended: false,
    isUrgent: false,
    completedCount: 2,
    totalFamilyCount: 4,
    dueDate: new Date().toISOString(),
  },
];

export async function fetchChallenges(): Promise<ChallengeListData> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return {
    challenges: MOCK_CHALLENGES,
    wearableData: { steps: 8234, detectedAt: new Date().toISOString() },
  };
}

export async function checkInChallenge(
  challengeId: string,
  value: number,
): Promise<{ success: boolean; newValue: number }> {
  await new Promise((resolve) => setTimeout(resolve, 800));
  return { success: true, newValue: value };
}

export async function postponeChallenge(challengeId: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 300));
}

export { ChallengeCategory };
