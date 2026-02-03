'use client';

import { Goal, Entry } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface GoalCardProps {
  goal: Goal;
  entries: Entry[];
  onAddEntry: (goalId: string) => void;
  onClick: (goalId: string) => void;
}

export function GoalCard({ goal, entries, onAddEntry, onClick }: GoalCardProps) {
  const goalEntries = entries.filter(e => e.goalId === goal.id);
  
  const getStatusText = () => {
    if (goalEntries.length === 0) return 'No entries yet';
    
    const latestEntry = goalEntries.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )[0];
    
    if (goal.type === 'numeric') {
      const config = goal.config as { unit: string };
      return `${latestEntry.value} ${config.unit}`;
    }
    
    if (goal.type === 'adherence') {
      const today = new Date().toISOString().split('T')[0];
      const todayEntry = goalEntries.find(e => e.date === today);
      return todayEntry?.value ? '✓ Done today' : 'Not done today';
    }
    
    if (goal.type === 'frequency') {
      const config = goal.config as { timeframe: string };
      return `${goalEntries.length} times (${config.timeframe})`;
    }
    
    if (goal.type === 'duration') {
      const config = goal.config as { unit: string };
      const total = goalEntries.reduce((sum, e) => sum + (e.value as number), 0);
      return `${total} ${config.unit}`;
    }
    
    return '';
  };

  const getTypeLabel = () => {
    return goal.type.charAt(0).toUpperCase() + goal.type.slice(1);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <CardHeader className="pb-3" onClick={() => onClick(goal.id)}>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl">{goal.name}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{getTypeLabel()} Goal</p>
          </div>
        </div>
      </CardHeader>
      <CardContent onClick={() => onClick(goal.id)}>
        <div className="space-y-2">
          <p className="text-2xl font-bold">{getStatusText()}</p>
          <p className="text-sm text-muted-foreground">
            {goalEntries.length} {goalEntries.length === 1 ? 'entry' : 'entries'} total
          </p>
        </div>
      </CardContent>
      <div className="px-6 pb-4">
        <Button 
          onClick={(e) => {
            e.stopPropagation();
            onAddEntry(goal.id);
          }} 
          className="w-full"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Entry
        </Button>
      </div>
    </Card>
  );
}
