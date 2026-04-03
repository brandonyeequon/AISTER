// Reusable timer widget displayed in the right sidebar of evaluation steps 2–5.
// Accepts the same timer state and handlers as the main timer step so the evaluator
// can start, pause, or restart the timer without navigating back to step 1.
// The elapsed time display can be hidden/shown via the toggle button.

import React from 'react';

interface TimerFloatProps {
  timerSeconds: number;
  isRunning: boolean;
  onStart: () => void;
  onPause: () => void;
  onRestart: () => void;
  /** Controls whether the HH:MM:SS display is visible. Toggled by the evaluator. */
  showTimerDisplay: boolean;
  /** Fires when the evaluator clicks Hide Time / Show Time. */
  onToggleTimerDisplay: () => void;
  /** CSS class applied to the outermost wrapper. Defaults to "ster-timer-float". */
  className?: string;
}

/** Sidebar timer widget reused across all evaluation steps after step 1. */
export const TimerFloat: React.FC<TimerFloatProps> = ({
  timerSeconds,
  isRunning,
  onStart,
  onPause,
  onRestart,
  showTimerDisplay,
  onToggleTimerDisplay,
  className = 'ster-timer-float',
}) => {
  /** Converts raw seconds to HH:MM:SS display string. */
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className={className}>
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
    </div>
  );
};
