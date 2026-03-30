import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { StepStepper, StepConfig } from '../components/StepStepper';
import { LessonPlanUploadStep } from '../components/steps/LessonPlanUploadStep';
import { DetailsStep } from '../components/steps/DetailsStep';
import { NotesStep } from '../components/steps/NotesStep';
import { EvaluateStep } from '../components/steps/EvaluateStep';
import { STERScores } from '../utils/sterData';

type EvaluationStep = 'timer' | 'lesson-plan' | 'details' | 'notes' | 'evaluate';

interface EvaluationDetailsForm {
  studentName: string;
  teacherName: string;
  evaluationDate: string;
}

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

const EVALUATION_DRAFT_STORAGE_KEY = 'aister:evaluation-draft:v1';

const DEFAULT_DETAILS: EvaluationDetailsForm = {
  studentName: '',
  teacherName: '',
  evaluationDate: '',
};

export const Evaluations: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<EvaluationStep>('timer');
  const [timerSeconds, setTimerSeconds] = useState(0); // Start from 00:00:00
  const [isRunning, setIsRunning] = useState(false);
  const [observationNotes, setObservationNotes] = useState('');
  const [lessonPlanFileName, setLessonPlanFileName] = useState<string | null>(null);
  const [details, setDetails] = useState<EvaluationDetailsForm>(DEFAULT_DETAILS);
  const [notesFileName, setNotesFileName] = useState<string | null>(null);
  const [sterScores, setSterScores] = useState<STERScores>({});
  const [selectedSterCategory, setSelectedSterCategory] = useState('LL');
  const [isDraftHydrated, setIsDraftHydrated] = useState(false);

  useEffect(() => {
    const savedDraft = localStorage.getItem(EVALUATION_DRAFT_STORAGE_KEY);
    if (!savedDraft) {
      setIsDraftHydrated(true);
      return;
    }

    try {
      const parsedDraft = JSON.parse(savedDraft) as Partial<EvaluationDraft>;
      const validSteps: EvaluationStep[] = ['timer', 'lesson-plan', 'details', 'notes', 'evaluate'];

      if (parsedDraft.currentStep && validSteps.includes(parsedDraft.currentStep)) {
        setCurrentStep(parsedDraft.currentStep);
      }

      if (typeof parsedDraft.timerSeconds === 'number' && Number.isFinite(parsedDraft.timerSeconds)) {
        setTimerSeconds(Math.max(0, parsedDraft.timerSeconds));
      }

      if (typeof parsedDraft.isRunning === 'boolean') {
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
      setIsDraftHydrated(true);
    }
  }, []);

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

  // Timer effect - increments every second when running
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  // Step order for navigation
  const stepOrder: EvaluationStep[] = [
    'timer',
    'lesson-plan',
    'details',
    'notes',
    'evaluate',
  ];

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Timer handlers
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

  // Navigation handlers
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

  const goToNextStep = () => {
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1]);
    }
  };

  const goToPrevStep = () => {
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    }
  };

  // Stepper Buttons --> "Timer, Lesson Plan, Details, Notes, Evaluate"
  const steps: StepConfig[] = [
    { id: 'timer', label: 'Timer', number: '1', icon: null },
    { id: 'lesson-plan', label: 'Lesson Plan', number: '2', icon: null, subText: 'Upload (Optional)' },
    { id: 'details', label: 'Details', number: '3', icon: null, subText: 'Basic Info' },
    { id: 'notes', label: 'Notes', number: '4', icon: null, subText: 'Observation Notes' },
    { id: 'evaluate', label: 'Evaluate', number: '5', icon: null, subText: 'Complete Rubric' },
  ];

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

        {/* Step Stepper */}
        <StepStepper currentStep={currentStep} steps={steps} onStepClick={handleStepClick} />

        {/* Step Content - Render based on currentStep */}
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

                {/* Timer Display */}
                <div className="timer-display">
                  <div className="timer-time">{formatTime(timerSeconds)}</div>
                </div>

                {/* Timer Controls */}
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

            {/* Right Sidebar - Statistics */}
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
            sterScores={sterScores}
            onSterScoresChange={setSterScores}
            selectedCategory={selectedSterCategory}
            onSelectedCategoryChange={setSelectedSterCategory}
          />
        )}

        {/* Footer Navigation */}
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
