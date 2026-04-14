// Evaluation record store backed by Supabase (one row per evaluation).
// RLS scopes reads/writes to the authenticated user. Active-evaluation id is kept
// in localStorage because it is a per-browser UI preference, not data.

import { supabase } from './supabase';
import { STER_COMPETENCIES, STERScores, isElegibleToPass } from './sterData';

/** Ordered evaluation steps used by the multi-step evaluation form. */
export type EvaluationStep = 'timer' | 'lesson-plan' | 'details' | 'notes' | 'evaluate';

/** Form data captured on the Details step. */
export interface EvaluationDetailsForm {
  studentName: string;
  teacherName: string;
  evaluationDate: string;
  subjectArea: string;
  schoolName: string;
  semester: string;
  department: string;
  gradeLevel: string;
  classSize: string;
}

/** User-facing lifecycle states for an evaluation record. */
export type EvaluationStatus = 'in-progress' | 'completed';

/** Supported STER category codes used for category-scoped final notes. */
export type STERCategoryCode = 'LL' | 'IC' | 'IP' | 'CC' | 'PR';

/** Stable category order shared across notes and reporting UIs. */
export const STER_CATEGORY_ORDER: STERCategoryCode[] = ['LL', 'IC', 'IP', 'CC', 'PR'];

/** Category-level final notes captured in Step 5. */
export type CategoryFinalNotes = Record<STERCategoryCode, string>;

/** Empty category-level final notes scaffold for new or legacy records. */
export const DEFAULT_CATEGORY_FINAL_NOTES: CategoryFinalNotes = {
  LL: '',
  IC: '',
  IP: '',
  CC: '',
  PR: '',
};

/** Persisted evaluation record used by Dashboard, report view, and resume flows. */
export interface EvaluationRecord {
  id: string;
  status: EvaluationStatus;
  currentStep: EvaluationStep;
  timerSeconds: number;
  isRunning: boolean;
  lessonPlanFileName: string | null;
  lessonPlanFilePath: string | null;
  details: EvaluationDetailsForm;
  observationNotes: string;
  categoryFinalNotes: CategoryFinalNotes;
  notesFileName: string | null;
  notesFilePath: string | null;
  sterScores: STERScores;
  selectedSterCategory: string;
  createdAt: string;
  updatedAt: string;
  submittedAt: string | null;
}

/** Aggregated values derived from a record's STER scoring data for dashboard/report views. */
export interface EvaluationSummary {
  scoredCompetencies: number;
  observedCompetencies: number;
  notObservedCompetencies: number;
  totalCompetencies: number;
  completionPercent: number;
  observedCoveragePercent: number;
  overallScorePercent: number;
  isEligibleToPass: boolean;
}

/** Storage key that points to the currently active evaluation id for resume/edit flows. */
export const ACTIVE_EVALUATION_ID_STORAGE_KEY = 'aister:active-evaluation-id:v1';

/** Shared default details object used when creating empty records. */
export const DEFAULT_EVALUATION_DETAILS: EvaluationDetailsForm = {
  studentName: '',
  teacherName: '',
  evaluationDate: '',
  subjectArea: '',
  schoolName: '',
  semester: '',
  department: '',
  gradeLevel: '',
  classSize: '',
};

/** Returns a complete details payload, filling any missing fields for legacy records. */
export function normalizeEvaluationDetails(
  details: Partial<EvaluationDetailsForm> | null | undefined
): EvaluationDetailsForm {
  return {
    ...DEFAULT_EVALUATION_DETAILS,
    ...(details ?? {}),
  };
}

/** Returns a complete category-notes payload, filling any missing category keys. */
export function normalizeCategoryFinalNotes(
  notes: Partial<Record<STERCategoryCode, string>> | null | undefined
): CategoryFinalNotes {
  return {
    ...DEFAULT_CATEGORY_FINAL_NOTES,
    ...(notes ?? {}),
  };
}

/** Total number of STER competencies across all categories. */
export const TOTAL_STER_COMPETENCIES = Object.values(STER_COMPETENCIES).reduce(
  (total, category) => total + category.length,
  0
);

// ---------------------------------------------------------------------------
// DB row ↔ record mapping
// ---------------------------------------------------------------------------

interface EvaluationRow {
  id: string;
  evaluator_id: string;
  status: EvaluationStatus;
  current_step: EvaluationStep;
  timer_seconds: number;
  details: Partial<EvaluationDetailsForm> | null;
  observation_notes: string | null;
  category_final_notes: Partial<CategoryFinalNotes> | null;
  ster_scores: STERScores | null;
  selected_ster_category: string | null;
  lesson_plan_file_name: string | null;
  lesson_plan_file_path: string | null;
  notes_file_name: string | null;
  notes_file_path: string | null;
  created_at: string;
  updated_at: string;
  submitted_at: string | null;
}

function rowToRecord(row: EvaluationRow): EvaluationRecord {
  return {
    id: row.id,
    status: row.status,
    currentStep: row.current_step,
    timerSeconds: Math.max(0, row.timer_seconds ?? 0),
    // isRunning is a UI-only concern; DB never persists it — always false on load.
    isRunning: false,
    lessonPlanFileName: row.lesson_plan_file_name,
    lessonPlanFilePath: row.lesson_plan_file_path,
    details: normalizeEvaluationDetails(row.details),
    observationNotes: row.observation_notes ?? '',
    categoryFinalNotes: normalizeCategoryFinalNotes(row.category_final_notes),
    notesFileName: row.notes_file_name,
    notesFilePath: row.notes_file_path,
    sterScores: row.ster_scores ?? {},
    selectedSterCategory: row.selected_ster_category ?? 'LL',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    submittedAt: row.submitted_at,
  };
}

function recordToRow(record: EvaluationRecord, evaluatorId: string) {
  return {
    id: record.id,
    evaluator_id: evaluatorId,
    status: record.status,
    current_step: record.currentStep,
    timer_seconds: record.timerSeconds,
    details: record.details,
    observation_notes: record.observationNotes,
    category_final_notes: record.categoryFinalNotes,
    ster_scores: record.sterScores,
    selected_ster_category: record.selectedSterCategory,
    lesson_plan_file_name: record.lessonPlanFileName,
    lesson_plan_file_path: record.lessonPlanFilePath,
    notes_file_name: record.notesFileName,
    notes_file_path: record.notesFilePath,
    submitted_at: record.submittedAt,
  };
}

// ---------------------------------------------------------------------------
// Query functions (async — backed by Supabase, scoped by RLS)
// ---------------------------------------------------------------------------

/** Fetches every evaluation the current user is permitted to see, newest first. */
export async function getEvaluationRecords(): Promise<EvaluationRecord[]> {
  const { data, error } = await supabase
    .from('evaluations')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Failed to load evaluations:', error.message);
    return [];
  }

  return (data as EvaluationRow[]).map(rowToRecord);
}

/** Fetches a single evaluation by id; returns null if not found or forbidden. */
export async function getEvaluationRecordById(recordId: string): Promise<EvaluationRecord | null> {
  const { data, error } = await supabase
    .from('evaluations')
    .select('*')
    .eq('id', recordId)
    .maybeSingle();

  if (error) {
    console.error('Failed to load evaluation:', error.message);
    return null;
  }

  return data ? rowToRecord(data as EvaluationRow) : null;
}

/** Upserts a record for the given evaluator. Returns the saved record as echoed back by the DB. */
export async function upsertEvaluationRecord(
  record: EvaluationRecord,
  evaluatorId: string
): Promise<EvaluationRecord | null> {
  const payload = recordToRow(record, evaluatorId);
  const { data, error } = await supabase
    .from('evaluations')
    .upsert(payload, { onConflict: 'id' })
    .select()
    .single();

  if (error) {
    console.error('Failed to save evaluation:', error.message);
    return null;
  }

  return rowToRecord(data as EvaluationRow);
}

/** Creates a fresh evaluation row for the evaluator and marks it active locally. */
export async function startNewEvaluationRecord(evaluatorId: string): Promise<EvaluationRecord | null> {
  const { data, error } = await supabase
    .from('evaluations')
    .insert({
      evaluator_id: evaluatorId,
      status: 'in-progress',
      current_step: 'timer',
      timer_seconds: 0,
      details: DEFAULT_EVALUATION_DETAILS,
      observation_notes: '',
      category_final_notes: DEFAULT_CATEGORY_FINAL_NOTES,
      ster_scores: {},
      selected_ster_category: 'LL',
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to start new evaluation:', error.message);
    return null;
  }

  const record = rowToRecord(data as EvaluationRow);
  setActiveEvaluationId(record.id);
  return record;
}

// ---------------------------------------------------------------------------
// Active-evaluation-id helpers (localStorage — UI preference only)
// ---------------------------------------------------------------------------

/** Stores the active evaluation id for resume/edit navigation. */
export function setActiveEvaluationId(recordId: string): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(ACTIVE_EVALUATION_ID_STORAGE_KEY, recordId);
}

/** Returns the active evaluation id, or null when no selection has been made yet. */
export function getActiveEvaluationId(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(ACTIVE_EVALUATION_ID_STORAGE_KEY);
}

/** Clears the active evaluation id pointer from storage. */
export function clearActiveEvaluationId(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(ACTIVE_EVALUATION_ID_STORAGE_KEY);
}

// ---------------------------------------------------------------------------
// Pure helpers used by dashboards / reports
// ---------------------------------------------------------------------------

/** Counts how many STER competencies have a non-null score. */
export function getScoredCompetencyCount(scores: STERScores): number {
  let scoredCount = 0;

  Object.values(STER_COMPETENCIES).forEach((category) => {
    category.forEach((competency) => {
      if (scores[competency.id]?.score !== null && scores[competency.id]?.score !== undefined) {
        scoredCount += 1;
      }
    });
  });

  return scoredCount;
}

/** Counts how many competencies were observed with rubric-based scores (0-3). */
export function getObservedCompetencyCount(scores: STERScores): number {
  let observedCount = 0;

  Object.values(STER_COMPETENCIES).forEach((category) => {
    category.forEach((competency) => {
      const score = scores[competency.id]?.score;
      if (score !== null && score !== undefined && score !== 4) {
        observedCount += 1;
      }
    });
  });

  return observedCount;
}

/** Counts how many competencies were explicitly marked Not Observed (score=4). */
export function getNotObservedCompetencyCount(scores: STERScores): number {
  let notObservedCount = 0;

  Object.values(STER_COMPETENCIES).forEach((category) => {
    category.forEach((competency) => {
      if (scores[competency.id]?.score === 4) {
        notObservedCount += 1;
      }
    });
  });

  return notObservedCount;
}

/** Returns true when all STER competencies have been scored (regardless of score level). */
export function areAllCompetenciesScored(scores: STERScores): boolean {
  return getScoredCompetencyCount(scores) === TOTAL_STER_COMPETENCIES;
}

/** Computes overall score percentage from all scored competencies using a 0-3 scale. */
export function getOverallScorePercent(scores: STERScores): number {
  let earnedPoints = 0;
  let maxPoints = 0;

  Object.values(STER_COMPETENCIES).forEach((category) => {
    category.forEach((competency) => {
      const competencyScore = scores[competency.id]?.score;
      // Score=4 (Not Observed) is neutral and excluded from denominator.
      if (competencyScore !== null && competencyScore !== undefined && competencyScore !== 4) {
        earnedPoints += competencyScore;
        maxPoints += 3;
      }
    });
  });

  if (maxPoints === 0) {
    return 0;
  }

  return Math.round((earnedPoints / maxPoints) * 100);
}

/** Produces dashboard/report summary metrics from raw score data. */
export function getEvaluationSummary(record: EvaluationRecord): EvaluationSummary {
  const scoredCompetencies = getScoredCompetencyCount(record.sterScores);
  const observedCompetencies = getObservedCompetencyCount(record.sterScores);
  const notObservedCompetencies = getNotObservedCompetencyCount(record.sterScores);
  const completionPercent = Math.round((scoredCompetencies / TOTAL_STER_COMPETENCIES) * 100);
  const observedCoveragePercent = Math.round((observedCompetencies / TOTAL_STER_COMPETENCIES) * 100);

  return {
    scoredCompetencies,
    observedCompetencies,
    notObservedCompetencies,
    totalCompetencies: TOTAL_STER_COMPETENCIES,
    completionPercent,
    observedCoveragePercent,
    overallScorePercent: getOverallScorePercent(record.sterScores),
    isEligibleToPass: isElegibleToPass(record.sterScores),
  };
}

/** Returns whether a completed evaluation has been edited after first submission. */
export function wasEditedAfterSubmission(record: EvaluationRecord): boolean {
  if (!record.submittedAt) {
    return false;
  }

  return new Date(record.updatedAt).getTime() > new Date(record.submittedAt).getTime();
}
