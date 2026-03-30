import React, { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { STER_COMPETENCIES, STERScores, ScoreLevel } from '../../utils/sterData';
import { STERExpandedCard } from './STERExpandedCard';
import { STERItemsModal } from './STERItemsModal';

export interface STERScoringInterfaceProps {
  category: string;
  scores: STERScores;
  onScoreUpdate: (competencyId: string, score: ScoreLevel, notes: string) => void;
}

export const STERScoringInterface: React.FC<STERScoringInterfaceProps> = ({
  category,
  scores,
  onScoreUpdate,
}) => {
  const competencies = STER_COMPETENCIES[category] || [];
  const [expandedCompetencyId, setExpandedCompetencyId] = useState<
    string | null
  >(competencies.length > 0 ? competencies[0].id : null);
  const [showAllItems, setShowAllItems] = useState(false);

  useEffect(() => {
    if (competencies.length === 0) {
      setExpandedCompetencyId(null);
      return;
    }

    setExpandedCompetencyId((currentId) => {
      if (currentId && competencies.some((competency) => competency.id === currentId)) {
        return currentId;
      }
      return competencies[0].id;
    });
  }, [category, competencies]);

  const expandedCompetency = competencies.find(
    (c) => c.id === expandedCompetencyId
  );

  const handleScoreSelect = (score: ScoreLevel) => {
    if (expandedCompetency) {
      const notes = scores[expandedCompetency.id]?.notes || '';
      onScoreUpdate(expandedCompetency.id, score, notes);
    }
  };

  const handleNotesChange = (notes: string) => {
    if (expandedCompetency) {
      const score = scores[expandedCompetency.id]?.score ?? null;
      onScoreUpdate(expandedCompetency.id, score, notes);
    }
  };

  const categoryCompletion = competencies.filter(
    (c) => scores[c.id]?.score !== null
  ).length;

  return (
    <>
      <div className="ster-scoring-interface">
        {/* Expanded Card */}
        {expandedCompetency && (
          <div className="ster-expanded-wrapper">
            <STERExpandedCard
              competency={expandedCompetency}
              selectedScore={scores[expandedCompetency.id]?.score ?? null}
              onScoreSelect={handleScoreSelect}
              notes={scores[expandedCompetency.id]?.notes || ''}
              onNotesChange={handleNotesChange}
            />

            {/* Expand All Items Button */}
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

      {/* Modal for all items */}
      <STERItemsModal
        isOpen={showAllItems}
        category={category}
        scores={scores}
        expandedCompetencyId={expandedCompetencyId}
        onClose={() => setShowAllItems(false)}
        onSelectItem={setExpandedCompetencyId}
      />
    </>
  );
};
