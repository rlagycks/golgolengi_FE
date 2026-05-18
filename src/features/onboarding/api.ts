import type { OnboardingData, RiskScore } from '../../types';

export interface OnboardingSubmitResult {
  familyId: string;
  initialRiskScore: RiskScore;
}

// Replace with real API call when backend is ready
export async function submitOnboarding(
  data: OnboardingData,
): Promise<OnboardingSubmitResult> {
  await new Promise((resolve) => setTimeout(resolve, 1200));

  return {
    familyId: 'family_001',
    initialRiskScore: { score: 55, level: 'warning', delta: 0 },
  };
}
