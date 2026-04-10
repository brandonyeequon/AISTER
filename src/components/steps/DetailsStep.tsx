// Step 3 of the evaluation form — captures core placement and context details for the redesign.

import React from 'react';
import { EvaluationDetailsForm } from '../../utils/evaluationRecords';

interface DetailsStepProps {
  timerSeconds: number;
  isRunning: boolean;
  onStart: () => void;
  onPause: () => void;
  onRestart: () => void;
  showTimerDisplay: boolean;
  onToggleTimerDisplay: () => void;
  details: EvaluationDetailsForm;
  onDetailsChange: (details: EvaluationDetailsForm) => void;
}

/** Details step with evaluator info form and persistent timer controls. */
export const DetailsStep: React.FC<DetailsStepProps> = ({
  timerSeconds,
  isRunning,
  onStart,
  onPause,
  onRestart,
  showTimerDisplay,
  onToggleTimerDisplay,
  details,
  onDetailsChange,
}) => {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handlePrimaryTimerAction = () => {
    if (isRunning) {
      onPause();
      return;
    }

    onStart();
  };

  return (
    <div className="evaluation-content details-layout">
      {/* Left Panel - Context + Timer */}
      <aside className="details-side-card">
        <div className="details-side-header">
          <h3 className="details-side-title">Details + Timer</h3>
        </div>

        <p className="instruction-text">
          Fill the required placement details, then continue directly to scoring.
        </p>

        <div className="details-side-summary">
          <div className="details-side-summary-row">
            <span>Student</span>
            <strong>{details.studentName || 'Not set'}</strong>
          </div>
          <div className="details-side-summary-row">
            <span>School</span>
            <strong>{details.schoolName || 'Not set'}</strong>
          </div>
          <div className="details-side-summary-row">
            <span>Semester</span>
            <strong>{details.semester || 'Not set'}</strong>
          </div>
        </div>

        <div className="timer-card details-side-timer">
          <div className="timer-header-row">
            <h3 className="timer-label">Evaluation Timer</h3>
            <button
              type="button"
              className="timer-visibility-toggle"
              onClick={onToggleTimerDisplay}
            >
              {showTimerDisplay ? 'Hide Time' : 'Show Time'}
            </button>
          </div>
          {showTimerDisplay && (
            <div className="timer-display-simple">
              <div className="timer-time-large">{formatTime(timerSeconds)}</div>
            </div>
          )}
          <div className="timer-button-group">
            <button
              type="button"
              className={`timer-button ${isRunning ? 'pause-button' : 'start-button'}`}
              onClick={handlePrimaryTimerAction}
            >
              <div className="button-icon">{isRunning ? '⏸' : '▶'}</div>
              <span className="button-label">{isRunning ? 'Pause' : 'Start'}</span>
            </button>
            <button
              type="button"
              className="timer-button restart-button"
              onClick={onRestart}
            >
              <div className="button-icon">↻</div>
              <span className="button-label">Restart</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Right Panel - Main Form */}
      <div className="step-content-center details-main-content">
        <div className="step-card-container details-main-card">
          <h2 className="step-section-title">Basic Information</h2>
          <form className="step-form details-form-grid">
            <div className="form-group">
              <label>Student Teacher Name</label>
              <input
                type="text"
                placeholder="Enter student teacher name"
                value={details.studentName}
                onChange={(e) => onDetailsChange({ ...details, studentName: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Teacher Name</label>
              <input
                type="text"
                placeholder="Enter teacher name"
                value={details.teacherName}
                onChange={(e) => onDetailsChange({ ...details, teacherName: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Evaluation Date</label>
              <input
                type="date"
                value={details.evaluationDate}
                onChange={(e) => onDetailsChange({ ...details, evaluationDate: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Subject Area</label>
              <input
                type="text"
                placeholder="e.g. Science"
                value={details.subjectArea}
                onChange={(e) => onDetailsChange({ ...details, subjectArea: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>School Name</label>
              <input
                type="text"
                placeholder="Enter school name"
                value={details.schoolName}
                onChange={(e) => onDetailsChange({ ...details, schoolName: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Semester</label>
              <select
                value={details.semester}
                onChange={(e) => onDetailsChange({ ...details, semester: e.target.value })}
              >
                <option value="">Select semester</option>
                <option value="Fall 2025">Fall 2025</option>
                <option value="Spring 2026">Spring 2026</option>
                <option value="Summer 2026">Summer 2026</option>
                <option value="Fall 2026">Fall 2026</option>
              </select>
            </div>
            <div className="form-group">
              <label>Department</label>
              <select
                value={details.department}
                onChange={(e) => onDetailsChange({ ...details, department: e.target.value })}
              >
                <option value="">Select department</option>
                <option value="Elementary">Elementary</option>
                <option value="Secondary">Secondary</option>
                <option value="Special Education">Special Education</option>
                <option value="CTE">CTE</option>
              </select>
            </div>
            <div className="form-group">
              <label>Grade Level(s)</label>
              <input
                type="text"
                placeholder="e.g. 3rd Grade"
                value={details.gradeLevel}
                onChange={(e) => onDetailsChange({ ...details, gradeLevel: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Class Size</label>
              <input
                type="number"
                min={0}
                placeholder="Enter class size"
                value={details.classSize}
                onChange={(e) => onDetailsChange({ ...details, classSize: e.target.value })}
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
