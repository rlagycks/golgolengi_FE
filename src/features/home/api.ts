import * as SecureStore from 'expo-secure-store';
import { request } from '../../api/client';
import { tokenStorage } from '../../storage/tokenStorage';
import { riskLevelFromString, riskLevelFromScore, sharingStatusFromVisibility, BADGE_META } from '../../utils';
import type { FamilyMember, Challenge, Badge, RiskScore } from '../../types';

const FAMILY_ID_KEY = 'fhos_family_id';

interface BackendMemberRisk {
  memberId: string;
  totalScore: number;
  riskLevel: string;
}

interface BackendFamilyRiskSummary {
  familyId: string;
  averageScore: number;
  members: BackendMemberRisk[];
}

interface BackendFamilyMember {
  memberId: string;
  name: string;
  profileImageUrl?: string;
  role: string;
  riskScoreVisible: boolean;
  missionVisible: boolean;
}

interface BackendOverview {
  familyId: string;
  name: string;
  memberCount: number;
  members: BackendFamilyMember[];
}

interface BackendMission {
  missionId: string;
  title: string;
  description: string;
  category: string;
  status: string;
  targetCount: number;
  unit: string;
  endDate: string;
}

interface BackendBadge {
  badgeType: string;
  awardedAt: string;
}

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

export async function fetchHomeData(): Promise<HomeData> {
  const [userId, familyId] = await Promise.all([
    tokenStorage.getUserId(),
    SecureStore.getItemAsync(FAMILY_ID_KEY),
  ]);

  if (!userId || !familyId) {
    throw new Error('인증 정보가 없습니다.');
  }

  const [riskSummary, overview, missions, badges] = await Promise.all([
    request<BackendFamilyRiskSummary>('GET', `/families/${familyId}/risk-summary`),
    request<BackendOverview>('GET', `/families/${familyId}/overview`),
    request<BackendMission[]>('GET', '/missions/recommended').catch(() => [] as BackendMission[]),
    request<BackendBadge[]>('GET', '/badges').catch(() => [] as BackendBadge[]),
  ]);

  const riskByMemberId = new Map(riskSummary.members.map((m) => [m.memberId, m]));
  const membersInfo = overview.members ?? [];

  const members: FamilyMember[] = membersInfo.map((m) => {
    const risk = riskByMemberId.get(m.memberId);
    return {
      id: m.memberId,
      name: m.name,
      relationship: m.memberId === userId ? 'self' : 'other',
      avatarUrl: m.profileImageUrl,
      riskScore: {
        score: risk ? Math.round(risk.totalScore) : 0,
        level: risk ? riskLevelFromString(risk.riskLevel) : 'low',
      },
      sharingStatus: sharingStatusFromVisibility(m.riskScoreVisible, m.missionVisible),
      isSelf: m.memberId === userId,
    };
  });

  const avgScore = riskSummary.averageScore ?? 0;
  const familyRiskScore: RiskScore = {
    score: Math.round(avgScore),
    level: riskLevelFromScore(avgScore),
  };

  const urgentChallenge: Challenge | null =
    missions.length > 0
      ? {
          id: missions[0].missionId,
          title: missions[0].title,
          description: missions[0].description ?? '',
          category: (missions[0].category ?? 'walk') as Challenge['category'],
          targetValue: missions[0].targetCount ?? 1,
          currentValue: 0,
          unit: missions[0].unit ?? '',
          status: 'ongoing',
          isAiRecommended: true,
          isUrgent: true,
          completedCount: 0,
          totalFamilyCount: members.length,
          dueDate: missions[0].endDate
            ? new Date(missions[0].endDate).toISOString()
            : new Date().toISOString(),
        }
      : null;

  const recentBadges: Badge[] = badges.slice(0, 3).map((b, i) => {
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
      earnedAt: b.awardedAt
        ? new Date(b.awardedAt).toLocaleDateString('ko-KR')
        : '',
      locked: false,
      description: meta.description,
      condition: meta.condition,
    };
  });

  const me = membersInfo.find((m) => m.memberId === userId);

  return {
    userName: me?.name ?? '',
    familyName: overview.name ?? '',
    familyRiskScore,
    members,
    todayStreak: 0,
    todayCompletedCount: 0,
    todayTotalCount: members.length,
    urgentChallenge,
    recentBadges,
  };
}
