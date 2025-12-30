'use client';

import { Entry, Goal, FrequencyConfig } from '@/lib/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { format, parseISO, endOfWeek, eachWeekOfInterval } from 'date-fns';

interface FrequencyChartProps {
  goal: Goal;
  entries: Entry[];
}

export function FrequencyChart({ goal, entries }: FrequencyChartProps) {
  const config = goal.config as FrequencyConfig;
  const goalEntries = entries.filter(e => e.goalId === goal.id);

  const getChartData = () => {
    if (config.timeframe === 'weekly') {
      const now = new Date();
      const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
      const weeks = eachWeekOfInterval({
        start: sixtyDaysAgo,
        end: now,
      });

      return weeks.map(weekStart => {
        const weekEnd = endOfWeek(weekStart);
        const count = goalEntries.filter(e => {
          const date = parseISO(e.date);
          return date >= weekStart && date <= weekEnd;
        }).length;

        return {
          period: format(weekStart, 'MMM d'),
          count,
        };
      });
    }

    return [];
  };

  const data = getChartData();

  if (data.length === 0) {
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
        <XAxis dataKey="period" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="count" fill="#82ca9d" name="Count" />
        <ReferenceLine 
          y={config.targetCount} 
          stroke="red" 
          strokeDasharray="3 3"
          label={{ value: `Target: ${config.targetCount}`, position: 'right' }}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
