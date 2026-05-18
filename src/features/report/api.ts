import type { MemberReport, WeeklyDataPoint, FactorScore } from '../../types';

export interface ReportData {
  familyReport: MemberReport;
  memberReports: MemberReport[];
}

const WEEKLY: WeeklyDataPoint[] = [
  { date: '05/12', score: 62 },
  { date: '05/13', score: 60 },
  { date: '05/14', score: 58 },
  { date: '05/15', score: 57 },
  { date: '05/16', score: 55 },
  { date: '05/17', score: 56 },
  { date: '05/18', score: 55 },
];

const FAMILY_FACTORS: FactorScore[] = [
  { factor: 'genetic', score: 70, weight: 30, level: 'high' },
  { factor: 'lifestyle', score: 50, weight: 25, level: 'warning' },
  { factor: 'behavior', score: 55, weight: 20, level: 'warning' },
  { factor: 'environment', score: 65, weight: 15, level: 'high' },
  { factor: 'clinical', score: 32, weight: 10, level: 'low' },
];

const MOCK_REPORT: ReportData = {
  familyReport: {
    memberId: 'family',
    memberName: '가족 전체',
    riskScore: { score: 55, level: 'warning', delta: -3 },
    weeklyTrend: WEEKLY,
    factors: FAMILY_FACTORS,
    improvingFactors: ['생활습관', '행동'],
    worseningFactors: ['유전'],
  },
  memberReports: [
    {
      memberId: 'm1',
      memberName: '김철수',
      riskScore: { score: 28, level: 'low', delta: -5 },
      weeklyTrend: WEEKLY.map((d) => ({ ...d, score: d.score - 27 })),
      factors: FAMILY_FACTORS.map((f) => ({ ...f, score: f.score - 20 })),
      improvingFactors: ['생활습관', '행동', '임상'],
      worseningFactors: [],
    },
    {
      memberId: 'm2',
      memberName: '김영희',
      riskScore: { score: 72, level: 'high', delta: 2 },
      weeklyTrend: WEEKLY.map((d) => ({ ...d, score: d.score + 17 })),
      factors: FAMILY_FACTORS.map((f) => ({ ...f, score: Math.min(100, f.score + 20) })),
      improvingFactors: [],
      worseningFactors: ['유전', '임상'],
    },
    {
      memberId: 'm3',
      memberName: '민준',
      riskScore: { score: 41, level: 'warning', delta: -1 },
      weeklyTrend: WEEKLY.map((d) => ({ ...d, score: d.score - 14 })),
      factors: FAMILY_FACTORS.map((f) => ({ ...f, score: f.score - 8 })),
      improvingFactors: ['행동'],
      worseningFactors: ['생활습관'],
    },
  ],
};

export async function fetchReport(): Promise<ReportData> {
  await new Promise((resolve) => setTimeout(resolve, 700));
  return MOCK_REPORT;
}
