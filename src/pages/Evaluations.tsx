// Multi-step evaluation form orchestrating timer, lesson plan upload, details, and STER survey scoring.
// All step state lives here and is passed down as props — steps are conditionally rendered, not routed.
// The entire form state is auto-saved to localStorage on every change so evaluators can resume later.

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { StepStepper, StepConfig } from '../components/StepStepper';
import { LessonPlanUploadStep } from '../components/steps/LessonPlanUploadStep';
import { DetailsStep } from '../components/steps/DetailsStep';
import { NotesStep } from '../components/steps/NotesStep';
import { EvaluateStep } from '../components/steps/EvaluateStep';
import { STERScores } from '../utils/sterData';
import { analyzeNotesWithGemini } from '../utils/aiAnalyzer';

import {
  areAllCompetenciesScored,
  CategoryFinalNotes,
  DEFAULT_CATEGORY_FINAL_NOTES,
  DEFAULT_EVALUATION_DETAILS,
  EvaluationDetailsForm,
  EvaluationRecord,
  EvaluationStatus,
  EvaluationStep,
  normalizeCategoryFinalNotes,
  getActiveEvaluationId,
  getEvaluationRecordById,
  getEvaluationRecords,
  migrateLegacyDraftIfNeeded,
  normalizeEvaluationDetails,
  setActiveEvaluationId as setStoredActiveEvaluationId,
  startNewEvaluationRecord,
  STERCategoryCode,
  upsertEvaluationRecord,
} from '../utils/evaluationRecords';

/** Main evaluation page. Manages all step state and delegates rendering to step components. */
export const Evaluations: React.FC = () => {
  const navigate = useNavigate();

  const [activeEvaluationId, setActiveEvaluationId] = useState<string | null>(null);
  const [evaluationStatus, setEvaluationStatus] = useState<EvaluationStatus>('in-progress');
  const [createdAt, setCreatedAt] = useState('');
  const [submittedAt, setSubmittedAt] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<EvaluationStep>('timer');
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  // Session-only visibility preference for persistent timer UI on steps 2-5.
  // Intentionally not persisted in the draft so it resets on page refresh.
  const [isPersistentTimerDisplayVisible, setIsPersistentTimerDisplayVisible] = useState(true);
  const [observationNotes, setObservationNotes] = useState('');
  const [categoryFinalNotes, setCategoryFinalNotes] = useState<CategoryFinalNotes>({
    ...DEFAULT_CATEGORY_FINAL_NOTES,
  });
  const [lessonPlanFileName, setLessonPlanFileName] = useState<string | null>(null);
  const [details, setDetails] = useState<EvaluationDetailsForm>(DEFAULT_EVALUATION_DETAILS);
  const [notesFileName, setNotesFileName] = useState<string | null>(null);
  const [sterScores, setSterScores] = useState<STERScores>({});
  const [selectedSterCategory, setSelectedSterCategory] = useState('LL');
  const [evaluationCounts, setEvaluationCounts] = useState({ completed: 0, inProgress: 0 });

  // Flag that prevents the save effect from running before the hydration effect completes.
  // Without this, the first render would overwrite the saved draft with empty defaults.
  const [isDraftHydrated, setIsDraftHydrated] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAiAnalyze = async () => {
    if (!observationNotes.trim()) {
      alert('Please add observation notes first before analyzing.');
      return;
    }

    setIsAnalyzing(true);
    try {
      const results = await analyzeNotesWithGemini(observationNotes);

      if (!Array.isArray(results)) {
        throw new Error('AI response format was invalid (expected an array of scores).');
      }

      const newScores = { ...sterScores };
      results.forEach((result) => {
        newScores[result.id] = { score: result.score, notes: result.notes };
      });

      setSterScores(newScores);
    } catch (error) {
      console.error('Failed to analyze notes:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to analyze notes. ${message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  /** Refreshes completed and in-progress counts used by the timer-step statistics panel. */
  const refreshEvaluationCounts = useCallback(() => {
    const records = getEvaluationRecords();
    const completed = records.filter((record) => record.status === 'completed').length;
    const inProgress = records.filter((record) => record.status === 'in-progress').length;

    setEvaluationCounts((previousCounts) => {
      if (previousCounts.completed === completed && previousCounts.inProgress === inProgress) {
        return previousCounts;
      }

      return { completed, inProgress };
    });
  }, []);

  // HYDRATION: On mount, migrate legacy draft storage and restore/create the active evaluation record.
  useEffect(() => {
    try {
      migrateLegacyDraftIfNeeded();

      const storedActiveEvaluationId = getActiveEvaluationId();
      let activeRecord = storedActiveEvaluationId
        ? getEvaluationRecordById(storedActiveEvaluationId)
        : null;

      if (!activeRecord) {
        activeRecord = startNewEvaluationRecord();
      }

      const validDisplaySteps = ['timer', 'lesson-plan', 'details', 'notes', 'evaluate'] as const;
      const hydratedStep: EvaluationStep = validDisplaySteps.includes(
        activeRecord.currentStep as (typeof validDisplaySteps)[number]
      )
        ? activeRecord.currentStep
        : 'timer';

      setStoredActiveEvaluationId(activeRecord.id);
      setActiveEvaluationId(activeRecord.id);
      setEvaluationStatus(activeRecord.status);
      setCreatedAt(activeRecord.createdAt);
      setSubmittedAt(activeRecord.submittedAt);
      setCurrentStep(hydratedStep);
      setTimerSeconds(Math.max(0, activeRecord.timerSeconds));
      // Don't auto-resume a running timer after reload — evaluator explicitly starts it.
      setIsRunning(false);
      setObservationNotes(activeRecord.observationNotes);
      setCategoryFinalNotes(normalizeCategoryFinalNotes(activeRecord.categoryFinalNotes));
      setLessonPlanFileName(activeRecord.lessonPlanFileName);
      setNotesFileName(activeRecord.notesFileName);
      setDetails(normalizeEvaluationDetails(activeRecord.details));
      setSterScores(activeRecord.sterScores);
      setSelectedSterCategory(activeRecord.selectedSterCategory || 'LL');
      refreshEvaluationCounts();
    } catch (error) {
      console.error('Failed to restore active evaluation record:', error);
    } finally {
      // Always mark hydration complete so the save effect can start running
      setIsDraftHydrated(true);
    }
  }, [refreshEvaluationCounts]);

  // AUTO-SAVE: Persist the active evaluation record on every state change.
  // Gated on isDraftHydrated to avoid overwriting the draft with empty defaults on first render.
  useEffect(() => {
    if (!isDraftHydrated || !activeEvaluationId || !createdAt) {
      return;
    }

    const updatedRecord: EvaluationRecord = {
      id: activeEvaluationId,
      status: evaluationStatus,
      currentStep,
      timerSeconds,
      isRunning,
      lessonPlanFileName,
      details,
      observationNotes,
      categoryFinalNotes,
      notesFileName,
      sterScores,
      selectedSterCategory,
      createdAt,
      updatedAt: new Date().toISOString(),
      submittedAt,
    };

    upsertEvaluationRecord(updatedRecord);
  }, [
    activeEvaluationId,
    createdAt,
    isDraftHydrated,
    evaluationStatus,
    currentStep,
    timerSeconds,
    isRunning,
    lessonPlanFileName,
    details,
    observationNotes,
    categoryFinalNotes,
    notesFileName,
    sterScores,
    selectedSterCategory,
    submittedAt,
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

  /** Updates category-level final notes while preserving notes entered for other categories. */
  const handleCategoryFinalNotesChange = (category: STERCategoryCode, notes: string) => {
    setCategoryFinalNotes((previousNotes) => ({
      ...previousNotes,
      [category]: notes,
    }));
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

  /** Marks the active record as completed and returns the evaluator to the dashboard history list. */
  const handleSubmitEvaluation = () => {
    if (!activeEvaluationId || !createdAt) {
      return;
    }

    setIsRunning(false);

    const nowIso = new Date().toISOString();
    const firstSubmittedAt = submittedAt ?? nowIso;

    const completedRecord: EvaluationRecord = {
      id: activeEvaluationId,
      status: 'completed',
      currentStep,
      timerSeconds,
      isRunning: false,
      lessonPlanFileName,
      details,
      observationNotes,
      categoryFinalNotes,
      notesFileName,
      sterScores,
      selectedSterCategory,
      createdAt,
      updatedAt: nowIso,
      submittedAt: firstSubmittedAt,
    };

    upsertEvaluationRecord(completedRecord);
    setEvaluationStatus('completed');
    setSubmittedAt(firstSubmittedAt);
    refreshEvaluationCounts();
    navigate('/dashboard');
  };

  /** Step configuration array consumed by StepStepper to render the progress bar. */
  const steps: StepConfig[] = [
    { id: 'timer', label: 'Timer', number: '1', icon: null },
    { id: 'lesson-plan', label: 'Lesson Plan', number: '2', icon: null, subText: 'Upload (Optional)' },
    { id: 'details', label: 'Details', number: '3', icon: null, subText: 'Basic Info' },
    { id: 'notes', label: 'Observation Notes', number: '4', icon: null, subText: '(Optional)' },
    { id: 'evaluate', label: 'Evaluate', number: '5', icon: null, subText: 'Survey + Final Notes' },
  ];

  /** Quick guide items shown in the left sidebar on the timer step. */
  const quickGuideItems = [
    { number: '1', text: 'Click "Start Timer" to begin the evaluation' },
    { number: '2', text: 'Complete your evaluation' },
    { number: '3', text: 'Timer stops on save' },
    { number: '4', text: 'Pause only for breaks' },
  ];

  const canSubmitEvaluation = areAllCompetenciesScored(sterScores);

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
              <h1 className="evaluation-title">
                {evaluationStatus === 'completed' ? 'Edit Evaluation' : 'New Evaluation'}
              </h1>
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

            {/* Right Sidebar - Statistics from the shared evaluation record store */}
            <aside className="sidebar-panel statistics-panel">
              <h2 className="sidebar-title">Your Statistics</h2>
              <div className="statistics-item">
                <div className="stat-number">{evaluationCounts.completed}</div>
                <p className="stat-label">Completed</p>
              </div>
              <div className="statistics-item">
                <div className="stat-number">{evaluationCounts.inProgress}</div>
                <p className="stat-label">In Progress</p>
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
            onAiAnalyze={handleAiAnalyze}
            isAnalyzing={isAnalyzing}
            categoryFinalNotes={categoryFinalNotes}
            onCategoryFinalNotesChange={handleCategoryFinalNotesChange}
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
            <button
              className={`nav-button submit-button ${
                canSubmitEvaluation ? '' : 'opacity-60 cursor-not-allowed'
              }`}
              onClick={handleSubmitEvaluation}
              disabled={!canSubmitEvaluation}
              title={
                canSubmitEvaluation
                  ? 'Submit evaluation'
                  : 'Score all competencies before submitting'
              }
            >
              {evaluationStatus === 'completed' ? 'Save Updates ›' : 'Submit Evaluation ›'}
            </button>
          )}
        </footer>
      </main>
    </div>
  );
};
