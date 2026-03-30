import React from 'react';
import { Clock, BookOpen, FileText, PenTool, CheckCircle } from 'lucide-react';

export interface StepConfig {
  id: string;
  label: string;
  number: string;
  icon: React.ReactNode;
  subText?: string;
}

interface StepStepperProps {
  currentStep: string;
  steps: StepConfig[];
  onStepClick?: (stepId: string) => void;
}

export const StepStepper: React.FC<StepStepperProps> = ({
  currentStep,
  steps,
  onStepClick,
}) => {
  // Map step IDs to Lucide icons
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
          className={`step-card ${currentStep === step.id ? 'is-active' : ''}`}
          onClick={() => onStepClick?.(step.id)}
          role="button"
          tabIndex={0}
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
