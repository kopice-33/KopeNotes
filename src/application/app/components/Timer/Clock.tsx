import { useState, useEffect } from 'react';

export function Clock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours().toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const seconds = time.getSeconds().toString().padStart(2, '0');
  const date = time.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

return (
    <div className="flex flex-col items-center justify-center h-full gap-0.25">
        <div className="flex items-baseline gap-1">
        {/* Main time */}
        <div className="text-8xl font-semibold text-white flex items-baseline" 
            style={{ fontFamily: "'Qahiri', sans-serif" }}>
            {hours}
              <span className="inline-flex flex-col justify-center mx-3 gap-1 self-center">
                <div className="w-3 h-3 bg-white/80"></div>
                <div className="w-3 h-3 bg-white/80"></div>
            </span>
            {minutes}
        </div>
        
        {/* Seconds with "sec" label */}
        <div className="flex flex-col items-center ml-4">
            <div className="text-4xl font-medium text-white/70" 
                style={{ fontFamily: "'Qahiri', sans-serif" }}>
            {seconds}
            </div>
        </div>
        </div>
          <div className="text-base font-medium text-white/60 tracking-wider -mt-2" 
            style={{ fontFamily: "'Orbitron', sans-serif" }}>
        {date}
        </div>
    </div>
  );
}
