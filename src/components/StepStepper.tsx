// Horizontal step progress bar shown at the top of the evaluation form.
// Each step card is clickable (keyboard-accessible) and highlights when active.

import React from 'react';
import { Clock, BookOpen, FileText, PenTool, CheckCircle } from 'lucide-react';

/** Configuration for a single step in the stepper. */
export interface StepConfig {
  id: string;
  label: string;
  /** Display number shown below the icon (e.g., "1", "2"). */
  number: string;
  /** Reserved for future custom icon overrides — currently always null; icons are derived from id. */
  icon: React.ReactNode;
  /** Optional secondary label shown below the step number (e.g., "Upload (Optional)"). */
  subText?: string;
}

interface StepStepperProps {
  /** ID of the currently active step. */
  currentStep: string;
  steps: StepConfig[];
  /** Optional click handler — allows jumping to any step by clicking its card. */
  onStepClick?: (stepId: string) => void;
}

/** Horizontal step progress indicator with clickable step cards. */
export const StepStepper: React.FC<StepStepperProps> = ({
  currentStep,
  steps,
  onStepClick,
}) => {
  /**
   * Maps a step ID to its corresponding Lucide icon.
   * Icons are hardcoded to the five evaluation steps — add a new entry if steps change.
   */
  const getIcon = (stepId: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      timer: <Clock size={28} strokeWidth={1.5} />,
      'lesson-plan': <BookOpen size={28} strokeWidth={1.5} />,
      details: <FileText size={28} strokeWidth={1.5} />,
      notes: <PenTool size={28} strokeWidth={1.5} />,
      evaluate: <CheckCircle size={28} strokeWidth={1.5} />,
    };
    return iconMap[stepId] || null;
  };

  return (
    <div className="step-stepper">
      {steps.map((step) => (
        <div
          key={step.id}
          // is-active adds the highlighted styling for the current step
          className={`step-card ${currentStep === step.id ? 'is-active' : ''}`}
          onClick={() => onStepClick?.(step.id)}
          role="button"
          tabIndex={0}
          // Keyboard accessibility — treat Enter/Space the same as a click
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              onStepClick?.(step.id);
            }
          }}
        >
          <div className="step-icon">{getIcon(step.id)}</div>
          <div className="step-number">{step.number}</div>
          <div className="step-label">{step.label}</div>
          {step.subText && <div className="step-subtext">{step.subText}</div>}
        </div>
      ))}
    </div>
  );
};
