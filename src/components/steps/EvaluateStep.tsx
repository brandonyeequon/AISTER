// Step 5 of the evaluation form — the main STER scoring interface.
// Wires STERNavigator (category sidebar), STERScoringInterface (scoring cards), and TimerFloat (sidebar timer).

import React from 'react';
import { STERNavigator } from '../STER/STERNavigator';
import { STERScoringInterface } from '../STER/STERScoringInterface';
import { TimerFloat } from '../STER/TimerFloat';
import { STERScores, ScoreLevel } from '../../utils/sterData';
import { CategoryFinalNotes, STERCategoryCode, STER_CATEGORY_ORDER } from '../../utils/evaluationRecords';

const CATEGORY_LABELS: Record<STERCategoryCode, string> = {
  LL: 'Learners & Learning',
  IC: 'Instructional Clarity',
  IP: 'Instructional Practice',
  CC: 'Classroom Climate',
  PR: 'Professional Responsibility',
};

interface EvaluateStepProps {
  timerSeconds: number;
  isRunning: boolean;
  onStart: () => void;
  onPause: () => void;
  onRestart: () => void;
  showTimerDisplay: boolean;
  onToggleTimerDisplay: () => void;
  sterScores: STERScores;
  onSterScoresChange: (scores: STERScores) => void;
  selectedCategory: string;
  onSelectedCategoryChange: (category: string) => void;
  categoryFinalNotes: CategoryFinalNotes;
  onCategoryFinalNotesChange: (category: STERCategoryCode, notes: string) => void;
}

/** Final step that scores STER competencies and keeps timer controls visible in the sidebar. */
export const EvaluateStep: React.FC<EvaluateStepProps> = ({
  timerSeconds,
  isRunning,
  onStart,
  onPause,
  onRestart,
  showTimerDisplay,
  onToggleTimerDisplay,
  sterScores,
  onSterScoresChange,
  selectedCategory,
  onSelectedCategoryChange,
  categoryFinalNotes,
  onCategoryFinalNotesChange,
}) => {
  const handleScoreUpdate = (
    competencyId: string,
    score: ScoreLevel,
    notes: string
  ) => {
    onSterScoresChange({
      ...sterScores,
      [competencyId]: { score, notes },
    });
  };

  // Keeps notes editing stable when selectedCategory is empty or malformed.
  const activeCategory: STERCategoryCode = STER_CATEGORY_ORDER.includes(
    selectedCategory as STERCategoryCode
  )
    ? (selectedCategory as STERCategoryCode)
    : 'LL';

  return (
    <div className="evaluation-content evaluation-content-ster">
      {/* Left Sidebar - STER Navigator */}
      <STERNavigator
        selectedCategory={selectedCategory}
        onCategorySelect={onSelectedCategoryChange}
        scores={sterScores}
      />

      {/* Center - STER Scoring Interface */}
      <div className="flex min-h-0 flex-1 flex-col gap-5">
        {selectedCategory && (
          <STERScoringInterface
            category={selectedCategory}
            scores={sterScores}
            onScoreUpdate={handleScoreUpdate}
          />
        )}

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-bold text-primary">Category Final Notes</h3>
          <p className="mt-1 text-sm text-text">
            Add a separate final summary for each STER category so LL, IC, IP, CC, and PR remain distinct.
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {STER_CATEGORY_ORDER.map((categoryCode) => {
              const isActive = categoryCode === activeCategory;
              const hasNotes = categoryFinalNotes[categoryCode].trim().length > 0;

              return (
                <button
                  key={categoryCode}
                  type="button"
                  onClick={() => onSelectedCategoryChange(categoryCode)}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                    isActive
                      ? 'border-primary bg-primary text-white'
                      : 'border-primary/30 bg-white text-primary hover:bg-primary/10'
                  }`}
                >
                  {categoryCode}
                  {hasNotes ? ' *' : ''}
                </button>
              );
            })}
          </div>

          <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-text">
            {activeCategory} - {CATEGORY_LABELS[activeCategory]}
          </p>
          <textarea
            value={categoryFinalNotes[activeCategory]}
            onChange={(event) => onCategoryFinalNotesChange(activeCategory, event.target.value)}
            placeholder={`Add final summary notes for ${CATEGORY_LABELS[activeCategory]}...`}
            className="mt-3 min-h-36 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-primary"
          />
        </div>
      </div>

      {/* Right Sidebar - Timer */}
      <TimerFloat
        timerSeconds={timerSeconds}
        isRunning={isRunning}
        onStart={onStart}
        onPause={onPause}
        onRestart={onRestart}
        showTimerDisplay={showTimerDisplay}
        onToggleTimerDisplay={onToggleTimerDisplay}
        className="ster-timer-sidebar"
      />
    </div>
  );
};
