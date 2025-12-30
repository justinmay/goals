'use client';

import { useState, useMemo } from 'react';
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
import { Goal, Milestone } from '@/lib/types';
import { Trash2 } from 'lucide-react';

interface MilestoneDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: Goal;
  onSave: (goal: Goal) => void;
}

export function MilestoneDialog({ open, onOpenChange, goal, onSave }: MilestoneDialogProps) {
  const initialMilestones = useMemo(() => [...goal.milestones], [goal.milestones]);
  const [milestones, setMilestones] = useState<Milestone[]>(initialMilestones);

  const handleAddMilestone = () => {
    const now = Date.now();
    const newMilestone: Milestone = {
      id: now.toString(),
      value: 0,
      label: '',
    };
    setMilestones([...milestones, newMilestone]);
  };

  const handleUpdateMilestone = (index: number, field: keyof Milestone, value: string | number | boolean | undefined) => {
    const updated = [...milestones];
    updated[index] = { ...updated[index], [field]: value };
    setMilestones(updated);
  };

  const handleDeleteMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const updatedGoal = {
      ...goal,
      milestones: milestones.filter(m => m.label && m.value),
    };
    onSave(updatedGoal);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Milestones - {goal.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {milestones.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No milestones yet. Add your first milestone below.
            </p>
          ) : (
            milestones.map((milestone, index) => (
              <div key={milestone.id} className="flex gap-4 items-end p-4 border rounded-lg">
                <div className="flex-1 space-y-2">
                  <Label htmlFor={`label-${index}`}>Label</Label>
                  <Input
                    id={`label-${index}`}
                    value={milestone.label}
                    onChange={(e) => handleUpdateMilestone(index, 'label', e.target.value)}
                    placeholder="e.g., Lost 10 lbs"
                  />
                </div>
                <div className="w-32 space-y-2">
                  <Label htmlFor={`value-${index}`}>Value</Label>
                  <Input
                    id={`value-${index}`}
                    type="number"
                    value={milestone.value}
                    onChange={(e) => handleUpdateMilestone(index, 'value', parseFloat(e.target.value))}
                    placeholder="0"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteMilestone(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}

          <Button onClick={handleAddMilestone} variant="outline" className="w-full">
            Add Milestone
          </Button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Milestones
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
