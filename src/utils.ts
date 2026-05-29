import type { RiskLevel, SharingStatus } from './types';

export function riskLevelFromString(level: string): RiskLevel {
  switch (level) {
    case 'HIGH': return 'high';
    case 'MEDIUM': return 'warning';
    case 'CRITICAL': return 'critical';
    default: return 'low';
  }
}

export function riskLevelFromScore(score: number): RiskLevel {
  if (score >= 80) return 'critical';
  if (score >= 60) return 'high';
  if (score >= 30) return 'warning';
  return 'low';
}

export function sharingStatusFromVisibility(
  riskVisible: boolean,
  missionVisible: boolean,
): SharingStatus {
  if (riskVisible && missionVisible) return 'sharing';
  if (!riskVisible && !missionVisible) return 'excluded';
  return 'protected';
}

export const BADGE_META: Record<
  string,
  { label: string; icon: string; description: string; condition: string }
> = {
  first_challenge: {
    label: '첫 챌린지',
    icon: '🏅',
    description: '첫 번째 챌린지를 완료하면 수여됩니다.',
    condition: '챌린지 1회 완료',
  },
  streak_7: {
    label: '7일 연속',
    icon: '🔥',
    description: '7일 연속 챌린지 달성',
    condition: '7일 연속 습관 완료',
  },
  streak_30: {
    label: '30일 연속',
    icon: '⚡',
    description: '30일 연속 챌린지 달성',
    condition: '30일 연속 필요',
  },
  risk_improved: {
    label: '리스크 개선',
    icon: '💪',
    description: '리스크 점수 개선',
    condition: '리스크 점수를 10점 이상 낮추면 수여됩니다.',
  },
  family_complete: {
    label: '가족 완료',
    icon: '👨‍👩‍👧',
    description: '가족 전원 챌린지 완료',
    condition: '전원 완료 시 획득',
  },
};