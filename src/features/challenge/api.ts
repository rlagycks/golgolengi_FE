import { request } from '../../api/client';
import type { Challenge, ChallengeCategory, WearableData } from '../../types';

export interface ChallengeListData {
  challenges: Challenge[];
  wearableData: WearableData | null;
}

interface BackendMission {
  missionId: string;
  familyId: string;
  title: string;
  description: string;
  category: string;
  status: string;
  targetCount: number;
  unit: string;
  endDate: string;
}

function mapMission(m: BackendMission): Challenge {
  return {
    id: m.missionId,
    title: m.title,
    description: m.description ?? '',
    category: (m.category ?? 'walk') as Challenge['category'],
    targetValue: m.targetCount ?? 1,
    currentValue: 0,
    unit: m.unit ?? '',
    status: m.status === 'completed' ? 'completed' : 'ongoing',
    isAiRecommended: false,
    isUrgent: false,
    completedCount: 0,
    totalFamilyCount: 1,
    dueDate: m.endDate ? new Date(m.endDate).toISOString() : new Date().toISOString(),
  };
}

export async function fetchChallenges(): Promise<ChallengeListData> {
  const missions = await request<BackendMission[]>('GET', '/missions');
  return { challenges: missions.map(mapMission), wearableData: null };
}

export async function checkInChallenge(
  challengeId: string,
  value: number,
): Promise<{ success: boolean; newValue: number }> {
  await request('POST', '/mission-logs', { missionId: challengeId, value });
  return { success: true, newValue: value };
}

export async function postponeChallenge(_challengeId: string): Promise<void> {
  // 백엔드 미구현
}

export { ChallengeCategory };
