'use client';

import { useState } from 'react';
import { Goal, Entry } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, X } from 'lucide-react';
import { format } from 'date-fns';

interface HomeGoalCardProps {
  goal: Goal;
  entries: Entry[];
  onSaveEntry: (entry: Entry) => void;
}

export function HomeGoalCard({ goal, entries, onSaveEntry }: HomeGoalCardProps) {
  const today = format(new Date(), 'yyyy-MM-dd');
  const goalEntries = entries.filter(e => e.goalId === goal.id);
  const todayEntry = goalEntries.find(e => e.date === today);
  
  const [editValue, setEditValue] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const handleToggleAdherence = () => {
    const entry: Entry = {
      id: todayEntry?.id || Date.now().toString(),
      goalId: goal.id,
      date: today,
      timestamp: todayEntry?.timestamp || new Date().toISOString(),
      value: todayEntry ? !todayEntry.value : true,
    };
    onSaveEntry(entry);
  };

  const handleSaveNumericValue = () => {
    if (!editValue) return;
    const entry: Entry = {
      id: todayEntry?.id || Date.now().toString(),
      goalId: goal.id,
      date: today,
      timestamp: todayEntry?.timestamp || new Date().toISOString(),
      value: parseFloat(editValue),
    };
    onSaveEntry(entry);
    setIsEditing(false);
    setEditValue('');
  };

  const startEditing = () => {
    setEditValue(todayEntry && typeof todayEntry.value === 'number' ? todayEntry.value.toString() : '');
    setIsEditing(true);
  };

  const getConfig = () => {
    if (goal.type === 'numeric') return goal.config as { unit: string };
    if (goal.type === 'duration') return goal.config as { unit: string };
    return { unit: '' };
  };

  const renderContent = () => {
    if (goal.type === 'adherence') {
      const isDone = todayEntry?.value === true;
      return (
        <Button
          variant={isDone ? 'default' : 'outline'}
          className="w-full"
          onClick={handleToggleAdherence}
        >
          {isDone ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Done today
            </>
          ) : (
            'Mark as done'
          )}
        </Button>
      );
    }

    if (isEditing) {
      const config = getConfig();
      return (
        <div className="flex gap-2">
          <Input
            type="number"
            step="0.1"
            placeholder={config.unit}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveNumericValue();
              if (e.key === 'Escape') setIsEditing(false);
            }}
            autoFocus
          />
          <Button size="icon" onClick={handleSaveNumericValue}>
            <Check className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={() => setIsEditing(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      );
    }

    const config = getConfig();
    if (todayEntry && typeof todayEntry.value === 'number') {
      return (
        <Button variant="outline" className="w-full" onClick={startEditing}>
          Today: {todayEntry.value} {config.unit}
        </Button>
      );
    }

    return (
      <Button variant="outline" className="w-full" onClick={startEditing}>
        Log today&apos;s {goal.type === 'numeric' ? config.unit : 'entry'}
      </Button>
    );
  };

  const getTypeLabel = () => {
    return goal.type.charAt(0).toUpperCase() + goal.type.slice(1);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{goal.name}</CardTitle>
        <p className="text-xs text-muted-foreground">{getTypeLabel()}</p>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );
}
