import { useState, useEffect, useCallback } from 'react';
import {
  fetchFamily,
  regenerateInviteCode,
  updateSharingSettings,
  removeMember,
  SharingSettings,
} from './api';
import type { FamilyGroup, DataState } from '../../types';

interface FamilyState {
  family: FamilyGroup;
  sharing: SharingSettings;
}

export function useFamilyData() {
  const [state, setState] = useState<DataState<FamilyState>>({ status: 'loading' });

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const result = await fetchFamily();
      setState({ status: 'success', data: result });
    } catch (e) {
      const message = e instanceof Error ? e.message : '가족 정보를 불러오지 못했습니다.';
      setState({ status: 'error', message });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const regenCode = useCallback(async () => {
    const newCode = await regenerateInviteCode();
    setState((prev) => {
      if (prev.status !== 'success') return prev;
      return {
        ...prev,
        data: { ...prev.data, family: { ...prev.data.family, inviteCode: newCode } },
      };
    });
  }, []);

  const updateSharing = useCallback(async (settings: SharingSettings) => {
    await updateSharingSettings(settings);
    setState((prev) => {
      if (prev.status !== 'success') return prev;
      return { ...prev, data: { ...prev.data, sharing: settings } };
    });
  }, []);

  const remove = useCallback(
    async (memberId: string) => {
      await removeMember(memberId);
      await load();
    },
    [load],
  );

  return { state, regenCode, updateSharing, remove, refresh: load };
}
