// Step 2 of the evaluation form — optional lesson plan file upload with sidebar timer controls.

import React from 'react';

interface LessonPlanUploadStepProps {
  timerSeconds: number;
  isRunning: boolean;
  onStart: () => void;
  onPause: () => void;
  onRestart: () => void;
  showTimerDisplay: boolean;
  onToggleTimerDisplay: () => void;
  selectedFileName: string | null;
  onFileSelect: (fileName: string | null) => void;
}

/** Lesson plan upload step with persistent timer controls and a hide/show time toggle. */
export const LessonPlanUploadStep: React.FC<LessonPlanUploadStepProps> = ({
  timerSeconds,
  isRunning,
  onStart,
  onPause,
  onRestart,
  showTimerDisplay,
  onToggleTimerDisplay,
  selectedFileName,
  onFileSelect,
}) => {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file.name);
    }
  };

  return (
    <div className="evaluation-content">
      {/* Left Sidebar - Upload Instructions */}
      <aside className="sidebar-panel upload-instructions-panel">
        <div className="upload-instruction-icon">↑</div>
        <p className="upload-instruction-text">
          Upload the lesson plan by clicking the button in the middle.
        </p>
        <p className="upload-instruction-subtext">PDF, DOC, WORD, etc...</p>
      </aside>

      {/* Center - File Upload Area */}
      <div className="upload-section">
        <div className="upload-card">
          <h2 className="upload-title">Lesson Plan Upload</h2>
          <p className="upload-subtitle">(Optional)</p>

          <label className="upload-area">
            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.xls,.xlsx"
              className="file-input-hidden"
            />
            <div className="upload-content">
              <div className="upload-icon-large">+</div>
              <p className="upload-prompt">
                {selectedFileName ? `✓ ${selectedFileName}` : 'Click to upload file'}
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Right Sidebar - Timer */}
      <aside className="sidebar-panel timer-panel">
        <div className="timer-card">
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
