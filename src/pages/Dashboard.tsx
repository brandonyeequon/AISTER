// Teacher dashboard showing quick stats and recent evaluations.
// Data is loaded from the local evaluation record store so users can resume drafts and review reports.

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Card } from '../components/Card';
import { useAuth } from '../context/AuthContext';
import {
  ArrowRight,
  CheckCircle,
  CircleDashed,
  ClipboardCheck,
  Eye,
  PencilLine,
  Play,
  Search,
} from 'lucide-react';
import {
  EvaluationRecord,
  EvaluationStatus,
  getEvaluationRecords,
  getEvaluationSummary,
  migrateLegacyDraftIfNeeded,
  setActiveEvaluationId,
  startNewEvaluationRecord,
  wasEditedAfterSubmission,
} from '../utils/evaluationRecords';
import {
  getCategoryCompletion,
  getCompetenciesInCategory,
  SCORE_LABELS,
  ScoreLevel,
} from '../utils/sterData';

type EvaluationFilter = 'all' | 'in-progress' | 'completed';

const CATEGORY_ORDER = ['LL', 'IC', 'IP', 'CC', 'PR'];

const CATEGORY_LABELS: Record<string, string> = {
  LL: 'Learners & Learning',
  IC: 'Instructional Clarity',
  IP: 'Instructional Practice',
  CC: 'Classroom Climate',
  PR: 'Professional Responsibility',
};

const FILTER_OPTIONS: Array<{ key: EvaluationFilter; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'in-progress', label: 'In Progress' },
  { key: 'completed', label: 'Completed' },
];

/** Formats an ISO timestamp into a short human-readable date. */
const formatDate = (isoDate: string) => {
  if (!isoDate) {
    return 'Not set';
  }

  return new Date(isoDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

/** Returns the status badge classes used in rows and report headers. */
const getStatusBadgeClassName = (status: EvaluationStatus) => {
  if (status === 'completed') {
    return 'bg-primary/10 text-primary border border-primary/30';
  }

  return 'bg-amber-100 text-amber-700 border border-amber-200';
};

/** Returns a display label for the status chip. */
const getStatusLabel = (status: EvaluationStatus) => {
  return status === 'completed' ? 'Completed' : 'In Progress';
};

interface EvaluationReportModalProps {
  record: EvaluationRecord;
  onClose: () => void;
  onEdit: (recordId: string) => void;
}

/** Summary-first report modal with print/export and edit actions for completed evaluations. */
const EvaluationReportModal: React.FC<EvaluationReportModalProps> = ({ record, onClose, onEdit }) => {
  const summary = getEvaluationSummary(record);
  const isEdited = wasEditedAfterSubmission(record);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-gray-200 bg-white/95 px-6 py-5 backdrop-blur">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusBadgeClassName(record.status)}`}>
                {getStatusLabel(record.status)}
              </span>
              {isEdited && (
                <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                  Edited
                </span>
              )}
            </div>
            <h3 className="text-2xl font-black text-primary">
              {record.details.studentName || 'Unnamed Evaluation'}
            </h3>
            <p className="text-sm text-text">
              Teacher: {record.details.teacherName || 'Not set'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-md border border-gray-200 px-3 py-2 text-sm font-semibold text-text hover:bg-gray-50"
          >
            Close
          </button>
        </div>

        <div className="space-y-6 p-6">
          <Card className="bg-bg/40">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-text">Overall Score</p>
                <p className="text-3xl font-black text-primary">{summary.overallScorePercent}%</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-text">Eligibility</p>
                <p className="text-xl font-bold text-primary">
                  {summary.isEligibleToPass ? 'Eligible To Pass' : 'Needs Review'}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-text">Completion</p>
                <p className="text-xl font-bold text-primary">
                  {summary.scoredCompetencies}/{summary.totalCompetencies} ({summary.completionPercent}%)
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-text">Observed Coverage</p>
                <p className="text-xl font-bold text-primary">{summary.observedCoveragePercent}%</p>
              </div>
            </div>

            <div className="mt-3 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-text">
              Not Observed: {summary.notObservedCompetencies} | Last Updated: {formatDate(record.updatedAt)}
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                onClick={() => window.print()}
                className="rounded-md border-2 border-primary px-4 py-2 text-sm font-bold text-primary hover:bg-primary hover:text-white"
              >
                Print / Export PDF
              </button>
              <button
                onClick={() => onEdit(record.id)}
                className="rounded-md bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary-dark"
              >
                Edit Evaluation
              </button>
            </div>
          </Card>

          <Card>
            <h4 className="mb-4 text-xl font-bold text-primary">Category Breakdown</h4>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {CATEGORY_ORDER.map((categoryCode) => {
                const completion = getCategoryCompletion(categoryCode, record.sterScores);
                const competencies = getCompetenciesInCategory(categoryCode);
                const scoredValues = competencies
                  .map((competency) => record.sterScores[competency.id]?.score)
                  .filter(
                    (score): score is Exclude<ScoreLevel, null | 4> =>
                      score !== null && score !== undefined && score !== 4
                  );
                const notObservedInCategory = competencies.filter(
                  (competency) => record.sterScores[competency.id]?.score === 4
                ).length;
                const categoryScore =
                  scoredValues.length === 0
                    ? 0
                    : Math.round((scoredValues.reduce<number>((sum, score) => sum + score, 0) / (scoredValues.length * 3)) * 100);

                return (
                  <div key={categoryCode} className="rounded-lg border border-gray-200 bg-white p-4">
                    <p className="text-sm font-bold text-primary">{categoryCode} - {CATEGORY_LABELS[categoryCode]}</p>
                    <p className="text-sm text-text">{completion.scored}/{completion.total} scored</p>
                    <p className="text-xs text-text">Not Observed: {notObservedInCategory}</p>
                    <p className="mt-1 text-lg font-black text-primary">{categoryScore}%</p>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card>
            <h4 className="mb-4 text-xl font-bold text-primary">Full Competency Detail</h4>
            <div className="space-y-5">
              {CATEGORY_ORDER.map((categoryCode) => (
                <div key={categoryCode}>
                  <h5 className="mb-2 text-base font-bold text-primary">
                    {categoryCode} - {CATEGORY_LABELS[categoryCode]}
                  </h5>
                  <div className="space-y-2">
                    {getCompetenciesInCategory(categoryCode).map((competency) => {
                      const scoreData = record.sterScores[competency.id];
                      const scoreLabel =
                        scoreData?.score !== null && scoreData?.score !== undefined
                          ? SCORE_LABELS[scoreData.score]
                          : 'Not scored';

                      return (
                        <div key={competency.id} className="rounded-md border border-gray-200 bg-white p-3">
                          <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                            <p className="font-bold text-primary">{competency.id}: {competency.descriptor}</p>
                            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                              {scoreLabel}
                            </span>
                          </div>
                          {scoreData?.notes && (
                            <p className="text-sm text-text">Notes: {scoreData.notes}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

/** Teacher home screen with stats overview and a recent evaluations list. */
export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [records, setRecords] = useState<EvaluationRecord[]>([]);
  const [activeFilter, setActiveFilter] = useState<EvaluationFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  /** Loads records from localStorage and keeps newest updates first. */
  const refreshRecords = useCallback(() => {
    migrateLegacyDraftIfNeeded();
    const nextRecords = getEvaluationRecords().sort(
      (left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
    );
    setRecords(nextRecords);
  }, []);

  // Sync on mount and when the window regains focus so dashboard reflects recent edits instantly.
  useEffect(() => {
    refreshRecords();
    window.addEventListener('focus', refreshRecords);
    window.addEventListener('storage', refreshRecords);

    return () => {
      window.removeEventListener('focus', refreshRecords);
      window.removeEventListener('storage', refreshRecords);
    };
  }, [refreshRecords]);

  /** Creates a brand-new draft and opens the evaluation workflow immediately. */
  const handleStartNewEvaluation = () => {
    startNewEvaluationRecord();
    navigate('/evaluations');
  };

  /** Opens an existing record for resume/edit by setting it as active first. */
  const handleOpenEvaluation = (recordId: string) => {
    setActiveEvaluationId(recordId);
    navigate('/evaluations');
  };

  /** Opens a completed evaluation's report modal. */
  const handleViewReport = (recordId: string) => {
    setSelectedReportId(recordId);
  };

  const selectedReport = useMemo(
    () => records.find((record) => record.id === selectedReportId) ?? null,
    [records, selectedReportId]
  );

  const filteredRecords = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return records.filter((record) => {
      const matchesFilter = activeFilter === 'all' || record.status === activeFilter;
      const student = record.details.studentName.toLowerCase();
      const teacher = record.details.teacherName.toLowerCase();
      const matchesSearch =
        normalizedQuery.length === 0 ||
        student.includes(normalizedQuery) ||
        teacher.includes(normalizedQuery);

      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, records, searchQuery]);

  const dashboardMetrics = useMemo(() => {
    const completedRecords = records.filter((record) => record.status === 'completed');
    const inProgressRecords = records.filter((record) => record.status === 'in-progress');

    const averageCompletedScore =
      completedRecords.length === 0
        ? 0
        : Math.round(
            completedRecords.reduce(
              (sum, record) => sum + getEvaluationSummary(record).overallScorePercent,
              0
            ) / completedRecords.length
          );

    return {
      total: records.length,
      completed: completedRecords.length,
      inProgress: inProgressRecords.length,
      averageScore: averageCompletedScore,
    };
  }, [records]);

  return (
    <div className="flex flex-col min-h-screen bg-bg">
      <Navbar />

      <main className="flex-1 px-8 py-8">
        {/* Hero Section */}
        <div className="mb-12">
          <h1 className="text-5xl font-black text-primary mb-2">Welcome back, {user?.name || 'Evaluator'}</h1>
          <p className="text-lg text-text mb-8">Track your evaluations and view detailed analytics</p>

          <button
            onClick={handleStartNewEvaluation}
            className="bg-primary text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-primary-dark transition flex items-center gap-2 shadow-md hover:shadow-lg"
          >
            <span>Start New Evaluation</span>
            <ArrowRight size={20} />
          </button>
        </div>

        {/* Quick Stats from local evaluation records */}
        <h2 className="text-2xl font-bold text-primary mb-6">Your Quick Stats</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-text mb-2">Total Evaluations</p>
                <p className="text-4xl font-black text-primary">{dashboardMetrics.total}</p>
              </div>
              <CheckCircle size={28} className="text-primary opacity-40" />
            </div>
          </Card>

          <Card>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-text mb-2">In Progress</p>
                <p className="text-4xl font-black text-primary">{dashboardMetrics.inProgress}</p>
                <p className="text-xs text-text mt-1">Ready to continue</p>
              </div>
              <CircleDashed size={28} className="text-amber-500 opacity-60" />
            </div>
          </Card>

          <Card>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-text mb-2">Completed</p>
                <p className="text-4xl font-black text-primary">{dashboardMetrics.completed}</p>
                <p className="text-xs text-text mt-1">Submitted reports</p>
              </div>
              <ClipboardCheck size={28} className="text-primary opacity-40" />
            </div>
          </Card>

          <Card>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-text mb-2">Average Completed Score</p>
                <p className="text-4xl font-black text-primary">{dashboardMetrics.averageScore}%</p>
                <p className="text-xs text-text mt-1">Completed evaluations only</p>
              </div>
              <CheckCircle size={28} className="text-primary opacity-40" />
            </div>
          </Card>
        </div>

        {/* History + in-progress list with filters and search */}
        <div>
          <h2 className="text-2xl font-bold text-primary mb-6">My Evaluations</h2>
          <Card>
            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap gap-2">
                {FILTER_OPTIONS.map((option) => (
                  <button
                    key={option.key}
                    onClick={() => setActiveFilter(option.key)}
                    className={`rounded-md px-4 py-2 text-sm font-bold transition ${
                      activeFilter === option.key
                        ? 'bg-primary text-white'
                        : 'border border-primary text-primary hover:bg-primary/10'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              <label className="relative block w-full lg:w-80">
                <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text" />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search student or teacher"
                  className="w-full rounded-md border border-gray-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-primary"
                />
              </label>
            </div>

            <div className="space-y-3">
              {filteredRecords.length === 0 && (
                <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center">
                  <p className="text-base font-semibold text-primary">No evaluations match this view yet.</p>
                  <p className="mt-1 text-sm text-text">Start a new evaluation or adjust your filters.</p>
                </div>
              )}

              {filteredRecords.map((record) => {
                const summary = getEvaluationSummary(record);
                const statusLabel = getStatusLabel(record.status);
                const isEdited = wasEditedAfterSubmission(record);

                return (
                  <div
                    key={record.id}
                    className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-4 transition hover:bg-gray-50 lg:flex-row lg:items-center lg:justify-between"
                  >
                    <div>
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-primary">{record.details.studentName || 'Unnamed Evaluation'}</p>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${getStatusBadgeClassName(record.status)}`}>
                          {statusLabel}
                        </span>
                        {isEdited && (
                          <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-700">
                            Edited
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-text">
                        Teacher: {record.details.teacherName || 'Not set'} | Eval Date: {record.details.evaluationDate || 'Not set'}
                      </p>
                      <p className="text-xs text-text mt-1">Last updated: {formatDate(record.updatedAt)}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 lg:justify-end">
                      <div className="text-left lg:text-right">
                        <p className="text-xl font-black text-primary">{summary.overallScorePercent}%</p>
                        <p className="text-xs text-text">
                          {summary.scoredCompetencies}/{summary.totalCompetencies} scored
                        </p>
                      </div>

                      {record.status === 'in-progress' ? (
                        <button
                          onClick={() => handleOpenEvaluation(record.id)}
                          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary-dark"
                        >
                          <Play size={14} />
                          Continue
                        </button>
                      ) : (
                        <button
                          onClick={() => handleViewReport(record.id)}
                          className="inline-flex items-center gap-2 rounded-md border-2 border-primary px-4 py-2 text-sm font-bold text-primary hover:bg-primary hover:text-white"
                        >
                          <Eye size={14} />
                          View Report
                        </button>
                      )}

                      {record.status === 'completed' && (
                        <button
                          onClick={() => handleOpenEvaluation(record.id)}
                          className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-bold text-primary hover:bg-gray-100"
                        >
                          <PencilLine size={14} />
                          Edit
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </main>

      {selectedReport && (
        <EvaluationReportModal
          record={selectedReport}
          onClose={() => setSelectedReportId(null)}
          onEdit={(recordId) => {
            setSelectedReportId(null);
            handleOpenEvaluation(recordId);
          }}
        />
      )}
    </div>
  );
};
