'use client';

import { Entry, Goal, NumericConfig } from '@/lib/types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { format, parseISO, addWeeks } from 'date-fns';

interface NumericChartProps {
  goal: Goal;
  entries: Entry[];
}

export function NumericChart({ goal, entries }: NumericChartProps) {
  const config = goal.config as NumericConfig;
  
  const sortedEntries = [...entries]
    .filter(e => e.goalId === goal.id)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const data = sortedEntries.map(entry => ({
    date: format(parseISO(entry.date), 'MMM d'),
    value: entry.value as number,
    projection: undefined as number | undefined,
    fullDate: entry.date,
  }));

  // Add projection data if targetRate is set
  if (config.targetRate && data.length > 0) {
    const lastEntry = data[data.length - 1];
    const lastValue = lastEntry.value;
    const lastDate = parseISO(lastEntry.fullDate);
    
    // Set projection value on the last actual entry to connect the lines
    lastEntry.projection = lastValue;
    
    // Project for 12 weeks into the future
    for (let i = 1; i <= 12; i++) {
      const projectionDate = addWeeks(lastDate, i);
      const projectionValue = lastValue + (config.targetRate * i);
      
      data.push({
        date: format(projectionDate, 'MMM d'),
        value: undefined as any,
        projection: projectionValue,
        fullDate: format(projectionDate, 'yyyy-MM-dd'),
      });
    }
  }

  if (sortedEntries.length === 0) {
    return (
      <div className="w-full h-80 flex items-center justify-center text-muted-foreground">
        No data to display
      </div>
    );
  }

  // Calculate y-axis domain
  const values = data.map(d => d.value).filter(v => v !== undefined);
  const projectionValues = data.map(d => d.projection).filter(v => v !== undefined);
  const allTimeMax = Math.max(...values);
  const allTimeMin = Math.min(...values);
  
  // Include milestone, target, and projection values in range calculation
  const referenceValues = [
    ...(config.target ? [config.target] : []),
    ...goal.milestones.map(m => m.value),
    ...projectionValues,
  ];
  
  const allValues = [...values, ...referenceValues];
  const dataMax = Math.max(...allValues);
  const dataMin = Math.min(...allValues);
  
  // Calculate padding (10% of range)
  const range = dataMax - dataMin;
  const padding = range * 0.1;
  
  let yMin: number;
  let yMax: number;
  
  if (config.direction === 'decrease') {
    // For decreasing goals: start from goal/target (or 0) up to max with padding
    yMin = config.target !== undefined ? Math.min(config.target, dataMin - padding) : Math.min(0, dataMin - padding);
    yMax = allTimeMax + padding;
  } else {
    // For increasing goals: start from goal/target (or 0) up to max with padding
    yMin = config.target !== undefined ? Math.min(config.target, dataMin - padding) : Math.min(0, dataMin - padding);
    yMax = dataMax + padding;
  }
  
  // Ensure min is not greater than max
  if (yMin >= yMax) {
    yMin = dataMin - padding;
    yMax = dataMax + padding;
  }

  // Helper function to round to nearest 5 or 10 for cleaner labels
  const roundToNice = (value: number) => {
    const absValue = Math.abs(value);
    let roundTo;
    
    if (absValue < 20) {
      roundTo = 5;
    } else if (absValue < 100) {
      roundTo = 10;
    } else if (absValue < 500) {
      roundTo = 25;
    } else {
      roundTo = 50;
    }
    
    const rounded = Math.round(value / roundTo) * roundTo;
    return rounded;
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data} margin={{ top: 5, right: 80, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis 
          domain={[yMin, yMax]} 
          tickFormatter={(value) => roundToNice(value).toString()}
          allowDecimals={false}
        />
        <Tooltip />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="value" 
          stroke="#8884d8" 
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
          name={`Value (${config.unit})`}
          connectNulls={false}
        />
        {config.targetRate && (
          <Line 
            type="monotone" 
            dataKey="projection" 
            stroke="#3b82f6" 
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            name={`Projection (${config.targetRate > 0 ? '+' : ''}${config.targetRate}/${config.unit}/week)`}
            connectNulls={false}
          />
        )}
        {config.target && (
          <ReferenceLine 
            y={config.target} 
            stroke="red" 
            strokeDasharray="3 3"
            label={{ value: `Target: ${config.target}`, position: 'right' }}
          />
        )}
        {goal.milestones.map(milestone => (
          <ReferenceLine
            key={milestone.id}
            y={milestone.value}
            stroke={milestone.achieved ? "green" : "orange"}
            strokeDasharray="3 3"
            label={{ value: milestone.label, position: 'right' }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
