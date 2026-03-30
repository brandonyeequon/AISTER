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
  sterScores: STERScores;
  onSterScoresChange: (scores: STERScores) => void;
  selectedCategory: string;
  onSelectedCategoryChange: (category: string) => void;
}

export const EvaluateStep: React.FC<EvaluateStepProps> = ({
  timerSeconds,
  isRunning,
  onStart,
  onPause,
  onRestart,
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
        className="ster-timer-sidebar"
      />
    </div>
  );
};
