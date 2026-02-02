import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface StopwatchProps {
  elapsedTime: number; 
  isRunning: boolean;
  setIsRunning: (running: boolean) => void;
  resetStopwatch: () => void;
}

export function Stopwatch({ elapsedTime, isRunning, setIsRunning, resetStopwatch }: StopwatchProps) {
    
  const formatTime = (seconds: number) => {
    const totalSeconds = Math.floor(seconds);
    const minutes = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    const milliseconds = Math.floor((seconds % 1) * 100);

    return {
      minutes: minutes.toString().padStart(2, '0'),
      seconds: secs.toString().padStart(2, '0'),
      milliseconds: milliseconds.toString().padStart(2, '0'),
    };
  };


  const time = formatTime(elapsedTime);

  return (
    <div className="flex flex-col items-center justify-center h-full gap-8">
        <div className="flex items-baseline gap-1">
            <div className="text-8xl font-semibold text-white flex items-baseline" 
                style={{ fontFamily: "'Qahiri', sans-serif" }}>
            {time.minutes}
            <span className="inline-flex flex-col justify-center mx-3 gap-1 self-center">
                <div className="w-3 h-3 bg-white/80"></div>
                <div className="w-3 h-3 bg-white/80"></div>
            </span>
            {time.seconds}
            <span className="text-3xl text-white/70 ml-0.25">
            <span className="inline-flex flex-col justify-center mx-1 gap-1 self-center">
                <div className="w-1 h-1 bg-white/70"></div>
            </span>
            {time.milliseconds}</span>
            </div>
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className="w-14 h-14 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 flex items-center justify-center transition-all"
        >
          {isRunning ? (
            <Pause className="size-6 text-white" />
          ) : (
            <Play className="size-6 text-white ml-0.5" />
          )}
        </button>
        <button
          onClick={resetStopwatch}
          className="w-14 h-14 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 flex items-center justify-center transition-all"
        >
          <RotateCcw className="size-5 text-white" />
        </button>
      </div>
    </div>
  );
}