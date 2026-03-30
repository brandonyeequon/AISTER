import React from 'react';

interface NotesStepProps {
  timerSeconds: number;
  isRunning: boolean;
  onStart: () => void;
  onPause: () => void;
  onRestart: () => void;
  notes: string;
  onNotesChange: (notes: string) => void;
  notesFileName: string | null;
  onNotesFileSelect: (fileName: string | null) => void;
}

export const NotesStep: React.FC<NotesStepProps> = ({
  timerSeconds,
  isRunning,
  onStart,
  onPause,
  onRestart,
  notes,
  onNotesChange,
  notesFileName,
  onNotesFileSelect,
}) => {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleNotesFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onNotesFileSelect(file.name);
    }
  };

  return (
    <div className="evaluation-content">
      {/* Left Sidebar - Instructions */}
      <aside className="sidebar-panel instructions-panel">
        <h3 className="sidebar-title">Notes</h3>
        <p className="instruction-text">Document your observation notes during the evaluation.</p>
        <div className="notes-upload-wrapper">
          <label className="notes-upload-area">
            <input
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleNotesFileChange}
              className="file-input-hidden"
            />
            <div className="notes-upload-content">
              <div className="notes-upload-icon">+</div>
              <p className="notes-upload-title">Optional File Upload</p>
              <p className="notes-upload-subtitle">
                {notesFileName ?? 'Attach notes from Docs or other software'}
              </p>
            </div>
          </label>
        </div>
      </aside>

      {/* Center - Notes Content */}
      <div className="step-content-center notes-step-center">
        <div className="step-card-container notes-card-container">
          <h2 className="step-section-title">Observation Notes</h2>
          <textarea
            className="notes-textarea notes-textarea-fill"
            placeholder="Enter your observation notes here..."
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
          />
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
