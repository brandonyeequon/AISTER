import React from 'react';
import { MessageSquare } from 'lucide-react';
import { Competency, ScoreLevel } from '../../utils/sterData';

export interface STERCollapsedRowProps {
  competency: Competency;
  score: ScoreLevel;
  hasNotes: boolean;
  isSelected: boolean;
  onSelect: () => void;
}

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
        {score !== null && (
          <div className="ster-score-indicator">{score}</div>
        )}
        {hasNotes && (
          <div className="ster-notes-indicator">
            <MessageSquare size={16} />
          </div>
        )}
      </div>
    </button>
  );
};
