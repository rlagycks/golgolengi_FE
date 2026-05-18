// ─── Risk ────────────────────────────────────────────────────────────────────

export type RiskLevel = 'low' | 'warning' | 'high' | 'critical';

export interface RiskScore {
  score: number;
  level: RiskLevel;
  delta?: number;
}

// ─── Family ──────────────────────────────────────────────────────────────────

export type Relationship = 'self' | 'spouse' | 'parent' | 'child' | 'sibling' | 'other';
export type SharingStatus = 'sharing' | 'protected' | 'excluded';

export interface FamilyMember {
  id: string;
  name: string;
  relationship: Relationship;
  avatarUrl?: string;
  riskScore: RiskScore;
  sharingStatus: SharingStatus;
  isSelf: boolean;
}

export interface FamilyGroup {
  id: string;
  name: string;
  members: FamilyMember[];
  inviteCode: string;
  streak: number;
  habitProgress: number;
}

// ─── Challenge ───────────────────────────────────────────────────────────────

export type ChallengeCategory = 'all' | 'walk' | 'diet' | 'sleep' | 'water';
export type ChallengeStatus = 'ongoing' | 'completed' | 'skipped';

export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: Exclude<ChallengeCategory, 'all'>;
  targetValue: number;
  currentValue: number;
  unit: string;
  status: ChallengeStatus;
  isAiRecommended: boolean;
  isUrgent: boolean;
  completedCount: number;
  totalFamilyCount: number;
  dueDate: string;
}

export type CheckInMethod = 'wearable' | 'manual' | 'photo';

export interface WearableData {
  steps: number;
  detectedAt: string;
}

// ─── Report ──────────────────────────────────────────────────────────────────

export type RiskFactor = 'genetic' | 'lifestyle' | 'behavior' | 'environment' | 'clinical';

export interface FactorScore {
  factor: RiskFactor;
  score: number;
  weight: number;
  level: RiskLevel;
}

export interface WeeklyDataPoint {
  date: string;
  score: number;
}

export interface MemberReport {
  memberId: string;
  memberName: string;
  riskScore: RiskScore;
  weeklyTrend: WeeklyDataPoint[];
  factors: FactorScore[];
  improvingFactors: string[];
  worseningFactors: string[];
}

// ─── Badge ────────────────────────────────────────────────────────────────────

export interface Badge {
  id: string;
  key: string;
  label: string;
  icon: string;
  earnedAt: string;
  locked: boolean;
  description: string;
  condition: string;
}

// ─── Ranking ─────────────────────────────────────────────────────────────────

export interface RankingEntry {
  rank: number;
  memberId: string;
  memberName: string;
  avatarUrl?: string;
  score: number;
  level: RiskLevel;
  delta: number;
  isSelf: boolean;
}

// ─── Onboarding ──────────────────────────────────────────────────────────────

export type HealthCondition = 'hypertension' | 'diabetes' | 'heart' | 'liver' | 'cancer' | 'none';
export type EatingHabit = 'fast' | 'irregular' | 'salty' | 'sweet' | 'processed';
export type HealthGoal = 'risk_reduction' | 'weight' | 'sleep' | 'family_health' | 'habit';

export interface OnboardingData {
  familyName: string;
  members: Array<{ name: string; relationship: Relationship }>;
  healthInfo: {
    height: number;
    weight: number;
    conditions: HealthCondition[];
  };
  lifestyle: {
    mealDaysPerWeek: number;
    eatingHabits: EatingHabit[];
  };
  rhythm: {
    sleepTime: string;
    wakeTime: string;
  };
  goals: HealthGoal[];
}

// ─── My / Profile ─────────────────────────────────────────────────────────────

export interface StreakDay {
  date: number;
  done: boolean;
  isToday: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  familyName: string;
  relationship: Relationship;
  avatarUrl?: string;
  riskScore: RiskScore;
  currentStreak: number;
  monthlyBadgeCount: number;
}

// ─── Async state ──────────────────────────────────────────────────────────────

export type DataState<T> =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'empty' }
  | { status: 'success'; data: T };
