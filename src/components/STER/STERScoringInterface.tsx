// Survey-style scoring matrix for a single STER category.
// Replaces modal-based competency navigation with one-click score cells.

import React, { useEffect, useMemo, useState } from 'react';
import { Filter } from 'lucide-react';
import { SCORE_LABELS, STER_COMPETENCIES, STERScores, ScoreLevel } from '../../utils/sterData';

export interface STERScoringInterfaceProps {
  /** Active category code (e.g., "LL"). */
  category: string;
  /** All current scores across all categories, used to populate matrix rows. */
  scores: STERScores;
  /** Callback fired when the evaluator changes a score for any competency. */
  onScoreUpdate: (competencyId: string, score: ScoreLevel, notes: string) => void;
}

const SCORE_OPTIONS: Array<{ value: 4 | 1 | 2 | 3; shortLabel: string; title: string }> = [
  { value: 4, shortLabel: 'N/O', title: SCORE_LABELS[4] },
  { value: 1, shortLabel: '1', title: SCORE_LABELS[1] },
  { value: 2, shortLabel: '2', title: SCORE_LABELS[2] },
  { value: 3, shortLabel: '3', title: SCORE_LABELS[3] },
];

/** Displays a fast matrix scorer for a category with Not Observed, 1, 2, and 3 options. */
export const STERScoringInterface: React.FC<STERScoringInterfaceProps> = ({
  category,
  scores,
  onScoreUpdate,
}) => {
  const competencies = STER_COMPETENCIES[category] || [];
  const [showUnansweredOnly, setShowUnansweredOnly] = useState(false);
  const [selectedCompetencyId, setSelectedCompetencyId] = useState<string | null>(null);

  // Keep a valid selected competency whenever category content changes.
  useEffect(() => {
    if (competencies.length === 0) {
      setSelectedCompetencyId(null);
      return;
    }

    setSelectedCompetencyId((previousSelectedId) => {
      if (previousSelectedId && competencies.some((competency) => competency.id === previousSelectedId)) {
        return previousSelectedId;
      }

      return competencies[0].id;
    });
  }, [competencies]);

  /** Returns completion metrics for quick progress and filtering controls. */
  const completionMetrics = useMemo(() => {
    const answered = competencies.filter((competency) => {
      const score = scores[competency.id]?.score;
      return score !== null && score !== undefined;
    }).length;

    const notObserved = competencies.filter((competency) => scores[competency.id]?.score === 4).length;
    const legacyNotMet = competencies.filter((competency) => scores[competency.id]?.score === 0).length;

    return {
      answered,
      notObserved,
      legacyNotMet,
      total: competencies.length,
    };
  }, [competencies, scores]);

  /** Filters competencies to unanswered only when the toggle is enabled. */
  const visibleCompetencies = useMemo(() => {
    if (!showUnansweredOnly) {
      return competencies;
    }

    return competencies.filter((competency) => {
      const score = scores[competency.id]?.score;
      return score === null || score === undefined;
    });
  }, [competencies, scores, showUnansweredOnly]);

  /** Handles one-click score assignment while preserving any existing notes payload. */
  const handleScoreSelect = (competencyId: string, nextScore: 4 | 1 | 2 | 3) => {
    const existingNotes = scores[competencyId]?.notes || '';
    onScoreUpdate(competencyId, nextScore, existingNotes);
  };

  const selectedCompetency =
    selectedCompetencyId
      ? competencies.find((competency) => competency.id === selectedCompetencyId) ?? null
      : null;

  const selectedCompetencyNotes = selectedCompetencyId
    ? scores[selectedCompetencyId]?.notes?.trim() ?? ''
    : '';

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 bg-white p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-2xl font-black text-primary">{category} Survey Scoring</h3>
            <p className="text-sm text-text">
              Choose one option for each competency: Not Observed, 1, 2, or 3.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
            <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-primary">
              Answered: {completionMetrics.answered}/{completionMetrics.total}
            </span>
            <span className="rounded-full border border-gray-300 bg-gray-100 px-3 py-1 text-gray-700">
              Not Observed: {completionMetrics.notObserved}
            </span>
            {completionMetrics.legacyNotMet > 0 && (
              <span className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-red-700">
                Legacy 0 Scores: {completionMetrics.legacyNotMet}
              </span>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setShowUnansweredOnly((previous) => !previous)}
            className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-bold transition ${
              showUnansweredOnly
                ? 'bg-primary text-white'
                : 'border border-primary/40 bg-white text-primary hover:bg-primary/10'
            }`}
          >
            <Filter size={14} />
            {showUnansweredOnly ? 'Showing Unanswered Only' : 'Show Unanswered Only'}
          </button>

          <p className="text-xs text-text">Tip: work top to bottom for fastest completion.</p>
        </div>
      </div>

      <div className="max-h-[58vh] overflow-auto bg-white">
        <table className="w-full border-collapse text-left">
          <thead className="sticky top-0 z-10 border-y border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-text">Competency</th>
              {SCORE_OPTIONS.map((option) => (
                <th
                  key={option.value}
                  className="px-2 py-3 text-center text-xs font-bold uppercase tracking-wide text-text"
                >
                  {option.shortLabel}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {visibleCompetencies.map((competency) => {
              const selectedScore = scores[competency.id]?.score ?? null;
              const isNotesSelected = competency.id === selectedCompetencyId;

              return (
                <tr
                  key={competency.id}
                  className={`border-b border-gray-100 even:bg-gray-50/40 ${
                    isNotesSelected ? 'bg-primary/5' : ''
                  }`}
                >
                  <td className="px-4 py-3 align-top">
                    <button
                      type="button"
                      onClick={() => setSelectedCompetencyId(competency.id)}
                      className="flex w-full items-start gap-2 rounded-md p-1 text-left transition hover:bg-primary/5"
                    >
                      <span className="inline-flex min-w-[42px] items-center justify-center rounded-md bg-gray-100 px-2 py-1 text-xs font-black text-primary">
                        {competency.id}
                      </span>
                      <p className="text-sm font-semibold leading-snug text-gray-800">{competency.descriptor}</p>
                    </button>
                  </td>

                  {SCORE_OPTIONS.map((option) => {
                    const isSelected = selectedScore === option.value;

                    return (
                      <td key={option.value} className="px-2 py-3 text-center align-middle">
                        <button
                          type="button"
                          title={option.title}
                          aria-label={`${competency.id} ${option.title}`}
                          onClick={() => handleScoreSelect(competency.id, option.value)}
                          className={`h-8 w-8 rounded-full border-2 transition ${
                            isSelected
                              ? 'border-primary bg-primary text-white shadow-md'
                              : 'border-gray-300 bg-white text-transparent hover:border-primary/60 hover:bg-primary/5'
                          }`}
                        >
                          ●
                        </button>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>

        {visibleCompetencies.length === 0 && (
          <div className="px-4 py-8 text-center">
            <p className="text-sm font-semibold text-primary">All competencies in this category are answered.</p>
            <p className="text-xs text-text">Disable the unanswered filter to review and edit scores.</p>
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 bg-white p-4">
        <h4 className="text-sm font-bold uppercase tracking-wide text-primary">Selected Competency Notes</h4>
        {selectedCompetency ? (
          <>
            <p className="mt-1 text-sm font-semibold text-gray-800">
              {selectedCompetency.id}: {selectedCompetency.descriptor}
            </p>
            <div className="mt-2 rounded-md border border-gray-200 bg-gray-50 p-3">
              {selectedCompetencyNotes ? (
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedCompetencyNotes}</p>
              ) : (
                <p className="text-sm text-text">No evaluator notes yet for this competency.</p>
              )}
            </div>
          </>
        ) : (
          <p className="mt-2 text-sm text-text">Select a competency row to view AI and evaluator notes.</p>
        )}
      </div>
    </div>
  );
};