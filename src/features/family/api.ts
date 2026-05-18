import type { FamilyGroup } from '../../types';

export interface SharingSettings {
  riskScore: boolean;
  challengeProgress: boolean;
  healthSurveyDetail: boolean;
}

const MOCK_FAMILY: FamilyGroup = {
  id: 'family_001',
  name: '김씨 가족',
  inviteCode: 'A3F9-K2M7',
  streak: 7,
  habitProgress: 62,
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
  ],
};

const MOCK_SHARING: SharingSettings = {
  riskScore: true,
  challengeProgress: true,
  healthSurveyDetail: false,
};

export async function fetchFamily(): Promise<{ family: FamilyGroup; sharing: SharingSettings }> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return { family: MOCK_FAMILY, sharing: MOCK_SHARING };
}

export async function regenerateInviteCode(): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return 'X7P2-M9Q4';
}

export async function updateSharingSettings(settings: SharingSettings): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 300));
}

export async function removeMember(memberId: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 400));
}
