export type GoalType = 'numeric' | 'adherence' | 'frequency' | 'duration';

export interface Goal {
  id: string;
  name: string;
  description?: string;
  type: GoalType;
  createdAt: string;
  config: NumericConfig | AdherenceConfig | FrequencyConfig | DurationConfig;
  milestones: Milestone[];
}

export interface Milestone {
  id: string;
  value: number;
  label: string;
  achieved?: boolean;
  achievedDate?: string;
}

export interface NumericConfig {
  type: 'numeric';
  unit: string;
  target?: number;
  startValue?: number;
  direction: 'increase' | 'decrease';
  targetRate?: number; // Change per week (e.g., -2 for losing 2 lbs/week)
}

export interface AdherenceConfig {
  type: 'adherence';
  targetDaysPerWeek?: number;
}

export interface FrequencyConfig {
  type: 'frequency';
  targetCount: number;
  timeframe: 'daily' | 'weekly' | 'monthly';
}

export interface DurationConfig {
  type: 'duration';
  unit: 'minutes' | 'hours';
  targetDuration: number;
  timeframe: 'daily' | 'weekly';
}

export interface Entry {
  id: string;
  goalId: string;
  date: string;
  timestamp: string;
  value: number | boolean;
  note?: string;
}

export interface GoalsData {
  goals: Goal[];
}

export interface EntriesData {
  entries: Entry[];
}
