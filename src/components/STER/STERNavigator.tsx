import React from 'react';
import { Zap } from 'lucide-react';
import { STER_COMPETENCIES } from '../../utils/sterData';

export interface STERNavigatorProps {
  selectedCategory: string | null;
  onCategorySelect: (category: string) => void;
  scores: {
    [competencyId: string]: {
      score: number | null;
      notes: string;
    };
  };
}

const CATEGORY_LABELS: { [key: string]: string } = {
  LL: 'Learners & Learning',
  IC: 'Instructional Clarity',
  IP: 'Instructional Practice',
  CC: 'Classroom Climate',
  PR: 'Professional Responsibility',
};

const CATEGORY_ORDER = ['LL', 'IC', 'IP', 'CC', 'PR'];

export const STERNavigator: React.FC<STERNavigatorProps> = ({
  selectedCategory,
  onCategorySelect,
  scores,
}) => {
  const getCategoryCompletion = (category: string) => {
    const competencies = STER_COMPETENCIES[category] || [];
    const scored = competencies.filter(
      (c) => scores[c.id]?.score !== null
    ).length;
    return { scored, total: competencies.length };
  };

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
              <div className="ster-category-badge">
                {isComplete ? '✓' : scored > 0 ? scored : '—'}
              </div>
            </button>
          );
        })}
      </div>

      {allCategoriesComplete && (
        <button className="ster-ai-button">
          <Zap size={18} />
          <span>AI Analysis</span>
        </button>
      )}
    </div>
  );
};
