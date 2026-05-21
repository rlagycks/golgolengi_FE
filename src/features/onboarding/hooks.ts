import { useState, useCallback } from 'react';
import { completeOnboarding, submitOnboarding, OnboardingSubmitResult } from './api';
import type { OnboardingData, DataState } from '../../types';

const INITIAL_DATA: OnboardingData = {
  familyName: '',
  members: [],
  healthInfo: { height: 0, weight: 0, birthDate: '', gender: 'M' as const, conditions: [] },
  lifestyle: { mealDaysPerWeek: 3, eatingHabits: [] },
  rhythm: { sleepTime: '23:00', wakeTime: '07:00' },
  goals: [],
};

export function useOnboarding() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>(INITIAL_DATA);
  const [submitState, setSubmitState] = useState<DataState<OnboardingSubmitResult>>(
    { status: 'empty' },
  );

  const totalSteps = 8;

  const updateData = useCallback(
    (partial: Partial<OnboardingData>) => {
      setData((prev) => ({ ...prev, ...partial }));
    },
    [],
  );

  const nextStep = useCallback(() => {
    setStep((prev) => Math.min(prev + 1, totalSteps));
  }, []);

  const prevStep = useCallback(() => {
    setStep((prev) => Math.max(prev - 1, 1));
  }, []);

  const goToStep = useCallback((target: number) => {
    setStep(Math.max(1, Math.min(target, totalSteps)));
  }, []);

  const submit = useCallback(async () => {
    setSubmitState({ status: 'loading' });
    try {
      const result = await submitOnboarding(data);
      await completeOnboarding();
      setSubmitState({ status: 'success', data: result });
      setStep(totalSteps);
    } catch (e) {
      const message = e instanceof Error ? e.message : '제출에 실패했습니다.';
      setSubmitState({ status: 'error', message });
    }
  }, [data]);

  return { step, totalSteps, data, updateData, nextStep, prevStep, goToStep, submit, submitState };
}
