import React from 'react';

interface DetailsFormData {
  studentName: string;
  teacherName: string;
  evaluationDate: string;
}

interface DetailsStepProps {
  timerSeconds: number;
  isRunning: boolean;
  onStart: () => void;
  onPause: () => void;
  onRestart: () => void;
  details: DetailsFormData;
  onDetailsChange: (details: DetailsFormData) => void;
}

export const DetailsStep: React.FC<DetailsStepProps> = ({
  timerSeconds,
  isRunning,
  onStart,
  onPause,
  onRestart,
  details,
  onDetailsChange,
}) => {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="evaluation-content">
      {/* Left Sidebar - Instructions */}
      <aside className="sidebar-panel instructions-panel">
        <h3 className="sidebar-title">Details</h3>
        <p className="instruction-text">Fill in the basic information about the evaluation.</p>
      </aside>

      {/* Center - Form Content */}
      <div className="step-content-center">
        <div className="step-card-container">
          <h2 className="step-section-title">Basic Information</h2>
          <form className="step-form">
            <div className="form-group">
              <label>Student Name</label>
              <input
                type="text"
                placeholder="Enter student name"
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
          </form>
        </div>
      </div>

      {/* Right Sidebar - Timer */}
      <aside className="sidebar-panel timer-panel">
        <div className="timer-card">
          <h3 className="timer-label">Evaluation Timer</h3>
          <div className="timer-display-simple">
            <div className="timer-time-large">{formatTime(timerSeconds)}</div>
          </div>
          <div className="timer-button-group">
            <button 
              className={`timer-button ${isRunning ? 'pause-button' : 'start-button'}`}
              onClick={isRunning ? onPause : onStart}
            >
              <div className="button-icon">{isRunning ? '⏸' : '▶'}</div>
              <span className="button-label">{isRunning ? 'Pause' : 'Start'}</span>
            </button>
            <button 
              className="timer-button restart-button"
              onClick={onRestart}
            >
              <div className="button-icon">↻</div>
              <span className="button-label">Restart</span>
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
};
