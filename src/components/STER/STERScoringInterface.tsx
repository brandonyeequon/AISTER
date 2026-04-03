// Central scoring panel for a single STER category.
// Shows the expanded card for the currently selected competency.
// Also renders the "View All Items" modal for jumping between competencies in the same category.

import React, { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { STER_COMPETENCIES, STERScores, ScoreLevel } from '../../utils/sterData';
import { STERExpandedCard } from './STERExpandedCard';
import { STERItemsModal } from './STERItemsModal';

export interface STERScoringInterfaceProps {
  /** Active category code (e.g., "LL"). */
  category: string;
  /** All current scores across all categories, used to populate the expanded card and modal. */
  scores: STERScores;
  /** Callback fired when the evaluator changes a score or notes for any competency. */
  onScoreUpdate: (competencyId: string, score: ScoreLevel, notes: string) => void;
}

/** Displays the scoring UI for a single STER category — expanded card + items modal. */
export const STERScoringInterface: React.FC<STERScoringInterfaceProps> = ({
  category,
  scores,
  onScoreUpdate,
}) => {
  const competencies = STER_COMPETENCIES[category] || [];

  // Track which competency is currently shown in the expanded card.
  // Defaults to the first competency in the category.
  const [expandedCompetencyId, setExpandedCompetencyId] = useState<string | null>(
    competencies.length > 0 ? competencies[0].id : null
  );
  const [showAllItems, setShowAllItems] = useState(false);

  // When the category changes (e.g., evaluator clicks a different category in STERNavigator),
  // reset the expanded competency to the first item in the new category.
  // If the currently expanded competency exists in the new category, keep it selected.
  useEffect(() => {
    if (competencies.length === 0) {
      setExpandedCompetencyId(null);
      return;
    }

    setExpandedCompetencyId((currentId) => {
      // Keep the current selection if it belongs to the new category
      if (currentId && competencies.some((competency) => competency.id === currentId)) {
        return currentId;
      }
      // Otherwise fall back to the first competency in the new category
      return competencies[0].id;
    });
  }, [category, competencies]);

  const expandedCompetency = competencies.find(
    (c) => c.id === expandedCompetencyId
  );

  /**
   * Handles a score pill click in the expanded card.
   * Preserves any existing notes for the competency when updating the score.
   */
  const handleScoreSelect = (score: ScoreLevel) => {
    if (expandedCompetency) {
      const notes = scores[expandedCompetency.id]?.notes || '';
      onScoreUpdate(expandedCompetency.id, score, notes);
    }
  };

  /**
   * Handles notes textarea changes in the expanded card.
   * Preserves the existing score when updating notes.
   */
  const handleNotesChange = (notes: string) => {
    if (expandedCompetency) {
      // Use ?? null rather than || null so score=0 ("Not Met") is not treated as falsy
      const score = scores[expandedCompetency.id]?.score ?? null;
      onScoreUpdate(expandedCompetency.id, score, notes);
    }
  };

  /** How many competencies in this category have a non-null score, for the button label. */
  const categoryCompletion = competencies.filter(
    (c) => scores[c.id]?.score !== null
  ).length;

  return (
    <>
      <div className="ster-scoring-interface">
        {expandedCompetency && (
          <div className="ster-expanded-wrapper">
            <STERExpandedCard
              competency={expandedCompetency}
              selectedScore={scores[expandedCompetency.id]?.score ?? null}
              onScoreSelect={handleScoreSelect}
              notes={scores[expandedCompetency.id]?.notes || ''}
              onNotesChange={handleNotesChange}
            />

            {/* Opens the modal listing all competencies so the evaluator can jump between them */}
            <div className="ster-expanded-footer">
              <button
                className="ster-expand-all-button"
                onClick={() => setShowAllItems(true)}
              >
                <ChevronDown size={18} />
                <span>View All Items ({categoryCompletion}/{competencies.length})</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal rendered outside the main div to avoid stacking context issues */}
      <STERItemsModal
        isOpen={showAllItems}
        category={category}
        scores={scores}
        expandedCompetencyId={expandedCompetencyId}
        onClose={() => setShowAllItems(false)}
        // Selecting an item in the modal closes it and switches the expanded card
        onSelectItem={setExpandedCompetencyId}
      />
    </>
  );
};
