import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, startOfWeek, endOfWeek } from 'date-fns';

interface CalendarViewProps {
  onDateSelect: (date: Date) => void;
  selectedDate: Date;
  getTodosForDate: (date: string) => number;
}

export function CalendarView({ onDateSelect, selectedDate, getTodosForDate }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  return (
    <div className="p-4 pt-16">
      <div className="flex items-center justify-center mb-4 relative">
        <button
          onClick={goToPreviousMonth}
          className="absolute left-0 p-1 hover:bg-white/10 rounded transition-all"
        >
          <ChevronLeft className="size-5 text-white" />
        </button>
        <h2 className="text-lg font-medium text-white">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <button
          onClick={goToNextMonth}
          className="absolute right-0 p-1 hover:bg-white/10 rounded transition-all"
        >
          <ChevronRight className="size-5 text-white" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center text-xs text-white/50 py-1">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const todoCount = getTodosForDate(dateKey);
          const isSelected = format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
          const isTodayDate = isToday(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);

          return (
            <button
              key={day.toISOString()}
              onClick={() => onDateSelect(day)}
              className={`
                aspect-square p-1 rounded text-sm relative transition-all
                ${!isCurrentMonth ? 'text-white/30' : 'text-white'}
                ${isSelected ? 'bg-white/30 border border-white/50' : 'hover:bg-white/10'}
                ${isTodayDate && !isSelected ? 'border border-white/30' : ''}
              `}
            >
              <div className="flex flex-col items-center justify-center h-full">
                <span>{format(day, 'd')}</span>
                {todoCount > 0 && (
                  <div className="absolute bottom-1 w-1 h-1 rounded-full bg-white/70"></div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}