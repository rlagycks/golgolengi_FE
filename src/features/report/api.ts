import * as SecureStore from 'expo-secure-store';
import { tokenStorage } from '../../storage/tokenStorage';
import { request } from '../../api/client';
import { riskLevelFromString, riskLevelFromScore } from '../../utils';
import type { MemberReport, WeeklyDataPoint, FactorScore } from '../../types';

const FAMILY_ID_KEY = 'fhos_family_id';

export interface ReportData {
  familyReport: MemberReport;
  memberReports: MemberReport[];
}

interface BackendRiskScore {
  scoreId: string;
  memberId: string;
  totalScore: number;
  calculatedAt: string;
}

interface BackendRiskBreakdown {
  scoreId: string;
  totalScore: number;
  geneticScore: number;
  lifestyleScore: number;
  behaviorScore: number;
  environmentScore: number;
  clinicalScore: number;
  calculatedAt: string;
}

interface BackendFamilyRiskSummary {
  familyId: string;
  averageScore: number;
  members: Array<{ memberId: string; totalScore: number; riskLevel: string }>;
}

interface BackendFamilyMember {
  memberId: string;
  name: string;
}

function breakdownToFactors(bd: BackendRiskBreakdown): FactorScore[] {
  return [
    { factor: 'genetic', score: Math.round(bd.geneticScore), weight: 30, level: riskLevelFromScore(bd.geneticScore) },
    { factor: 'lifestyle', score: Math.round(bd.lifestyleScore), weight: 25, level: riskLevelFromScore(bd.lifestyleScore) },
    { factor: 'behavior', score: Math.round(bd.behaviorScore), weight: 20, level: riskLevelFromScore(bd.behaviorScore) },
    { factor: 'environment', score: Math.round(bd.environmentScore), weight: 15, level: riskLevelFromScore(bd.environmentScore) },
    { factor: 'clinical', score: Math.round(bd.clinicalScore), weight: 10, level: riskLevelFromScore(bd.clinicalScore) },
  ];
}

function historyToTrend(history: BackendRiskScore[]): WeeklyDataPoint[] {
  return history.slice(-7).map((h) => ({
    date: new Date(h.calculatedAt)
      .toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })
      .replace(/\.\s*/g, '/')
      .replace(/\/$/, '')
      .trim(),
    score: Math.round(h.totalScore),
  }));
}

export async function fetchReport(): Promise<ReportData> {
  const [userId, familyId] = await Promise.all([
    tokenStorage.getUserId(),
    SecureStore.getItemAsync(FAMILY_ID_KEY),
  ]);

  if (!userId) throw new Error('인증 정보가 없습니다.');

  const [history, breakdown, familyRiskSummary, familyMembers] = await Promise.all([
    request<BackendRiskScore[]>('GET', '/risk-scores/history').catch(
      () => [] as BackendRiskScore[],
    ),
    request<BackendRiskBreakdown>('GET', '/risk-scores/breakdown').catch(() => null),
    familyId
      ? request<BackendFamilyRiskSummary>('GET', `/families/${familyId}/risk-summary`).catch(
          () => null,
        )
      : Promise.resolve(null),
    familyId
      ? request<BackendFamilyMember[]>('GET', `/families/${familyId}/members`).catch(
          () => [] as BackendFamilyMember[],
        )
      : Promise.resolve([] as BackendFamilyMember[]),
  ]);

  const weeklyTrend = historyToTrend(history);
  const factors = breakdown ? breakdownToFactors(breakdown) : [];
  const myScore = breakdown ? Math.round(breakdown.totalScore) : 0;
  const myLevel = breakdown ? riskLevelFromScore(breakdown.totalScore) : 'low';
  const myName = familyMembers.find((m) => m.memberId === userId)?.name ?? '나';

  const myReport: MemberReport = {
    memberId: userId,
    memberName: myName,
    riskScore: { score: myScore, level: myLevel },
    weeklyTrend,
    factors,
    improvingFactors: [],
    worseningFactors: [],
  };

  const avgScore = familyRiskSummary ? Math.round(familyRiskSummary.averageScore) : myScore;
  const familyReport: MemberReport = {
    memberId: familyId ?? 'family',
    memberName: '가족 전체',
    riskScore: { score: avgScore, level: riskLevelFromScore(avgScore) },
    weeklyTrend,
    factors,
    improvingFactors: [],
    worseningFactors: [],
  };

  const otherMemberReports: MemberReport[] = familyMembers
    .filter((m) => m.memberId !== userId)
    .map((m) => {
      const risk = familyRiskSummary?.members.find((r) => r.memberId === m.memberId);
      const mScore = risk ? Math.round(risk.totalScore) : 0;
      return {
        memberId: m.memberId,
        memberName: m.name,
        riskScore: { score: mScore, level: risk ? riskLevelFromString(risk.riskLevel) : 'low' },
        weeklyTrend: [],
        factors: [],
        improvingFactors: [],
        worseningFactors: [],
      };
    });

  return {
    familyReport,
    memberReports: [myReport, ...otherMemberReports],
  };
}
