import { useState, useEffect, useCallback } from 'react';
import {
  fetchChallenges,
  checkInChallenge,
  postponeChallenge,
  ChallengeListData,
} from './api';
import type { DataState, ChallengeCategory } from '../../types';

export function useChallenges() {
  const [state, setState] = useState<DataState<ChallengeListData>>({ status: 'loading' });
  const [activeCategory, setActiveCategory] = useState<ChallengeCategory>('all');
  const [checkInLoading, setCheckInLoading] = useState(false);

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const data = await fetchChallenges();
      setState(data.challenges.length > 0 ? { status: 'success', data } : { status: 'empty' });
    } catch (e) {
      const message = e instanceof Error ? e.message : '챌린지를 불러오지 못했습니다.';
      setState({ status: 'error', message });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const checkIn = useCallback(
    async (challengeId: string, value: number) => {
      setCheckInLoading(true);
      try {
        await checkInChallenge(challengeId, value);
        await load();
      } finally {
        setCheckInLoading(false);
      }
    },
    [load],
  );

  const postpone = useCallback(
    async (challengeId: string) => {
      await postponeChallenge(challengeId);
      await load();
    },
    [load],
  );

  const filteredChallenges =
    state.status === 'success'
      ? activeCategory === 'all'
        ? state.data.challenges
        : state.data.challenges.filter((c) => c.category === activeCategory)
      : [];

  return {
    state,
    filteredChallenges,
    activeCategory,
    setActiveCategory,
    checkIn,
    postpone,
    checkInLoading,
    refresh: load,
  };
}
