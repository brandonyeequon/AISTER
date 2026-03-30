import React from 'react';

interface TimerFloatProps {
  timerSeconds: number;
  isRunning: boolean;
  onStart: () => void;
  onPause: () => void;
  onRestart: () => void;
  className?: string;
}

export const TimerFloat: React.FC<TimerFloatProps> = ({
  timerSeconds,
  isRunning,
  onStart,
  onPause,
  onRestart,
  className = 'ster-timer-float',
}) => {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className={className}>
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
    </div>
  );
};
