'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
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
import { Entry, Goal } from '@/lib/types';

interface AddEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: Goal | null;
  onSave: (entry: Entry) => void;
  existingEntry?: Entry;
  initialDate?: string;
}

export function AddEntryDialog({ open, onOpenChange, goal, onSave, existingEntry, initialDate }: AddEntryDialogProps) {
  const defaultDate = useMemo(() => new Date().toISOString().split('T')[0], []);
  
  const [date, setDate] = useState(() => existingEntry?.date || initialDate || defaultDate);
  const [value, setValue] = useState(() => 
    existingEntry && typeof existingEntry.value !== 'boolean' 
      ? existingEntry.value.toString() 
      : ''
  );
  const [boolValue, setBoolValue] = useState(() => 
    existingEntry && typeof existingEntry.value === 'boolean'
      ? (existingEntry.value ? 'true' : 'false')
      : 'true'
  );
  const [note, setNote] = useState(() => existingEntry?.note || '');

  useEffect(() => {
    if (open) {
      if (existingEntry) {
        setDate(existingEntry.date);
        if (typeof existingEntry.value === 'boolean') {
          setBoolValue(existingEntry.value ? 'true' : 'false');
        } else {
          setValue(existingEntry.value.toString());
        }
        setNote(existingEntry.note || '');
      } else {
        setDate(initialDate || defaultDate);
        setValue('');
        setBoolValue('true');
        setNote('');
      }
    }
  }, [open, existingEntry, initialDate, defaultDate]);

  const resetForm = useCallback(() => {
    setDate(new Date().toISOString().split('T')[0]);
    setValue('');
    setBoolValue('true');
    setNote('');
  }, []);

  const handleSave = useCallback(() => {
    if (!goal) return;

    let finalValue: number | boolean;
    
    if (goal.type === 'adherence') {
      finalValue = boolValue === 'true';
    } else {
      finalValue = parseFloat(value);
    }

    const now = Date.now();
    const entry: Entry = {
      id: existingEntry?.id || now.toString(),
      goalId: goal.id,
      date,
      timestamp: existingEntry?.timestamp || new Date(now).toISOString(),
      value: finalValue,
      note: note || undefined,
    };

    onSave(entry);
    resetForm();
    onOpenChange(false);
  }, [goal, date, value, boolValue, note, existingEntry, onSave, onOpenChange, resetForm]);

  if (!goal) return null;

  const getValueLabel = () => {
    if (goal.type === 'numeric') {
      const config = goal.config as { unit: string };
      return `Value (${config.unit})`;
    }
    if (goal.type === 'frequency') {
      return 'Count';
    }
    if (goal.type === 'duration') {
      const config = goal.config as { unit: string };
      return `Duration (${config.unit})`;
    }
    return 'Value';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {existingEntry ? 'Edit Entry' : 'Add Entry'} - {goal.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {goal.type === 'adherence' ? (
            <div className="space-y-2">
              <Label htmlFor="boolValue">Completed?</Label>
              <Select value={boolValue} onValueChange={setBoolValue}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="value">{getValueLabel()}</Label>
              <Input
                id="value"
                type="number"
                step="0.1"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Enter value"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="note">Note (Optional)</Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={goal.type !== 'adherence' && !value}
          >
            {existingEntry ? 'Update' : 'Add'} Entry
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
