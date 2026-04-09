// Local evaluation record store for managing multiple drafts, completed reports, and resume-by-id workflows.

import { STER_COMPETENCIES, STERScores, isElegibleToPass } from './sterData';

/** Ordered evaluation steps used by the multi-step evaluation form. */
export type EvaluationStep = 'timer' | 'lesson-plan' | 'details' | 'notes' | 'evaluate';

/** Form data captured on the Details step. */
export interface EvaluationDetailsForm {
  studentName: string;
  teacherName: string;
  evaluationDate: string;
}

/** User-facing lifecycle states for an evaluation record. */
export type EvaluationStatus = 'in-progress' | 'completed';

/** Persisted evaluation record used by Dashboard, report view, and resume flows. */
export interface EvaluationRecord {
  id: string;
  status: EvaluationStatus;
  currentStep: EvaluationStep;
  timerSeconds: number;
  isRunning: boolean;
  lessonPlanFileName: string | null;
  details: EvaluationDetailsForm;
  observationNotes: string;
  notesFileName: string | null;
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

interface LegacyEvaluationDraft {
  currentStep: EvaluationStep;
  timerSeconds: number;
  isRunning: boolean;
  lessonPlanFileName: string | null;
  details: EvaluationDetailsForm;
  observationNotes: string;
  notesFileName: string | null;
  sterScores: STERScores;
  selectedSterCategory: string;
}

/** Versioned storage key for all evaluation records. */
export const EVALUATION_RECORDS_STORAGE_KEY = 'aister:evaluations:v1';
/** Storage key that points to the currently active evaluation id for resume/edit flows. */
export const ACTIVE_EVALUATION_ID_STORAGE_KEY = 'aister:active-evaluation-id:v1';
/** Legacy single-draft key retained only for one-time migration support. */
export const LEGACY_EVALUATION_DRAFT_STORAGE_KEY = 'aister:evaluation-draft:v1';

/** Shared default details object used when creating empty records. */
export const DEFAULT_EVALUATION_DETAILS: EvaluationDetailsForm = {
  studentName: '',
  teacherName: '',
  evaluationDate: '',
};

/** Total number of STER competencies across all categories. */
export const TOTAL_STER_COMPETENCIES = Object.values(STER_COMPETENCIES).reduce(
  (total, category) => total + category.length,
  0
);

/** Reads and parses JSON from localStorage, returning a fallback when unavailable or invalid. */
function readStorageValue<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') {
    return fallback;
  }

  const rawValue = window.localStorage.getItem(key);
  if (!rawValue) {
    return fallback;
  }

  try {
    return JSON.parse(rawValue) as T;
  } catch (error) {
    console.error(`Failed to parse localStorage key: ${key}`, error);
    return fallback;
  }
}

/** Generates a unique id for new records using crypto when available with a safe fallback. */
function createEvaluationId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `eval_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

/** Creates a new empty in-progress evaluation record with initialized metadata. */
export function createEmptyEvaluationRecord(): EvaluationRecord {
  const now = new Date().toISOString();

  return {
    id: createEvaluationId(),
    status: 'in-progress',
    currentStep: 'timer',
    timerSeconds: 0,
    isRunning: false,
    lessonPlanFileName: null,
    details: DEFAULT_EVALUATION_DETAILS,
    observationNotes: '',
    notesFileName: null,
    sterScores: {},
    selectedSterCategory: 'LL',
    createdAt: now,
    updatedAt: now,
    submittedAt: null,
  };
}

/** Returns all stored evaluation records ordered exactly as persisted. */
export function getEvaluationRecords(): EvaluationRecord[] {
  return readStorageValue<EvaluationRecord[]>(EVALUATION_RECORDS_STORAGE_KEY, []);
}

/** Persists the entire evaluation record list to localStorage. */
export function saveEvaluationRecords(records: EvaluationRecord[]): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(EVALUATION_RECORDS_STORAGE_KEY, JSON.stringify(records));
}

/** Finds and returns a single evaluation record by id, or null when not found. */
export function getEvaluationRecordById(recordId: string): EvaluationRecord | null {
  return getEvaluationRecords().find((record) => record.id === recordId) ?? null;
}

/** Inserts or updates a record by id, preserving all other records. */
export function upsertEvaluationRecord(record: EvaluationRecord): void {
  const records = getEvaluationRecords();
  const existingIndex = records.findIndex((item) => item.id === record.id);

  if (existingIndex >= 0) {
    records[existingIndex] = record;
    saveEvaluationRecords(records);
    return;
  }

  saveEvaluationRecords([record, ...records]);
}

/** Stores the active evaluation id for resume/edit navigation. */
export function setActiveEvaluationId(recordId: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(ACTIVE_EVALUATION_ID_STORAGE_KEY, recordId);
}

/** Returns the active evaluation id, or null when no selection has been made yet. */
export function getActiveEvaluationId(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage.getItem(ACTIVE_EVALUATION_ID_STORAGE_KEY);
}

/** Clears the active evaluation id pointer from storage. */
export function clearActiveEvaluationId(): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(ACTIVE_EVALUATION_ID_STORAGE_KEY);
}

/** Creates, stores, and marks a brand-new draft as the active evaluation. */
export function startNewEvaluationRecord(): EvaluationRecord {
  const newRecord = createEmptyEvaluationRecord();
  const records = getEvaluationRecords();
  saveEvaluationRecords([newRecord, ...records]);
  setActiveEvaluationId(newRecord.id);
  return newRecord;
}

/** Migrates the legacy single-draft localStorage shape into the new multi-record store once. */
export function migrateLegacyDraftIfNeeded(): void {
  if (typeof window === 'undefined') {
    return;
  }

  const existingRecords = getEvaluationRecords();
  const rawLegacyDraft = window.localStorage.getItem(LEGACY_EVALUATION_DRAFT_STORAGE_KEY);

  if (!rawLegacyDraft) {
    return;
  }

  if (existingRecords.length > 0) {
    window.localStorage.removeItem(LEGACY_EVALUATION_DRAFT_STORAGE_KEY);
    return;
  }

  try {
    const legacyDraft = JSON.parse(rawLegacyDraft) as Partial<LegacyEvaluationDraft>;
    const migratedRecord = createEmptyEvaluationRecord();

    const safeCurrentStep = legacyDraft.currentStep ?? 'timer';
    const safeSelectedCategory = legacyDraft.selectedSterCategory ?? 'LL';

    const nextRecord: EvaluationRecord = {
      ...migratedRecord,
      currentStep: safeCurrentStep,
      timerSeconds:
        typeof legacyDraft.timerSeconds === 'number' && Number.isFinite(legacyDraft.timerSeconds)
          ? Math.max(0, legacyDraft.timerSeconds)
          : 0,
      isRunning: false,
      lessonPlanFileName:
        typeof legacyDraft.lessonPlanFileName === 'string' || legacyDraft.lessonPlanFileName === null
          ? legacyDraft.lessonPlanFileName ?? null
          : null,
      details: {
        studentName: legacyDraft.details?.studentName ?? '',
        teacherName: legacyDraft.details?.teacherName ?? '',
        evaluationDate: legacyDraft.details?.evaluationDate ?? '',
      },
      observationNotes:
        typeof legacyDraft.observationNotes === 'string' ? legacyDraft.observationNotes : '',
      notesFileName:
        typeof legacyDraft.notesFileName === 'string' || legacyDraft.notesFileName === null
          ? legacyDraft.notesFileName ?? null
          : null,
      sterScores:
        legacyDraft.sterScores && typeof legacyDraft.sterScores === 'object'
          ? legacyDraft.sterScores
          : {},
      selectedSterCategory: safeSelectedCategory,
    };

    saveEvaluationRecords([nextRecord]);
    setActiveEvaluationId(nextRecord.id);
  } catch (error) {
    console.error('Failed to migrate legacy evaluation draft:', error);
  } finally {
    window.localStorage.removeItem(LEGACY_EVALUATION_DRAFT_STORAGE_KEY);
  }
}

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
