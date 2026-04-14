import React from 'react';
import { STERNavigator } from '../STER/STERNavigator';
import { STERScoringInterface } from '../STER/STERScoringInterface';
import { TimerFloat } from '../STER/TimerFloat';
import { STERScores, ScoreLevel } from '../../utils/sterData';
import { supabase } from '../../utils/supabase';

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

  const handleAIAnalysis = async () => {
    try {
      alert('Generating AI Analysis...');
      const { data, error } = await supabase.functions.invoke('ai-analysis', {
        body: { evaluationData: sterScores },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.feedback) {
        alert('AI Analysis Result:\n\n' + data.feedback);
      } else {
        alert('No feedback received from AI.');
      }
    } catch (err: any) {
      console.error('AI Analysis failed:', err);
      alert('Failed to generate AI Analysis: ' + err.message);
    }
  };

  return (
    <div className="evaluation-content evaluation-content-ster">
      {/* Left Sidebar - STER Navigator */}
      <STERNavigator
        selectedCategory={selectedCategory}
        onCategorySelect={onSelectedCategoryChange}
        scores={sterScores}
        onAIAnalysisClick={handleAIAnalysis}
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
