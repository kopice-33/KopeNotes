import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, GripVertical, Calendar as CalendarIcon, Pin, PinOff } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'motion/react';
import { format, subDays } from 'date-fns';
import { VerticalTabs } from '@/application/app/components/VerticalTabs';
import { Clock } from '@/application/app/components/Timer/Clock';
import { Stopwatch } from '@/application/app/components/Timer/Stopwatch';
import { TimerPage } from '@/application/app/components/Timer/TimerPage';
import { TodoList, Todo } from '@/application/app/components/Todo/TodoList';
import { CalendarView } from '@/application/app/components/Todo/CalendarView';
import { MemoGrid } from '@/application/app/components/Memo/MemoGrid';

export default function App() {
  const [activeTab, setActiveTab] = useState('timer');
  const [timerPage, setTimerPage] = useState(0); // 0: clock, 1: stopwatch, 2: timer
  const [timerDirection, setTimerDirection] = useState<'left' | 'right'>('right');
  const [todoView, setTodoView] = useState<'today' | 'yesterday' | 'calendar'>('today');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isPinned, setIsPinned] = useState(false);
  const [opacity, setOpacity] = useState(0.95);
  const [size, setSize] = useState({ width: 500, height: 600 });
  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef<{ startX: number; startY: number; startWidth: number; startHeight: number }>({
    startX: 0,
    startY: 0,
    startWidth: 0,
    startHeight: 0,
  });

  // Load saved position and size from localStorage
  useEffect(() => {
    const savedPosition = localStorage.getItem('appPosition');
    const savedSize = localStorage.getItem('appSize');
    const savedOpacity = localStorage.getItem('appOpacity');
    const savedPinned = localStorage.getItem('appPinned');

    if (savedPosition) {
      setPosition(JSON.parse(savedPosition));
    }
    if (savedSize) {
      setSize(JSON.parse(savedSize));
    }
    if (savedOpacity) {
      setOpacity(parseFloat(savedOpacity));
    }
    if (savedPinned) {
      setIsPinned(JSON.parse(savedPinned));
    }
  }, []);

  // Save position and size to localStorage
  useEffect(() => {
    localStorage.setItem('appPosition', JSON.stringify(position));
  }, [position]);

  useEffect(() => {
    localStorage.setItem('appSize', JSON.stringify(size));
  }, [size]);

  useEffect(() => {
    localStorage.setItem('appOpacity', opacity.toString());
  }, [opacity]);

  useEffect(() => {
    localStorage.setItem('appPinned', JSON.stringify(isPinned));
  }, [isPinned]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.drag-handle')) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    } else if ((e.target as HTMLElement).closest('.resize-handle')) {
      handleResizeMouseDown(e);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y,
        });
      }
      if (isResizing) {
        const deltaX = e.clientX - resizeRef.current.startX;
        const deltaY = e.clientY - resizeRef.current.startY;
        setSize({
          width: Math.max(400, resizeRef.current.startWidth + deltaX),
          height: Math.max(500, resizeRef.current.startHeight + deltaY),
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragStart]);

  const getTodosForDate = (dateKey: string): number => {
    const stored = localStorage.getItem('todos');
    if (!stored) return 0;
    const todos: Todo[] = JSON.parse(stored);
    return todos.filter(todo => todo.date === dateKey).length;
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setTodoView('today');
  };

  const handleTimerDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100;
    if (info.offset.x > threshold) {
      // Swipe right
      if (timerPage === 1) setTimerPage(0); // clock -> stopwatch
      else if (timerPage === 2) setTimerPage(1); // timer -> clock
    } else if (info.offset.x < -threshold) {
      // Swipe left
      if (timerPage === 1) setTimerPage(2); // clock -> timer
      else if (timerPage === 0) setTimerPage(1); // stopwatch -> clock
    }
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    resizeRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startWidth: size.width,
      startHeight: size.height,
    };
  };

  const handleTodoNavigation = (direction: 'left' | 'right') => {
    if (todoView === 'today') {
      if (direction === 'left') {
        setSelectedDate(subDays(selectedDate, 1));
      }
    } else if (todoView === 'yesterday') {
      if (direction === 'right') setTodoView('today');
    }
  };

  const handlePinClick = () => {
    setIsPinned(!isPinned);
    setOpacity(isPinned ? 1 : 0.95);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8 flex items-center justify-center">
      <div
        className="rounded-2xl shadow-2xl border border-white/20 flex overflow-hidden select-none relative"
        style={{
          position: 'fixed',
          left: position.x,
          top: position.y,
          width: size.width,
          height: size.height,
          cursor: isDragging ? 'grabbing' : 'default',
          backgroundColor: `rgba(0, 0, 0, ${opacity * 0.4})`,
          backdropFilter: 'blur(12px)',
          zIndex: isPinned ? 9999 : 'auto',
        }}
        onMouseDown={handleMouseDown}
      >
        <VerticalTabs activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="flex-1 flex flex-col">
          {/* Drag Handle */}
          <div className="drag-handle h-10 bg-black/20 backdrop-blur-sm border-b border-white/10 flex items-center px-3 gap-3 cursor-grab active:cursor-grabbing">
            <GripVertical className="size-5 text-white/40" />
            
            <div className="flex items-center gap-2 flex-1">
              <span className="text-xs text-white/50">Opacity</span>
              <input
                type="range"
                min="0.3"
                max="1"
                step="0.05"
                value={opacity}
                onChange={(e) => setOpacity(parseFloat(e.target.value))}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                className="flex-1 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer"
              />
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsPinned(!isPinned);
              }}
              onMouseDown={(e) => e.stopPropagation()}
              className={`p-1.5 rounded backdrop-blur-sm border transition-all ${
                isPinned
                  ? 'bg-white/30 border-white/50 text-white'
                  : 'bg-white/10 border-white/20 text-white/60 hover:bg-white/20 hover:text-white'
              }`}
            >
              {isPinned ? <Pin className="size-4" /> : <PinOff className="size-4" />}
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 relative overflow-hidden">
            <AnimatePresence mode="wait">
              {activeTab === 'timer' && (
                <motion.div
                  key="timer"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="absolute inset-0 flex flex-col"
                >
                  <motion.div
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.2}
                    onDragEnd={handleTimerDragEnd}
                    className="flex-1 relative overflow-hidden"
                  >
                    <AnimatePresence mode="wait" custom={timerPage}>
                      {timerPage === 0 && (
                        <motion.div
                          key="stopwatch"
                          initial={{ opacity: 0, x: -300 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -300 }}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          className="absolute inset-0"
                        >
                          <Stopwatch />
                        </motion.div>
                      )}
                      {timerPage === 1 && (
                        <motion.div
                          key="clock"
                          initial={{ opacity: 0, x: timerPage > 1 ? -300 : 300 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: timerPage > 1 ? 300 : -300 }}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          className="absolute inset-0"
                        >
                          <Clock />
                        </motion.div>
                      )}
                      {timerPage === 2 && (
                        <motion.div
                          key="timer"
                          initial={{ opacity: 0, x: 300 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 300 }}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          className="absolute inset-0"
                        >
                          <TimerPage />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* Dots Indicator */}
                  <div className="flex justify-center gap-2 pb-4">
                    {[0, 1, 2].map((index) => (
                      <button
                        key={index}
                        onClick={() => setTimerPage(index as 0 | 1 | 2)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          timerPage === index
                            ? 'bg-white w-6'
                            : 'bg-white/40 hover:bg-white/60'
                        }`}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'todo' && (
                <motion.div
                  key="todo"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="absolute inset-0 flex flex-col"
                >
                  {/* Navigation */}
                  <div className="absolute top-4 right-4 z-10 flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedDate(subDays(selectedDate, 1));
                      }}
                      className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full border border-white/20 transition-all"
                    >
                      <ChevronLeft className="size-4 text-white" />
                    </button>
                    <button
                      onClick={() => setTodoView(todoView === 'calendar' ? 'today' : 'calendar')}
                      className={`p-2 backdrop-blur-sm rounded-full border transition-all ${
                        todoView === 'calendar'
                          ? 'bg-white/30 border-white/40'
                          : 'bg-white/10 hover:bg-white/20 border-white/20'
                      }`}
                    >
                      <CalendarIcon className="size-4 text-white" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedDate(new Date(selectedDate.getTime() + 86400000));
                      }}
                      className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full border border-white/20 transition-all"
                    >
                      <ChevronRight className="size-4 text-white" />
                    </button>
                  </div>

                  <AnimatePresence mode="wait">
                    {todoView === 'calendar' ? (
                      <motion.div
                        key="calendar"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex-1"
                      >
                        <CalendarView
                          onDateSelect={handleDateSelect}
                          selectedDate={selectedDate}
                          getTodosForDate={getTodosForDate}
                        />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="todolist"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="flex-1"
                      >
                        <TodoList date={selectedDate} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

              {activeTab === 'memo' && (
                <motion.div
                  key="memo"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="absolute inset-0"
                >
                  <MemoGrid />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Resize Handle */}
        <div
          onMouseDown={handleResizeMouseDown}
          className="absolute bottom-0 right-0 w-6 h-6 cursor-nwse-resize group"
        >
          <div className="absolute bottom-1 right-1 w-4 h-4 border-r-2 border-b-2 border-white/30 group-hover:border-white/60 transition-colors" />
        </div>
      </div>
    </div>
  );
}