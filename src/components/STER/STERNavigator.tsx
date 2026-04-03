// Category sidebar for the STER scoring step.
// Shows all 5 STER categories as clickable buttons with completion badges.
// Once all 35 competencies are scored, surfaces the AI Analysis button.

import React from 'react';
import { Zap } from 'lucide-react';
import { STER_COMPETENCIES } from '../../utils/sterData';

export interface STERNavigatorProps {
  /** Currently selected category code (e.g., "LL"). */
  selectedCategory: string | null;
  /** Fires when the evaluator clicks a category button. */
  onCategorySelect: (category: string) => void;
  scores: {
    [competencyId: string]: {
      score: number | null;
      notes: string;
    };
  };
}

/** Human-readable names for each category code. */
const CATEGORY_LABELS: { [key: string]: string } = {
  LL: 'Learners & Learning',
  IC: 'Instructional Clarity',
  IP: 'Instructional Practice',
  CC: 'Classroom Climate',
  PR: 'Professional Responsibility',
};

/** Defines the display order of categories in the sidebar. */
const CATEGORY_ORDER = ['LL', 'IC', 'IP', 'CC', 'PR'];

/** Category sidebar showing completion badges and triggering AI Analysis when all items are scored. */
export const STERNavigator: React.FC<STERNavigatorProps> = ({
  selectedCategory,
  onCategorySelect,
  scores,
}) => {
  /**
   * Calculates how many competencies in a category have been scored (score !== null).
   * Used to drive the completion badge on each category button.
   */
  const getCategoryCompletion = (category: string) => {
    const competencies = STER_COMPETENCIES[category] || [];
    const scored = competencies.filter(
      (c) => scores[c.id]?.score !== null
    ).length;
    return { scored, total: competencies.length };
  };

  // Show the AI Analysis button only when every competency across all categories is scored.
  // The CATEGORY_ORDER.length > 0 check is technically redundant since the array is hardcoded,
  // but makes the intent explicit — don't show the button if there are no categories.
  const allCategoriesComplete =
    CATEGORY_ORDER.every((category) => {
      const { scored, total } = getCategoryCompletion(category);
      return scored === total;
    }) && CATEGORY_ORDER.length > 0;

  return (
    <div className="ster-navigator">
      <h3 className="ster-nav-title">Competencies</h3>
      <div className="flex flex-col gap-2">
        {CATEGORY_ORDER.map((category) => {
          const isActive = selectedCategory === category;
          const { scored, total } = getCategoryCompletion(category);
          const isComplete = scored === total;

          return (
            <button
              key={category}
              onClick={() => onCategorySelect(category)}
              className={`ster-category-button ${isActive ? 'is-active' : ''}`}
            >
              <div className="flex flex-col">
                <span className="font-bold text-base">{category}</span>
                <span className="text-xs font-normal opacity-75">
                  {CATEGORY_LABELS[category]}
                </span>
              </div>
              {/* Badge: ✓ if complete, count if in-progress, — if not started */}
              <div className="ster-category-badge">
                {isComplete ? '✓' : scored > 0 ? scored : '—'}
              </div>
            </button>
          );
        })}
      </div>

      {/* AI Analysis button — only visible once all 35 competencies have been scored */}
      {allCategoriesComplete && (
        <button className="ster-ai-button">
          <Zap size={18} />
          <span>AI Analysis</span>
        </button>
      )}
    </div>
  );
};
