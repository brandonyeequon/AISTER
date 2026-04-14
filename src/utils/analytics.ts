// Aggregate queries that power the Research Analytics dashboard.
// RLS on the evaluations table already restricts rows to the caller's visibility.

import { supabase } from './supabase';
import {
  getOverallScorePercent,
  getScoredCompetencyCount,
  TOTAL_STER_COMPETENCIES,
} from './evaluationRecords';
import { STERScores } from './sterData';
import { formatShortDate } from './formatDate';

export type AnalyticsRange = '7days' | '30days' | '90days';

export interface AnalyticsKpis {
  totalEvaluations: number;
  completedEvaluations: number;
  pendingEvaluations: number;
  avgDurationMinutes: number;
}

export interface TrendPoint {
  week: string;
  evaluations: number;
  completed: number;
}

export interface DistributionBucket {
  score: string;
  count: number;
}

export interface DurationPoint {
  time: string;
  duration: number;
}

export interface AnalyticsBundle {
  kpis: AnalyticsKpis;
  trend: TrendPoint[];
  distribution: DistributionBucket[];
  duration: DurationPoint[];
}

interface EvaluationAnalyticsRow {
  id: string;
  status: 'in-progress' | 'completed';
  timer_seconds: number;
  ster_scores: STERScores | null;
  created_at: string;
  updated_at: string;
  submitted_at: string | null;
}

const RANGE_DAYS: Record<AnalyticsRange, number> = {
  '7days': 7,
  '30days': 30,
  '90days': 90,
};

function rangeStart(range: AnalyticsRange): Date {
  const start = new Date();
  start.setDate(start.getDate() - RANGE_DAYS[range]);
  start.setHours(0, 0, 0, 0);
  return start;
}

function startOfWeek(d: Date): Date {
  const copy = new Date(d);
  const day = copy.getDay();
  copy.setHours(0, 0, 0, 0);
  copy.setDate(copy.getDate() - day);
  return copy;
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export async function fetchAnalytics(range: AnalyticsRange): Promise<AnalyticsBundle> {
  const start = rangeStart(range);

  const { data, error } = await supabase
    .from('evaluations')
    .select('id, status, timer_seconds, ster_scores, created_at, updated_at, submitted_at')
    .gte('updated_at', start.toISOString());

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as EvaluationAnalyticsRow[];

  return {
    kpis: computeKpis(rows),
    trend: computeTrend(rows, start),
    distribution: computeDistribution(rows),
    duration: computeDurationByDay(rows),
  };
}

function computeKpis(rows: EvaluationAnalyticsRow[]): AnalyticsKpis {
  const completed = rows.filter((r) => r.status === 'completed');
  const pending = rows.filter((r) => r.status === 'in-progress');
  const avgSeconds =
    completed.length === 0
      ? 0
      : completed.reduce((acc, r) => acc + (r.timer_seconds ?? 0), 0) / completed.length;

  return {
    totalEvaluations: rows.length,
    completedEvaluations: completed.length,
    pendingEvaluations: pending.length,
    avgDurationMinutes: Math.round(avgSeconds / 60),
  };
}

function computeTrend(rows: EvaluationAnalyticsRow[], start: Date): TrendPoint[] {
  const firstWeek = startOfWeek(start);
  const lastWeek = startOfWeek(new Date());
  const weeks = new Map<number, TrendPoint>();

  // Seed every week in the range so sparse data still renders a continuous axis.
  const weekSpan = Math.floor((lastWeek.getTime() - firstWeek.getTime()) / (7 * 86400_000));
  for (let i = 0; i <= weekSpan; i += 1) {
    const ws = new Date(firstWeek);
    ws.setDate(ws.getDate() + i * 7);
    weeks.set(ws.getTime(), { week: formatShortDate(ws), evaluations: 0, completed: 0 });
  }

  rows.forEach((row) => {
    const ws = startOfWeek(new Date(row.created_at));
    const key = ws.getTime();
    let bucket = weeks.get(key);
    if (!bucket) {
      bucket = { week: formatShortDate(ws), evaluations: 0, completed: 0 };
      weeks.set(key, bucket);
    }
    bucket.evaluations += 1;
    if (row.status === 'completed') bucket.completed += 1;
  });

  return Array.from(weeks.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([, v]) => v);
}

function computeDistribution(rows: EvaluationAnalyticsRow[]): DistributionBucket[] {
  const buckets: DistributionBucket[] = [
    { score: '0-20%', count: 0 },
    { score: '20-40%', count: 0 },
    { score: '40-60%', count: 0 },
    { score: '60-80%', count: 0 },
    { score: '80-100%', count: 0 },
  ];

  rows.forEach((row) => {
    if (row.status !== 'completed') return;
    const scores = row.ster_scores ?? {};
    if (getScoredCompetencyCount(scores) === 0) return;
    const pct = getOverallScorePercent(scores);
    const idx = Math.min(Math.floor(pct / 20), 4);
    buckets[idx].count += 1;
  });

  return buckets;
}

function computeDurationByDay(rows: EvaluationAnalyticsRow[]): DurationPoint[] {
  const totals = Array.from({ length: 7 }, () => ({ sum: 0, count: 0 }));

  rows.forEach((row) => {
    if (row.status !== 'completed' || !row.timer_seconds) return;
    const day = new Date(row.submitted_at ?? row.updated_at).getDay();
    totals[day].sum += row.timer_seconds;
    totals[day].count += 1;
  });

  return DAY_LABELS.map((label, i) => ({
    time: label,
    duration:
      totals[i].count === 0 ? 0 : Math.round(totals[i].sum / totals[i].count / 60),
  }));
}

export const TOTAL_COMPETENCIES = TOTAL_STER_COMPETENCIES;
