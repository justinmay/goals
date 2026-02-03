'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Goal, NumericConfig, AdherenceConfig, FrequencyConfig, DurationConfig } from '@/lib/types';

interface EditGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: Goal | null;
  onSave: (goal: Goal) => void;
}

export function EditGoalDialog({ open, onOpenChange, goal, onSave }: EditGoalDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  
  // Numeric config
  const [unit, setUnit] = useState('lbs');
  const [target, setTarget] = useState('');
  const [startValue, setStartValue] = useState('');
  const [direction, setDirection] = useState<'increase' | 'decrease'>('decrease');
  const [targetRate, setTargetRate] = useState('');
  
  // Adherence config
  const [targetDaysPerWeek, setTargetDaysPerWeek] = useState('');
  
  // Frequency config
  const [targetCount, setTargetCount] = useState('3');
  const [frequencyTimeframe, setFrequencyTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  
  // Duration config
  const [durationUnit, setDurationUnit] = useState<'minutes' | 'hours'>('minutes');
  const [targetDuration, setTargetDuration] = useState('30');
  const [durationTimeframe, setDurationTimeframe] = useState<'daily' | 'weekly'>('daily');

  // Load goal data when dialog opens or goal changes
  useEffect(() => {
    if (goal && open) {
      setName(goal.name);
      setDescription(goal.description || '');
      
      if (goal.type === 'numeric') {
        const config = goal.config as NumericConfig;
        setUnit(config.unit);
        setTarget(config.target?.toString() || '');
        setStartValue(config.startValue?.toString() || '');
        setDirection(config.direction);
        setTargetRate(config.targetRate?.toString() || '');
      } else if (goal.type === 'adherence') {
        const config = goal.config as AdherenceConfig;
        setTargetDaysPerWeek(config.targetDaysPerWeek?.toString() || '');
      } else if (goal.type === 'frequency') {
        const config = goal.config as FrequencyConfig;
        setTargetCount(config.targetCount.toString());
        setFrequencyTimeframe(config.timeframe);
      } else if (goal.type === 'duration') {
        const config = goal.config as DurationConfig;
        setDurationUnit(config.unit);
        setTargetDuration(config.targetDuration.toString());
        setDurationTimeframe(config.timeframe);
      }
    }
  }, [goal, open]);

  const handleSave = useCallback(() => {
    if (!goal) return;
    
    let config;
    
    if (goal.type === 'numeric') {
      config = {
        type: 'numeric' as const,
        unit,
        target: target ? parseFloat(target) : undefined,
        startValue: startValue ? parseFloat(startValue) : undefined,
        direction,
        targetRate: targetRate ? parseFloat(targetRate) : undefined,
      };
    } else if (goal.type === 'adherence') {
      config = {
        type: 'adherence' as const,
        targetDaysPerWeek: targetDaysPerWeek ? parseInt(targetDaysPerWeek) : undefined,
      };
    } else if (goal.type === 'frequency') {
      config = {
        type: 'frequency' as const,
        targetCount: parseInt(targetCount),
        timeframe: frequencyTimeframe,
      };
    } else {
      config = {
        type: 'duration' as const,
        unit: durationUnit,
        targetDuration: parseFloat(targetDuration),
        timeframe: durationTimeframe,
      };
    }

    const updatedGoal: Goal = {
      ...goal,
      name,
      description: description || undefined,
      config,
    };

    onSave(updatedGoal);
    onOpenChange(false);
  }, [goal, name, description, unit, target, startValue, direction, targetRate, targetDaysPerWeek, targetCount, frequencyTimeframe, durationUnit, targetDuration, durationTimeframe, onSave, onOpenChange]);

  if (!goal) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Goal</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Goal Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Weight Loss, Mouth Guard"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Notes about this goal..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Goal Type</Label>
            <div className="text-sm text-muted-foreground">
              {goal.type.charAt(0).toUpperCase() + goal.type.slice(1)} (cannot be changed)
            </div>
          </div>

          {goal.type === 'numeric' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Input
                  id="unit"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="e.g., lbs, kg, steps"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="direction">Direction</Label>
                <Select value={direction} onValueChange={(v) => setDirection(v as 'increase' | 'decrease')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="decrease">Decrease (e.g., weight loss)</SelectItem>
                    <SelectItem value="increase">Increase (e.g., muscle gain)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startValue">Start Value (Optional)</Label>
                  <Input
                    id="startValue"
                    type="number"
                    value={startValue}
                    onChange={(e) => setStartValue(e.target.value)}
                    placeholder="e.g., 200"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="target">Target (Optional)</Label>
                  <Input
                    id="target"
                    type="number"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    placeholder="e.g., 180"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetRate">Target Rate (Optional)</Label>
                <Input
                  id="targetRate"
                  type="number"
                  value={targetRate}
                  onChange={(e) => setTargetRate(e.target.value)}
                  placeholder="e.g., -2 for losing 2/week, +5 for gaining 5/week"
                />
                <p className="text-xs text-muted-foreground">
                  Change per week (use negative for decrease, positive for increase)
                </p>
              </div>
            </>
          )}

          {goal.type === 'adherence' && (
            <div className="space-y-2">
              <Label htmlFor="targetDays">Target Days Per Week (Optional)</Label>
              <Input
                id="targetDays"
                type="number"
                min="1"
                max="7"
                value={targetDaysPerWeek}
                onChange={(e) => setTargetDaysPerWeek(e.target.value)}
              />
            </div>
          )}

          {goal.type === 'frequency' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="targetCount">Target Count</Label>
                <Input
                  id="targetCount"
                  type="number"
                  value={targetCount}
                  onChange={(e) => setTargetCount(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="frequencyTimeframe">Timeframe</Label>
                <Select value={frequencyTimeframe} onValueChange={(v) => setFrequencyTimeframe(v as 'daily' | 'weekly' | 'monthly')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {goal.type === 'duration' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="durationUnit">Unit</Label>
                <Select value={durationUnit} onValueChange={(v) => setDurationUnit(v as 'minutes' | 'hours')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minutes">Minutes</SelectItem>
                    <SelectItem value="hours">Hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="targetDuration">Target Duration</Label>
                <Input
                  id="targetDuration"
                  type="number"
                  value={targetDuration}
                  onChange={(e) => setTargetDuration(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="durationTimeframe">Timeframe</Label>
                <Select value={durationTimeframe} onValueChange={(v) => setDurationTimeframe(v as 'daily' | 'weekly')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
