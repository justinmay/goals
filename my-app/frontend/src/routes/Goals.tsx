import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";

import { api } from "@/lib/api";
import type { Entry, Goal } from "@/lib/types";
import { GoalCard } from "@/components/goal-card";
import { AddGoalDialog } from "@/components/add-goal-dialog";
import { AddEntryDialog } from "@/components/add-entry-dialog";
import { Button } from "@/components/ui/button";

export function GoalsRoute() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [addGoalOpen, setAddGoalOpen] = useState(false);
  const [addEntryOpen, setAddEntryOpen] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    void loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [goalsData, entriesData] = await Promise.all([
        api.listGoals(),
        api.listEntries(),
      ]);
      setGoals(goalsData);
      setEntries(entriesData);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGoal = async (goal: Goal) => {
    await api.createGoal(goal);
    await loadData();
  };

  const handleSaveEntry = async (entry: Entry) => {
    await api.createEntry(entry);
    await loadData();
  };

  const handleAddEntry = (goalId: string) => {
    setSelectedGoalId(goalId);
    setAddEntryOpen(true);
  };

  const selectedGoal = selectedGoalId ? goals.find((g) => g.id === selectedGoalId) ?? null : null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Goals</h1>
            <p className="text-muted-foreground mt-2">Manage and track all your goals</p>
          </div>
          <Button onClick={() => setAddGoalOpen(true)} size="lg">
            <Plus className="h-5 w-5 mr-2" />
            New Goal
          </Button>
        </div>

        {goals.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg mb-4">
              No goals yet. Create your first goal to get started!
            </p>
            <Button onClick={() => setAddGoalOpen(true)}>
              <Plus className="h-5 w-5 mr-2" />
              Create Goal
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                entries={entries}
                onAddEntry={handleAddEntry}
                onClick={(id) => navigate(`/goals/${id}`)}
              />
            ))}
          </div>
        )}

        <AddGoalDialog open={addGoalOpen} onOpenChange={setAddGoalOpen} onSave={handleSaveGoal} />

        <AddEntryDialog
          open={addEntryOpen}
          onOpenChange={setAddEntryOpen}
          goal={selectedGoal}
          onSave={handleSaveEntry}
        />
      </div>
    </div>
  );
}
