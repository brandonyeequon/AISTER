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
  onAiAnalyze?: () => void;
  isAnalyzing?: boolean;
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
  onAiAnalyze,
  isAnalyzing,
}) => {
  const getCategoryCompletion = (category: string) => {
    const competencies = STER_COMPETENCIES[category] || [];
    let scored = 0;
    let categoryScore = 0;
    
    competencies.forEach((c) => {
      const s = scores[c.id]?.score;
      if (s !== null && s !== undefined) {
        scored++;
        categoryScore += s;
      }
    });
    
    return { scored, total: competencies.length, categoryScore };
  };

  return (
    <div className="ster-navigator flex flex-col h-full">
      <div className="mb-4 pb-4 border-b border-gray-200">
        <button 
          className="ster-ai-button w-full" 
          onClick={onAiAnalyze}
          disabled={isAnalyzing}
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
            const { scored, categoryScore } = getCategoryCompletion(category);

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
                  {scored > 0 ? `${categoryScore} / 3` : '—'}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
