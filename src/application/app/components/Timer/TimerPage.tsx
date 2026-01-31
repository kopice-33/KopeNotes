import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

const presetTimes = [
  { label: '5 min', seconds: 300 },
  { label: '30 min', seconds: 1800 },
  { label: '1 hr', seconds: 3600 },
];

export function TimerPage() {
  const [selectedTime, setSelectedTime] = useState(300);
  const [timeLeft, setTimeLeft] = useState(300);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            // Timer finished
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, timeLeft]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(selectedTime);
  };

  const handlePresetClick = (seconds: number) => {
    setSelectedTime(seconds);
    setTimeLeft(seconds);
    setIsRunning(false);
  };

  const progress = ((selectedTime - timeLeft) / selectedTime) * 100;

  return (
    <div className="flex flex-col items-center justify-center h-full gap-8 p-6">
      <div className="relative w-48 h-48">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="96"
            cy="96"
            r="88"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="8"
            fill="none"
          />
          <circle
            cx="96"
            cy="96"
            r="88"
            stroke="rgba(255,255,255,0.8)"
            strokeWidth="8"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 88}`}
            strokeDashoffset={`${2 * Math.PI * 88 * (1 - progress / 100)}`}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-4xl font-mono font-light text-white">
            {formatTime(timeLeft)}
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        {presetTimes.map((preset) => (
          <button
            key={preset.label}
            onClick={() => handlePresetClick(preset.seconds)}
            className={`px-4 py-2 rounded-lg backdrop-blur-sm border transition-all ${
              selectedTime === preset.seconds
                ? 'bg-white/30 border-white/50 text-white'
                : 'bg-white/10 border-white/20 text-white/70 hover:bg-white/20'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setIsRunning(!isRunning)}
          disabled={timeLeft === 0}
          className="w-14 h-14 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
