import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

const presetTimes = [
  { label: '5m', seconds: 300 },
  { label: '30m', seconds: 1800 },
  { label: '1h', seconds: 3600 },
];

interface TimerPageProps {
  selectedTime: number;
  timeLeft: number;
  isRunning: boolean;
  customTime: string;
  setSelectedTime: (seconds: number) => void;
  setTimeLeft: (seconds: number) => void;
  setIsRunning: (running: boolean) => void;
  setCustomTime: (minutes: string) => void;
}

export function TimerPage({
  selectedTime,
  timeLeft,
  isRunning,
  customTime,
  setSelectedTime,
  setTimeLeft,
  setIsRunning,
  setCustomTime
}: TimerPageProps) {

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

const formatTimeParts = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return {
    minutes: minutes.toString().padStart(2, '0'),
    seconds: secs.toString().padStart(2, '0'),
  };
};

const { minutes, seconds } = formatTimeParts(timeLeft);

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(selectedTime);
  };

  const handlePresetClick = (seconds: number) => {
    setSelectedTime(seconds); // Use prop setter
    setTimeLeft(seconds);
    setIsRunning(false);
  };

  const progress = ((selectedTime - timeLeft) / selectedTime) * 100;

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 p-4">
      <div className="relative w-32 h-32 sm:w-48 sm:h-48">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
            cx="50%"
            cy="50%"
            r="45%"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="4%"
            fill="none"
            />
            <circle
            cx="50%"
            cy="50%"
            r="45%"
            stroke="rgba(255,255,255,0.8)"
            strokeWidth="4%"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 45}`}
            strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
            strokeLinecap="round"
            className="transition-all duration-1000"
            />
        </svg>
            <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-5xl sm:text-6xl font-semibold text-white flex items-baseline"
                style={{ fontFamily: "'Qahiri', sans-serif" }}>
                {minutes}
                <span className="inline-flex flex-col justify-center mx-2 gap-0.5 self-center">
                <div className="w-1 h-1 bg-white/80"></div>
                <div className="w-1 h-1 bg-white/80"></div>
                </span>
                {seconds}
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
          {/* Add Custom button */}
        <div className="flex items-center gap-2">
  <input
    type="number"
    min="1"
    max="1440"
    value={customTime}
    onChange={(e) => {
      const minutes = parseInt(e.target.value);
      if (minutes > 0 && minutes <= 1440) {
        const totalSeconds = minutes * 60;
        setSelectedTime(totalSeconds);
        setTimeLeft(totalSeconds);
        setIsRunning(false);
      }
      setCustomTime(e.target.value);
    }}
    placeholder="min"
    className="px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/30 rounded text-white placeholder:text-white/50 focus:outline-none focus:border-white/50 w-20"
  />
</div>

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
