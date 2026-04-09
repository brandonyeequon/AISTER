// Step 5 of the evaluation form — the main STER scoring interface.
// Wires STERNavigator (category sidebar), STERScoringInterface (scoring cards), and TimerFloat (sidebar timer).

import React from 'react';
import { STERNavigator } from '../STER/STERNavigator';
import { STERScoringInterface } from '../STER/STERScoringInterface';
import { TimerFloat } from '../STER/TimerFloat';
import { STERScores, ScoreLevel } from '../../utils/sterData';

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
  evaluationNotes: string;
  onEvaluationNotesChange: (notes: string) => void;
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
  evaluationNotes,
  onEvaluationNotesChange,
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
          <h3 className="text-lg font-bold text-primary">Final Evaluation Notes</h3>
          <p className="mt-1 text-sm text-text">
            Capture overall evidence and recommendations once all category scores are complete.
          </p>
          <textarea
            value={evaluationNotes}
            onChange={(event) => onEvaluationNotesChange(event.target.value)}
            placeholder="Add your final evaluation summary and next-step recommendations..."
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
