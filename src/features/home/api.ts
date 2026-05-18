import type { FamilyMember, Challenge, Badge, RiskScore } from '../../types';

export interface HomeData {
  userName: string;
  familyName: string;
  familyRiskScore: RiskScore;
  members: FamilyMember[];
  todayStreak: number;
  todayCompletedCount: number;
  todayTotalCount: number;
  urgentChallenge: Challenge | null;
  recentBadges: Badge[];
}

const MOCK_HOME: HomeData = {
  userName: '김철수',
  familyName: '김씨 가족',
  familyRiskScore: { score: 55, level: 'warning', delta: -3 },
  members: [
    {
      id: 'm1',
      name: '김철수',
      relationship: 'self',
      riskScore: { score: 28, level: 'low', delta: -5 },
      sharingStatus: 'sharing',
      isSelf: true,
    },
    {
      id: 'm2',
      name: '김영희',
      relationship: 'parent',
      riskScore: { score: 72, level: 'high', delta: 2 },
      sharingStatus: 'excluded',
      isSelf: false,
    },
    {
      id: 'm3',
      name: '민준',
      relationship: 'child',
      riskScore: { score: 41, level: 'warning', delta: -1 },
      sharingStatus: 'protected',
      isSelf: false,
    },
    {
      id: 'm4',
      name: '박지은',
      relationship: 'spouse',
      riskScore: { score: 35, level: 'warning', delta: -2 },
      sharingStatus: 'sharing',
      isSelf: false,
    },
  ],
  todayStreak: 7,
  todayCompletedCount: 3,
  todayTotalCount: 4,
  urgentChallenge: {
    id: 'c1',
    title: '8,000보 걷기',
    description: '오늘 목표 걸음 수를 채워보세요',
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
  recentBadges: [
    { id: 'b1', key: 'first_challenge', label: '첫 챌린지', icon: '🏅', locked: false, earnedAt: '2025-05-10', description: '첫 챌린지 완료', condition: '챌린지 1회 완료' },
    { id: 'b2', key: 'streak_7', label: '7일 연속', icon: '🔥', locked: false, earnedAt: '2025-05-15', description: '7일 연속 달성', condition: '7일 연속 습관 완료' },
    { id: 'b3', key: 'family_done', label: '가족 완료', icon: '👨‍👩‍👧', locked: true, earnedAt: '', description: '가족 전체 완료', condition: '가족 모두 챌린지 완료' },
  ],
};

export async function fetchHomeData(): Promise<HomeData> {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return MOCK_HOME;
}
