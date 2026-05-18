import { useState, useEffect, useCallback } from 'react';
import { fetchReport, ReportData } from './api';
import type { DataState } from '../../types';

export function useReport() {
  const [state, setState] = useState<DataState<ReportData>>({ status: 'loading' });
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const data = await fetchReport();
      setState({ status: 'success', data });
    } catch (e) {
      const message = e instanceof Error ? e.message : '리포트를 불러오지 못했습니다.';
      setState({ status: 'error', message });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const activeReport =
    state.status === 'success'
      ? activeTabIndex === 0
        ? state.data.familyReport
        : state.data.memberReports[activeTabIndex - 1] ?? state.data.familyReport
      : null;

  const tabs =
    state.status === 'success'
      ? ['가족 전체', ...state.data.memberReports.map((r) => r.memberName)]
      : [];

  return { state, activeTabIndex, setActiveTabIndex, activeReport, tabs, refresh: load };
}
