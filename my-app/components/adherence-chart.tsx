'use client';

import { useEffect, useState } from 'react';
import { Entry, Goal } from '@/lib/types';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AdherenceChartProps {
  goal: Goal;
  entries: Entry[];
  onDayClick?: (date: Date, entry?: Entry) => void;
  onStatsCalculated?: (stats: { streak: number; completionRate: number }) => void;
}

export function AdherenceChart({ goal, entries, onDayClick, onStatsCalculated }: AdherenceChartProps) {
  const goalEntries = entries.filter(e => e.goalId === goal.id);
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getDayStatus = (day: Date) => {
    const entry = goalEntries.find(e => isSameDay(parseISO(e.date), day));
    if (!entry) return { status: 'none', entry: undefined };
    return { status: entry.value ? 'completed' : 'skipped', entry };
  };

  const getStatusColor = (status: string) => {
    if (status === 'completed') return 'bg-green-500 hover:bg-green-600';
    if (status === 'skipped') return 'bg-red-500 hover:bg-red-600';
    return 'bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700';
  };

  const totalDays = daysInMonth.length;
  const completedDays = goalEntries.filter(e => e.value === true).length;
  const completionRate = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;

  const streak = calculateStreak(goalEntries);

  // Notify parent of calculated stats after render
  useEffect(() => {
    if (onStatsCalculated) {
      onStatsCalculated({ streak, completionRate });
    }
  }, [streak, completionRate, onStatsCalculated]);

  const handlePreviousMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1));
  };

  const handleToday = () => {
    setCurrentMonth(new Date());
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-3">
          <Button variant="ghost" size="sm" onClick={handlePreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-base font-semibold">{format(currentMonth, 'MMMM yyyy')}</h3>
          <Button variant="ghost" size="sm" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-xs font-medium text-muted-foreground py-1">
              {day}
            </div>
          ))}
          
          {Array.from({ length: monthStart.getDay() }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          
          {daysInMonth.map(day => {
            const { status, entry } = getDayStatus(day);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const dayDate = new Date(day);
            dayDate.setHours(0, 0, 0, 0);
            const isToday = isSameDay(dayDate, today);
            const isFuture = dayDate > today;
            
            return (
              <button
                key={day.toISOString()}
                onClick={() => !isFuture && onDayClick?.(day, entry)}
                disabled={isFuture}
                className={`
                  aspect-square flex items-center justify-center rounded-md
                  ${isFuture ? 'bg-gray-100 dark:bg-gray-900 cursor-not-allowed opacity-50' : getStatusColor(status)}
                  ${isToday ? 'ring-2 ring-blue-500' : ''}
                  transition-colors ${!isFuture ? 'cursor-pointer' : ''}
                `}
                title={isFuture ? `${format(day, 'MMM d, yyyy')} - Future date` : `${format(day, 'MMM d, yyyy')} - ${status}${entry ? '\nClick to edit' : '\nClick to add entry'}`}
              >
                <span className={`text-xs font-medium ${!isFuture && status !== 'none' ? 'text-white' : 'text-muted-foreground'}`}>
                  {format(day, 'd')}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-center gap-4 mt-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-green-500" />
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-red-500" />
            <span>Skipped</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-gray-200 dark:bg-gray-800" />
            <span>No data</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function calculateStreak(entries: Entry[]): number {
  if (entries.length === 0) return 0;
  
  const completedDates = entries
    .filter(e => e.value === true)
    .map(e => parseISO(e.date))
    .sort((a, b) => b.getTime() - a.getTime());

  if (completedDates.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < completedDates.length; i++) {
    const date = new Date(completedDates[i]);
    date.setHours(0, 0, 0, 0);
    
    const expectedDate = new Date(today);
    expectedDate.setDate(today.getDate() - streak);
    expectedDate.setHours(0, 0, 0, 0);

    if (date.getTime() === expectedDate.getTime()) {
      streak++;
    } else if (date.getTime() < expectedDate.getTime()) {
      break;
    }
  }

  return streak;
}
