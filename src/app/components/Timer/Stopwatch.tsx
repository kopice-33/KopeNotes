import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

export function Stopwatch() {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 10);
      }, 10);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = Math.floor((ms % 1000) / 10);

    return {
      minutes: minutes.toString().padStart(2, '0'),
      seconds: seconds.toString().padStart(2, '0'),
      milliseconds: milliseconds.toString().padStart(2, '0'),
    };
  };

  const time = formatTime(elapsedTime);

  const handleReset = () => {
    setIsRunning(false);
    setElapsedTime(0);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full gap-8">
      <div className="text-6xl font-mono font-light text-white tracking-wider">
        {time.minutes}:{time.seconds}
        <span className="text-3xl text-white/70">.{time.milliseconds}</span>
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
          onClick={handleReset}
          className="w-14 h-14 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 flex items-center justify-center transition-all"
        >
          <RotateCcw className="size-5 text-white" />
        </button>
      </div>
    </div>
  );
}
