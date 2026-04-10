// Category sidebar for the STER scoring step.
// Shows all 5 STER categories as clickable buttons.
// Keeps AI Analysis available from observation notes without requiring pre-scoring.

import React from 'react';
import { Zap } from 'lucide-react';

export interface STERNavigatorProps {
  /** Currently selected category code (e.g., "LL"). */
  selectedCategory: string | null;
  /** Fires when the evaluator clicks a category button. */
  onCategorySelect: (category: string) => void;
  onAiAnalyze?: () => void;
  isAnalyzing?: boolean;
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
  onAiAnalyze,
  isAnalyzing,
}) => {
  return (
    <div className="ster-navigator flex flex-col h-full">
      <div className="mb-4 pb-4 border-b border-gray-200">
        <button
          type="button"
          className="ster-ai-button w-full"
          onClick={onAiAnalyze}
          disabled={isAnalyzing || !onAiAnalyze}
        >
          <Zap size={18} className={isAnalyzing ? 'animate-pulse' : ''} />
          <span>{isAnalyzing ? 'Analyzing...' : 'AI Analysis'}</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <h3 className="ster-nav-title">Competencies</h3>
        <div className="flex flex-col gap-2 mb-4">
          {CATEGORY_ORDER.map((category) => {
            const isActive = selectedCategory === category;

            return (
              <button
                key={category}
                type="button"
                onClick={() => onCategorySelect(category)}
                className={`ster-category-button ${isActive ? 'is-active' : ''}`}
              >
                <div className="flex flex-col">
                  <span className="font-bold text-base">{category}</span>
                  <span className="text-xs font-normal opacity-75">
                    {CATEGORY_LABELS[category]}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
