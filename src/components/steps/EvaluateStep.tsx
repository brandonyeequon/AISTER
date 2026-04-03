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
      {selectedCategory && (
        <STERScoringInterface
          category={selectedCategory}
          scores={sterScores}
          onScoreUpdate={handleScoreUpdate}
        />
      )}

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
