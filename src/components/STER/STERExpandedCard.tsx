import React from 'react';
import { MessageSquare } from 'lucide-react';
import { Competency, SCORE_LABELS, ScoreLevel } from '../../utils/sterData';

export interface STERExpandedCardProps {
  competency: Competency;
  selectedScore: ScoreLevel;
  onScoreSelect: (score: ScoreLevel) => void;
  notes: string;
  onNotesChange: (notes: string) => void;
}

export const STERExpandedCard: React.FC<STERExpandedCardProps> = ({
  competency,
  selectedScore,
  onScoreSelect,
  notes,
  onNotesChange,
}) => {
  return (
    <div className="ster-expanded-card">
      {/* Header */}
      <div className="ster-expanded-header">
        <div className="ster-competency-id">{competency.id}</div>
        <div className="ster-competency-info">
          <p className="ster-competency-descriptor">{competency.descriptor}</p>
        </div>
      </div>

      {/* Scoring Pills */}
      <div className="ster-scoring-section">
        <label className="ster-scoring-label">Select Performance Level</label>
        <div className="ster-scoring-pills">
          {([0, 1, 2, 3] as const).map((level) => (
            <button
              key={level}
              onClick={() => onScoreSelect(level)}
              className={`ster-score-pill score-${level} ${
                selectedScore === level ? 'is-selected' : ''
              }`}
            >
              <span className="ster-score-number">{level}</span>
              <span className="ster-score-label">
                {SCORE_LABELS[level as 0 | 1 | 2 | 3]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Notes Section */}
      <div className="ster-notes-section mb-6">
        <label className="ster-scoring-label flex items-center gap-2">
          <MessageSquare size={16} />
          Evaluator Notes
        </label>
        <textarea
          className="ster-notes-textarea"
          placeholder="Add specific observations, evidence, or notes about this competency..."
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
        />
      </div>

      {/* Rubric Section */}
      <div className="ster-rubric-section">
        <label className="ster-scoring-label">Performance Descriptors</label>
        <div className="ster-rubric-rows">
          {([0, 1, 2, 3] as const).map((level) => (
            <div
              key={level}
              className={`ster-rubric-row level-${level}`}
            >
              <div className="ster-rubric-level-badge">{level}</div>
              <div className="ster-rubric-content">
                <div className="ster-rubric-title">
                  {competency.rubric[`level${level}` as keyof typeof competency.rubric].label}
                </div>
                <div className="ster-rubric-description">
                  {competency.rubric[`level${level}` as keyof typeof competency.rubric].description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
