// Full scoring card for a single STER competency.
// Shows the competency descriptor, score selection pills (0–3), rubric level descriptors,
// and a notes textarea for evaluator observations.

import React from 'react';
import { MessageSquare } from 'lucide-react';
import { Competency, SCORE_LABELS, ScoreLevel } from '../../utils/sterData';

export interface STERExpandedCardProps {
  /** The competency being scored. */
  competency: Competency;
  /** Currently selected score, or null if unscored. */
  selectedScore: ScoreLevel;
  /** Fires when a score pill is clicked. */
  onScoreSelect: (score: ScoreLevel) => void;
  /** Current evaluator notes for this competency. */
  notes: string;
  /** Fires on every keystroke in the notes textarea. */
  onNotesChange: (notes: string) => void;
}

/** Full competency scoring card with rubric descriptors and evaluator notes. */
export const STERExpandedCard: React.FC<STERExpandedCardProps> = ({
  competency,
  selectedScore,
  onScoreSelect,
  notes,
  onNotesChange,
}) => {
  return (
    <div className="ster-expanded-card">
      {/* Competency header — ID badge + descriptor text */}
      <div className="ster-expanded-header">
        <div className="ster-competency-id">{competency.id}</div>
        <div className="ster-competency-info">
          <p className="ster-competency-descriptor">{competency.descriptor}</p>
        </div>
      </div>

      {/* Score selection pills — one pill per level (0=Not Met, 1=Developing, 2=Proficient, 3=Distinction) */}
      <div className="ster-scoring-section">
        <label className="ster-scoring-label">Select Performance Level</label>
        <div className="ster-scoring-pills">
          {([0, 1, 2, 3] as const).map((level) => (
            <button
              key={level}
              onClick={() => onScoreSelect(level)}
              // CSS classes score-0 through score-3 control color; is-selected adds the highlight ring
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

      {/* Rubric descriptors — shows the full text for all 4 levels so the evaluator
          can read the criteria before scoring without any additional navigation. */}
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
                  {/* Dynamic key lookup: "level0", "level1", etc. */}
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

      {/* Evaluator notes — free-text observations tied to this specific competency */}
      <div className="ster-notes-section">
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
    </div>
  );
};
