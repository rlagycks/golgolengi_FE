import { useState, useEffect, useCallback } from 'react';
import { fetchHomeData, HomeData } from './api';
import type { DataState } from '../../types';

export function useHomeData() {
  const [state, setState] = useState<DataState<HomeData>>({ status: 'loading' });

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const data = await fetchHomeData();
      setState(data ? { status: 'success', data } : { status: 'empty' });
    } catch (e) {
      const message = e instanceof Error ? e.message : '데이터를 불러오지 못했습니다.';
      setState({ status: 'error', message });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { state, refresh: load };
}
