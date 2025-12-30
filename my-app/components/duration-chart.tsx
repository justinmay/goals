'use client';

import { Entry, Goal, DurationConfig } from '@/lib/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { format, startOfDay, subDays } from 'date-fns';

interface DurationChartProps {
  goal: Goal;
  entries: Entry[];
}

export function DurationChart({ goal, entries }: DurationChartProps) {
  const config = goal.config as DurationConfig;
  const goalEntries = entries.filter(e => e.goalId === goal.id);

  const days = Array.from({ length: 30 }, (_, i) => {
    const date = startOfDay(subDays(new Date(), 29 - i));
    return date;
  });

  const data = days.map(day => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const dayEntries = goalEntries.filter(e => e.date === dayStr);
    const total = dayEntries.reduce((sum, e) => sum + (e.value as number), 0);

    return {
      date: format(day, 'MMM d'),
      duration: total,
    };
  });

  if (data.every(d => d.duration === 0)) {
    return (
      <div className="w-full h-80 flex items-center justify-center text-muted-foreground">
        No data to display
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="duration" fill="#8884d8" name={`Duration (${config.unit})`} />
        {config.timeframe === 'daily' && (
          <ReferenceLine 
            y={config.targetDuration} 
            stroke="red" 
            strokeDasharray="3 3"
            label={{ value: `Target: ${config.targetDuration}`, position: 'right' }}
          />
        )}
      </BarChart>
    </ResponsiveContainer>
  );
}
