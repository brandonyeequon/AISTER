// Modal that lists all competencies in the currently active STER category.
// Allows the evaluator to see all items at a glance and jump to any competency
// without clicking through one by one in the expanded card.

import React from 'react';
import { X } from 'lucide-react';
import { STER_COMPETENCIES, STERScores } from '../../utils/sterData';

export interface STERItemsModalProps {
  /** Controls whether the modal is visible. */
  isOpen: boolean;
  /** Category code whose items are listed (e.g., "LL"). */
  category: string;
  /** All current scores, used to show score badges on each row. */
  scores: STERScores;
  /** ID of the competency currently shown in the expanded card — highlighted in the list. */
  expandedCompetencyId: string | null;
  /** Fires when the modal should close (overlay click or X button). */
  onClose: () => void;
  /** Fires when a row is clicked — passes the competency ID to the parent for selection. */
  onSelectItem: (competencyId: string) => void;
}

/** Modal overlay listing all competencies in a category for quick navigation. */
export const STERItemsModal: React.FC<STERItemsModalProps> = ({
  isOpen,
  category,
  scores,
  expandedCompetencyId,
  onClose,
  onSelectItem,
}) => {
  // Return nothing if closed — avoids rendering hidden modal content in the DOM
  if (!isOpen) return null;

  const competencies = STER_COMPETENCIES[category] || [];

  /**
   * Clicking a row selects the competency and closes the modal so the evaluator
   * returns to the expanded card with the selected item.
   */
  const handleRowClick = (competencyId: string) => {
    onSelectItem(competencyId);
    onClose();
  };

  return (
    <>
      {/* Semi-transparent overlay — clicking it dismisses the modal */}
      <div
        className="ster-modal-overlay"
        onClick={onClose}
      />

      <div className="ster-modal">
        <div className="ster-modal-header">
          <h3 className="ster-modal-title">
            All Items in {category}
          </h3>
          <button
            className="ster-modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="ster-modal-content">
          {competencies.map((competency) => (
            <button
              key={competency.id}
              className="ster-modal-row"
              onClick={() => handleRowClick(competency.id)}
            >
              <div className="ster-modal-row-left">
                {/* Highlight the ID badge for the currently expanded competency */}
                <div
                  className={`ster-modal-id ${
                    competency.id === expandedCompetencyId ? 'is-active' : ''
                  }`}
                >
                  {competency.id}
                </div>
                <div className="ster-modal-descriptor">
                  {competency.descriptor}
                </div>
              </div>
              {/* Show the score value if this competency has been scored */}
              {scores[competency.id]?.score !== null && (
                <div className="ster-modal-score">
                  {scores[competency.id]?.score}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};
