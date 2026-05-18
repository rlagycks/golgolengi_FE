import type { UserProfile, Badge, RankingEntry, StreakDay } from '../../types';

export interface MyData {
  profile: UserProfile;
  badges: Badge[];
  ranking: RankingEntry[];
  streakDays: StreakDay[];
}

const BADGES: Badge[] = [
  {
    id: 'b1',
    key: 'first_challenge',
    label: '첫 챌린지',
    icon: '첫',
    earnedAt: '2026.05.01',
    locked: false,
    description: '첫 번째 챌린지를 완료하면 수여됩니다.',
    condition: '챌린지 1회 완료',
  },
  {
    id: 'b2',
    key: 'streak_7',
    label: 'streak_7',
    icon: '7',
    earnedAt: '2026.05.05',
    locked: false,
    description: '7일 연속 챌린지 달성',
    condition: '가족 챌린지를 7일 연속으로 완료하면 이 배지가 수여됩니다.',
  },
  {
    id: 'b3',
    key: 'risk_improved',
    label: 'risk_improved',
    icon: '개',
    earnedAt: '2026.05.07',
    locked: false,
    description: '리스크 점수 개선',
    condition: '리스크 점수를 10점 이상 낮추면 수여됩니다.',
  },
  {
    id: 'b4',
    key: 'streak_30',
    label: 'streak_30',
    icon: '30',
    earnedAt: '',
    locked: true,
    description: '30일 연속 챌린지 달성',
    condition: '30일 연속 필요',
  },
  {
    id: 'b5',
    key: 'family_complete',
    label: 'family_complete',
    icon: '전',
    earnedAt: '',
    locked: true,
    description: '가족 전원 챌린지 완료',
    condition: '전원 완료 시 획득',
  },
];

const RANKING: RankingEntry[] = [
  { rank: 1, memberId: 'm1', memberName: '김철수', score: 28, level: 'low', delta: -5, isSelf: true },
  { rank: 2, memberId: 'm3', memberName: '민준', score: 41, level: 'warning', delta: -2, isSelf: false },
  { rank: 3, memberId: 'm2', memberName: '김영희', score: 62, level: 'high', delta: 1, isSelf: false },
];

const STREAK_DAYS: StreakDay[] = Array.from({ length: 14 }, (_, i) => ({
  date: i + 1,
  done: i < 7,
  isToday: i === 6,
}));

const MOCK_MY_DATA: MyData = {
  profile: {
    id: 'm1',
    name: '김철수',
    familyName: '김철수 가족',
    relationship: 'self',
    riskScore: { score: 28, level: 'low', delta: -5 },
    currentStreak: 7,
    monthlyBadgeCount: 3,
  },
  badges: BADGES,
  ranking: RANKING,
  streakDays: STREAK_DAYS,
};

export async function fetchMyData(): Promise<MyData> {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return MOCK_MY_DATA;
}

export async function deleteAccount(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 1000));
}
