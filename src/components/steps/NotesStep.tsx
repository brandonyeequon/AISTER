// Step 4 of the evaluation form — free-text observation notes with an optional file attachment.

import React, { useState } from 'react';

interface NotesStepProps {
  timerSeconds: number;
  isRunning: boolean;
  onStart: () => void;
  onPause: () => void;
  onRestart: () => void;
  showTimerDisplay: boolean;
  onToggleTimerDisplay: () => void;
  notes: string;
  onNotesChange: (notes: string) => void;
  notesFileName: string | null;
  hasStoredFile: boolean;
  onNotesFileUpload: (file: File) => Promise<void>;
  onDownloadFile: () => Promise<void>;
}

export const NotesStep: React.FC<NotesStepProps> = ({
  timerSeconds,
  isRunning,
  onStart,
  onPause,
  onRestart,
  showTimerDisplay,
  onToggleTimerDisplay,
  notes,
  onNotesChange,
  notesFileName,
  hasStoredFile,
  onNotesFileUpload,
  onDownloadFile,
}) => {
  const [isUploading, setIsUploading] = useState(false);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleNotesFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setIsUploading(true);
    try {
      await onNotesFileUpload(file);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="evaluation-content">
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
              disabled={isUploading}
            />
            <div className="notes-upload-content">
              <div className="notes-upload-icon">+</div>
              <p className="notes-upload-title">Optional File Upload</p>
              <p className="notes-upload-subtitle">
                {isUploading
                  ? 'Uploading…'
                  : (notesFileName ?? 'Attach notes from Docs or other software')}
              </p>
            </div>
          </label>
          {hasStoredFile && !isUploading && (
            <button
              type="button"
              onClick={() => void onDownloadFile()}
              className="mt-3 rounded-md border-2 border-primary px-4 py-2 text-sm font-bold text-primary hover:bg-primary hover:text-white"
            >
              Download attachment
            </button>
          )}
        </div>
      </aside>

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
