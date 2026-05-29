import * as SecureStore from 'expo-secure-store';
import { tokenStorage } from '../../storage/tokenStorage';
import { request } from '../../api/client';
import { riskLevelFromString, sharingStatusFromVisibility } from '../../utils';
import type { FamilyGroup, FamilyMember } from '../../types';

const FAMILY_ID_KEY = 'fhos_family_id';

export interface SharingSettings {
  riskScore: boolean;
  challengeProgress: boolean;
  healthSurveyDetail: boolean;
}

interface BackendFamilyMember {
  memberId: string;
  name: string;
  profileImageUrl?: string;
  role: string;
  riskScoreVisible: boolean;
  missionVisible: boolean;
}

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

interface BackendOverview {
  familyId: string;
  name: string;
  memberCount: number;
  members: BackendFamilyMember[];
}

interface BackendInviteCode {
  inviteCode: string;
}

async function getIds(): Promise<{ userId: string; familyId: string }> {
  const [userId, familyId] = await Promise.all([
    tokenStorage.getUserId(),
    SecureStore.getItemAsync(FAMILY_ID_KEY),
  ]);
  if (!userId || !familyId) throw new Error('인증 정보가 없습니다.');
  return { userId, familyId };
}

export async function fetchFamily(): Promise<{ family: FamilyGroup; sharing: SharingSettings }> {
  const { userId, familyId } = await getIds();

  const [overview, riskSummary, inviteCodeRes] = await Promise.all([
    request<BackendOverview>('GET', `/families/${familyId}/overview`),
    request<BackendFamilyRiskSummary>('GET', `/families/${familyId}/risk-summary`),
    request<BackendInviteCode>('GET', `/families/${familyId}/invite-code`),
  ]);

  const riskByMemberId = new Map(riskSummary.members.map((m) => [m.memberId, m]));
  const membersInfo: BackendFamilyMember[] = overview.members ?? [];

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

  const myInfo = membersInfo.find((m) => m.memberId === userId);
  const sharing: SharingSettings = {
    riskScore: myInfo?.riskScoreVisible ?? true,
    challengeProgress: myInfo?.missionVisible ?? true,
    healthSurveyDetail: false,
  };

  const family: FamilyGroup = {
    id: familyId,
    name: overview.name ?? '',
    members,
    inviteCode: inviteCodeRes.inviteCode ?? '',
    streak: 0,
    habitProgress: 0,
  };

  return { family, sharing };
}

export async function regenerateInviteCode(): Promise<string> {
  const { familyId } = await getIds();
  const res = await request<BackendInviteCode>('POST', `/families/${familyId}/invite`);
  return res.inviteCode;
}

export async function updateSharingSettings(settings: SharingSettings): Promise<void> {
  const { userId } = await getIds();
  await request('PATCH', `/privacy-settings/${userId}`, {
    riskScoreVisible: settings.riskScore,
    missionVisible: settings.challengeProgress,
  });
}

export async function removeMember(memberId: string): Promise<void> {
  const { familyId } = await getIds();
  await request('DELETE', `/family-members/${memberId}?familyId=${familyId}`);
}
