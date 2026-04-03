// Multi-step evaluation form orchestrating timer, lesson plan upload, details, notes, and STER scoring.
// All step state lives here and is passed down as props — steps are conditionally rendered, not routed.
// The entire form state is auto-saved to localStorage on every change so evaluators can resume later.

import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { StepStepper, StepConfig } from '../components/StepStepper';
import { LessonPlanUploadStep } from '../components/steps/LessonPlanUploadStep';
import { DetailsStep } from '../components/steps/DetailsStep';
import { NotesStep } from '../components/steps/NotesStep';
import { EvaluateStep } from '../components/steps/EvaluateStep';
import { STERScores } from '../utils/sterData';

/** The five steps of an evaluation, in order. */
type EvaluationStep = 'timer' | 'lesson-plan' | 'details' | 'notes' | 'evaluate';

/** Form data collected on the Details step. */
interface EvaluationDetailsForm {
  studentName: string;
  teacherName: string;
  evaluationDate: string;
}

/** Full shape of the evaluation draft saved to localStorage. */
interface EvaluationDraft {
  currentStep: EvaluationStep;
  timerSeconds: number;
  isRunning: boolean;
  lessonPlanFileName: string | null;
  details: EvaluationDetailsForm;
  observationNotes: string;
  notesFileName: string | null;
  sterScores: STERScores;
  selectedSterCategory: string;
}

// Versioned storage key — increment the version suffix if the draft shape changes
// to avoid hydrating stale/incompatible drafts from localStorage.
const EVALUATION_DRAFT_STORAGE_KEY = 'aister:evaluation-draft:v1';

const DEFAULT_DETAILS: EvaluationDetailsForm = {
  studentName: '',
  teacherName: '',
  evaluationDate: '',
};

/** Main evaluation page. Manages all step state and delegates rendering to step components. */
export const Evaluations: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<EvaluationStep>('timer');
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  // Session-only visibility preference for persistent timer UI on steps 2-5.
  // Intentionally not persisted in the draft so it resets on page refresh.
  const [isPersistentTimerDisplayVisible, setIsPersistentTimerDisplayVisible] = useState(true);
  const [observationNotes, setObservationNotes] = useState('');
  const [lessonPlanFileName, setLessonPlanFileName] = useState<string | null>(null);
  const [details, setDetails] = useState<EvaluationDetailsForm>(DEFAULT_DETAILS);
  const [notesFileName, setNotesFileName] = useState<string | null>(null);
  const [sterScores, setSterScores] = useState<STERScores>({});
  const [selectedSterCategory, setSelectedSterCategory] = useState('LL');

  // Flag that prevents the save effect from running before the hydration effect completes.
  // Without this, the first render would overwrite the saved draft with empty defaults.
  const [isDraftHydrated, setIsDraftHydrated] = useState(false);

  // HYDRATION: On mount, restore any previously saved evaluation draft from localStorage.
  useEffect(() => {
    const savedDraft = localStorage.getItem(EVALUATION_DRAFT_STORAGE_KEY);
    if (!savedDraft) {
      setIsDraftHydrated(true);
      return;
    }

    try {
      const parsedDraft = JSON.parse(savedDraft) as Partial<EvaluationDraft>;
      const validSteps: EvaluationStep[] = ['timer', 'lesson-plan', 'details', 'notes', 'evaluate'];

      // Validate each field before applying — the localStorage value could be corrupted or outdated.
      if (parsedDraft.currentStep && validSteps.includes(parsedDraft.currentStep)) {
        setCurrentStep(parsedDraft.currentStep);
      }

      if (typeof parsedDraft.timerSeconds === 'number' && Number.isFinite(parsedDraft.timerSeconds)) {
        setTimerSeconds(Math.max(0, parsedDraft.timerSeconds));
      }

      if (typeof parsedDraft.isRunning === 'boolean') {
        // Don't auto-resume a running timer after page reload — evaluator should choose to restart
        setIsRunning(parsedDraft.isRunning);
      }

      if (typeof parsedDraft.observationNotes === 'string') {
        setObservationNotes(parsedDraft.observationNotes);
      }

      if (typeof parsedDraft.lessonPlanFileName === 'string' || parsedDraft.lessonPlanFileName === null) {
        setLessonPlanFileName(parsedDraft.lessonPlanFileName ?? null);
      }

      if (typeof parsedDraft.notesFileName === 'string' || parsedDraft.notesFileName === null) {
        setNotesFileName(parsedDraft.notesFileName ?? null);
      }

      if (parsedDraft.details && typeof parsedDraft.details === 'object') {
        setDetails({
          studentName: parsedDraft.details.studentName ?? '',
          teacherName: parsedDraft.details.teacherName ?? '',
          evaluationDate: parsedDraft.details.evaluationDate ?? '',
        });
      }

      if (parsedDraft.sterScores && typeof parsedDraft.sterScores === 'object') {
        setSterScores(parsedDraft.sterScores);
      }

      if (typeof parsedDraft.selectedSterCategory === 'string' && parsedDraft.selectedSterCategory.length > 0) {
        setSelectedSterCategory(parsedDraft.selectedSterCategory);
      }
    } catch (error) {
      console.error('Failed to restore evaluation draft:', error);
    } finally {
      // Always mark hydration complete so the save effect can start running
      setIsDraftHydrated(true);
    }
  }, []);

  // AUTO-SAVE: Persist the entire draft state to localStorage on every state change.
  // Gated on isDraftHydrated to avoid overwriting the draft with empty defaults on first render.
  useEffect(() => {
    if (!isDraftHydrated) {
      return;
    }

    const draftToSave: EvaluationDraft = {
      currentStep,
      timerSeconds,
      isRunning,
      lessonPlanFileName,
      details,
      observationNotes,
      notesFileName,
      sterScores,
      selectedSterCategory,
    };

    localStorage.setItem(EVALUATION_DRAFT_STORAGE_KEY, JSON.stringify(draftToSave));
  }, [
    isDraftHydrated,
    currentStep,
    timerSeconds,
    isRunning,
    lessonPlanFileName,
    details,
    observationNotes,
    notesFileName,
    sterScores,
    selectedSterCategory,
  ]);

  // TIMER: Increments timerSeconds every second while isRunning is true.
  // Clears the interval on cleanup or when isRunning flips to false.
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  /** Ordered list of steps — used for prev/next navigation index math. */
  const stepOrder: EvaluationStep[] = [
    'timer',
    'lesson-plan',
    'details',
    'notes',
    'evaluate',
  ];

  /**
   * Formats a raw seconds count into HH:MM:SS display string.
   * Used by the timer step and passed down to step components that show the sidebar timer.
   */
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Timer control handlers — passed as props to every step component that shows the timer sidebar.
  const handleStartTimer = () => {
    setIsRunning(true);
  };

  const handlePauseTimer = () => {
    setIsRunning(false);
  };

  const handleRestartTimer = () => {
    setIsRunning(false);
    setTimerSeconds(0);
  };

  /** Toggles whether the persistent timer display is visible on steps 2-5. */
  const handleTogglePersistentTimerDisplay = () => {
    setIsPersistentTimerDisplayVisible((prev) => !prev);
  };

  /**
   * Allows clicking a step card in the stepper to jump directly to that step.
   * Guards against arbitrary string IDs that aren't valid EvaluationStep values.
   */
  const handleStepClick = (stepId: string) => {
    const validSteps: EvaluationStep[] = [
      'timer',
      'lesson-plan',
      'details',
      'notes',
      'evaluate',
    ];
    if (validSteps.includes(stepId as EvaluationStep)) {
      setCurrentStep(stepId as EvaluationStep);
    }
  };

  /** Advances to the next step, if one exists. */
  const goToNextStep = () => {
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1]);
    }
  };

  /** Goes back to the previous step, if one exists. */
  const goToPrevStep = () => {
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    }
  };

  /** Step configuration array consumed by StepStepper to render the progress bar. */
  const steps: StepConfig[] = [
    { id: 'timer', label: 'Timer', number: '1', icon: null },
    { id: 'lesson-plan', label: 'Lesson Plan', number: '2', icon: null, subText: 'Upload (Optional)' },
    { id: 'details', label: 'Details', number: '3', icon: null, subText: 'Basic Info' },
    { id: 'notes', label: 'Notes', number: '4', icon: null, subText: 'Observation Notes' },
    { id: 'evaluate', label: 'Evaluate', number: '5', icon: null, subText: 'Complete Rubric' },
  ];

  /** Quick guide items shown in the left sidebar on the timer step. */
  const quickGuideItems = [
    { number: '1', text: 'Click "Start Timer" to begin the evaluation' },
    { number: '2', text: 'Complete your evaluation' },
    { number: '3', text: 'Timer stops on save' },
    { number: '4', text: 'Pause only for breaks' },
  ];

  return (
    <div className="evaluation-page">
      <Navbar />

      <main className="evaluation-main">
        {/* Header Section */}
        <div className="evaluation-header">
          <div className="evaluation-header-content">
            <div className="evaluation-header-top">
              <div className="evaluation-header-icon">
                <img src="/images/eval_folders.svg" alt="Evaluation" width="95" height="95" />
              </div>
              <h1 className="evaluation-title">New Evaluation</h1>
            </div>
            <p className="evaluation-subtitle">Student Teacher Evaluation Rubric System</p>
          </div>
        </div>

        {/* Step progress indicator — clicking a step card jumps to that step */}
        <StepStepper currentStep={currentStep} steps={steps} onStepClick={handleStepClick} />

        {/* Step Content — conditionally renders the active step component */}
        {currentStep === 'timer' && (
          <div className="evaluation-content">
            {/* Left Sidebar - Quick Guide */}
            <aside className="sidebar-panel quick-guide-panel">
              <h2 className="sidebar-title">Quick Guide</h2>
              <div className="quick-guide-items">
                {quickGuideItems.map((item) => (
                  <div key={item.number} className="quick-guide-item">
                    <div className="guide-number">{item.number}</div>
                    <p className="guide-text">{item.text}</p>
                  </div>
                ))}
              </div>
            </aside>

            {/* Center - Timer Display */}
            <div className="timer-section">
              <div className="timer-card">
                <h2 className="timer-title">Evaluation Timer</h2>
                <p className="timer-subtitle">Start the timer before beginning your evaluation</p>

                <div className="timer-display">
                  <div className="timer-time">{formatTime(timerSeconds)}</div>
                </div>

                <div className="timer-button-group">
                  <button
                    className={`timer-button ${isRunning ? 'pause-button' : 'start-button'}`}
                    onClick={isRunning ? handlePauseTimer : handleStartTimer}
                  >
                    <div className="button-icon">{isRunning ? '⏸' : '▶'}</div>
                    <span className="button-label">{isRunning ? 'Pause' : 'Start'}</span>
                  </button>
                  <button
                    className="timer-button restart-button"
                    onClick={handleRestartTimer}
                  >
                    <div className="button-icon">↻</div>
                    <span className="button-label">Restart</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Sidebar - Statistics (currently hardcoded; wire to real data later) */}
            <aside className="sidebar-panel statistics-panel">
              <h2 className="sidebar-title">Your Statistics</h2>
              <div className="statistics-item">
                <div className="stat-number">0</div>
                <p className="stat-label">Completed</p>
              </div>
              <div className="statistics-item">
                <div className="stat-number">0</div>
                <p className="stat-label">Drafts</p>
              </div>
            </aside>
          </div>
        )}

        {currentStep === 'lesson-plan' && (
          <LessonPlanUploadStep
            timerSeconds={timerSeconds}
            isRunning={isRunning}
            onStart={handleStartTimer}
            onPause={handlePauseTimer}
            onRestart={handleRestartTimer}
            showTimerDisplay={isPersistentTimerDisplayVisible}
            onToggleTimerDisplay={handleTogglePersistentTimerDisplay}
            selectedFileName={lessonPlanFileName}
            onFileSelect={setLessonPlanFileName}
          />
        )}

        {currentStep === 'details' && (
          <DetailsStep
            timerSeconds={timerSeconds}
            isRunning={isRunning}
            onStart={handleStartTimer}
            onPause={handlePauseTimer}
            onRestart={handleRestartTimer}
            showTimerDisplay={isPersistentTimerDisplayVisible}
            onToggleTimerDisplay={handleTogglePersistentTimerDisplay}
            details={details}
            onDetailsChange={setDetails}
          />
        )}

        {currentStep === 'notes' && (
          <NotesStep
            timerSeconds={timerSeconds}
            isRunning={isRunning}
            onStart={handleStartTimer}
            onPause={handlePauseTimer}
            onRestart={handleRestartTimer}
            showTimerDisplay={isPersistentTimerDisplayVisible}
            onToggleTimerDisplay={handleTogglePersistentTimerDisplay}
            notes={observationNotes}
            onNotesChange={setObservationNotes}
            notesFileName={notesFileName}
            onNotesFileSelect={setNotesFileName}
          />
        )}

        {currentStep === 'evaluate' && (
          <EvaluateStep
            timerSeconds={timerSeconds}
            isRunning={isRunning}
            onStart={handleStartTimer}
            onPause={handlePauseTimer}
            onRestart={handleRestartTimer}
            showTimerDisplay={isPersistentTimerDisplayVisible}
            onToggleTimerDisplay={handleTogglePersistentTimerDisplay}
            sterScores={sterScores}
            onSterScoresChange={setSterScores}
            selectedCategory={selectedSterCategory}
            onSelectedCategoryChange={setSelectedSterCategory}
          />
        )}

        {/* Footer navigation — Previous/Continue/Submit buttons.
            The evaluate step uses a different CSS class to accommodate the wider STER layout. */}
        <footer
          className={
            currentStep === 'evaluate'
              ? 'evaluation-footer evaluation-footer-evaluate'
              : 'evaluation-footer'
          }
        >
          {currentStep !== 'timer' && (
            <button className="nav-button prev-button" onClick={goToPrevStep}>
              ‹ Previous
            </button>
          )}
          <button className="help-center-button">Open Help Center</button>
          {currentStep !== 'evaluate' && (
            <button className="nav-button next-button" onClick={goToNextStep}>
              Continue ›
            </button>
          )}
          {currentStep === 'evaluate' && (
            <button className="nav-button submit-button" onClick={goToNextStep}>
              Submit Evaluation ›
            </button>
          )}
        </footer>
      </main>
    </div>
  );
};
