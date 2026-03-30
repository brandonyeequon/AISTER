import React from 'react';
import { X } from 'lucide-react';
import { STER_COMPETENCIES, STERScores } from '../../utils/sterData';

export interface STERItemsModalProps {
  isOpen: boolean;
  category: string;
  scores: STERScores;
  expandedCompetencyId: string | null;
  onClose: () => void;
  onSelectItem: (competencyId: string) => void;
}

export const STERItemsModal: React.FC<STERItemsModalProps> = ({
  isOpen,
  category,
  scores,
  expandedCompetencyId,
  onClose,
  onSelectItem,
}) => {
  if (!isOpen) return null;

  const competencies = STER_COMPETENCIES[category] || [];

  const handleRowClick = (competencyId: string) => {
    onSelectItem(competencyId);
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className="ster-modal-overlay"
        onClick={onClose}
      />

      {/* Modal */}
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
