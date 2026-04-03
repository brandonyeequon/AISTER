// Compact row representing a single STER competency in the STERItemsModal list.
// Shows the competency ID, descriptor, score indicator, and a notes badge if notes exist.

import React from 'react';
import { MessageSquare } from 'lucide-react';
import { Competency, ScoreLevel } from '../../utils/sterData';

export interface STERCollapsedRowProps {
  competency: Competency;
  /** Current score for this competency, or null if unscored. */
  score: ScoreLevel;
  /** True if the evaluator has typed any notes for this competency. */
  hasNotes: boolean;
  /** True if this competency is the one currently shown in the expanded card. */
  isSelected: boolean;
  /** Fires when this row is clicked — closes the modal and switches the expanded card. */
  onSelect: () => void;
}

/** Clickable compact row for a competency shown inside the STERItemsModal. */
export const STERCollapsedRow: React.FC<STERCollapsedRowProps> = ({
  competency,
  score,
  hasNotes,
  isSelected,
  onSelect,
}) => {
  return (
    <button
      onClick={onSelect}
      className={`ster-collapsed-row ${score !== null ? 'is-scored' : ''} ${
        isSelected ? 'bg-blue-50' : ''
      }`}
    >
      <div className="ster-collapsed-row-left">
        <div className="ster-collapsed-id">{competency.id}</div>
        <div className="ster-collapsed-descriptor">
          {competency.descriptor}
        </div>
      </div>
      <div className="ster-collapsed-right">
        {/* Score badge — only shown when a score has been assigned */}
        {score !== null && (
          <div className="ster-score-indicator">{score}</div>
        )}
        {/* Notes icon — only shown when evaluator has added notes */}
        {hasNotes && (
          <div className="ster-notes-indicator">
            <MessageSquare size={16} />
          </div>
        )}
      </div>
    </button>
  );
};
