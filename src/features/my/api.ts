import * as SecureStore from 'expo-secure-store';
import { tokenStorage } from '../../storage/tokenStorage';
import { request } from '../../api/client';
import { riskLevelFromString, BADGE_META } from '../../utils';
import type { UserProfile, Badge, RankingEntry, StreakDay } from '../../types';

const FAMILY_ID_KEY = 'fhos_family_id';

export interface MyData {
  profile: UserProfile;
  badges: Badge[];
  ranking: RankingEntry[];
  streakDays: StreakDay[];
}

interface BackendMemberRiskSummary {
  memberId: string;
  totalScore: number;
  riskLevel: string;
}

interface BackendRanking {
  rank: number;
  memberId: string;
  name: string;
  profileImageUrl?: string;
  totalScore: number;
  riskLevel: string;
}

interface BackendBadge {
  badgeType: string;
  awardedAt: string;
}

interface BackendMe {
  memberId: string;
  name: string;
  familyId: string | null;
  onboardingCompleted: boolean;
}

interface BackendOverview {
  familyId: string;
  name: string;
}

export async function fetchMyData(): Promise<MyData> {
  const [userId, familyId] = await Promise.all([
    tokenStorage.getUserId(),
    SecureStore.getItemAsync(FAMILY_ID_KEY),
  ]);

  if (!userId) throw new Error('인증 정보가 없습니다.');

  const [me, riskSummary, badgesRes, rankingRes, overview] = await Promise.all([
    request<BackendMe>('GET', '/auth/me'),
    request<BackendMemberRiskSummary>('GET', `/members/${userId}/risk-summary`).catch(() => null),
    request<BackendBadge[]>('GET', '/badges').catch(() => [] as BackendBadge[]),
    familyId
      ? request<BackendRanking[]>('GET', `/families/${familyId}/ranking`).catch(
          () => [] as BackendRanking[],
        )
      : Promise.resolve([] as BackendRanking[]),
    familyId
      ? request<BackendOverview>('GET', `/families/${familyId}/overview`).catch(() => null)
      : Promise.resolve(null),
  ]);

  const score = riskSummary ? Math.round(riskSummary.totalScore) : 0;
  const level = riskSummary ? riskLevelFromString(riskSummary.riskLevel) : 'low';

  const profile: UserProfile = {
    id: userId,
    name: me.name ?? '',
    familyName: overview?.name ?? '',
    relationship: 'self',
    riskScore: { score, level },
    currentStreak: 0,
    monthlyBadgeCount: badgesRes.length,
  };

  const badges: Badge[] = badgesRes.map((b, i) => {
    const meta = BADGE_META[b.badgeType] ?? {
      label: b.badgeType,
      icon: '🏆',
      description: '',
      condition: '',
    };
    return {
      id: `badge_${i}`,
      key: b.badgeType,
      label: meta.label,
      icon: meta.icon,
      earnedAt: b.awardedAt ? new Date(b.awardedAt).toLocaleDateString('ko-KR') : '',
      locked: false,
      description: meta.description,
      condition: meta.condition,
    };
  });

  const ranking: RankingEntry[] = rankingRes.map((r) => ({
    rank: r.rank,
    memberId: r.memberId,
    memberName: r.name,
    avatarUrl: r.profileImageUrl,
    score: Math.round(r.totalScore),
    level: riskLevelFromString(r.riskLevel),
    delta: 0,
    isSelf: r.memberId === userId,
  }));

  return { profile, badges, ranking, streakDays: [] };
}

export async function deleteAccount(): Promise<void> {
  await request('PATCH', '/users/me/status', {
    confirm_text: '탈퇴하겠습니다',
    status: 'inactive',
  });
}
