import { useState, useEffect, useCallback } from 'react';
import { fetchMyData, MyData } from './api';
import type { DataState } from '../../types';

export function useMyData() {
  const [state, setState] = useState<DataState<MyData>>({ status: 'loading' });

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const data = await fetchMyData();
      setState({ status: 'success', data });
    } catch (e) {
      const message = e instanceof Error ? e.message : '프로필을 불러오지 못했습니다.';
      setState({ status: 'error', message });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { state, refresh: load };
}
