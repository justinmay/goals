import type { Entry, Goal, GoalType, Tag, Todo } from "@/lib/types";
import * as AppService from "../../bindings/github.com/justinmay/my-app/internal/service/appservice.js";
import {
  Goal as BindingGoal,
  GoalType as BindingGoalType,
} from "../../bindings/github.com/justinmay/my-app/internal/models/models.js";

const toBindingGoalType = (type: GoalType): BindingGoalType => {
  switch (type) {
    case "numeric":
      return BindingGoalType.GoalTypeNumeric;
    case "adherence":
      return BindingGoalType.GoalTypeAdherence;
    case "frequency":
      return BindingGoalType.GoalTypeFrequency;
    case "duration":
      return BindingGoalType.GoalTypeDuration;
    default:
      return BindingGoalType.$zero;
  }
};

const toBindingGoal = (goal: Goal): BindingGoal =>
  new BindingGoal({
    ...goal,
    type: toBindingGoalType(goal.type),
  });

const clone = <T>(value: any): T => {
  if (value === undefined || value === null) {
    return value as T;
  }
  if (typeof structuredClone === "function") {
    return structuredClone(value) as T;
  }
  return JSON.parse(JSON.stringify(value)) as T;
};

export const api = {
  listGoals: async (): Promise<Goal[]> => clone(await AppService.ListGoals()),
  getGoal: async (id: string): Promise<Goal | null> => {
    const goal = await AppService.GetGoal(id);
    return goal ? clone(goal) : null;
  },
  createGoal: async (goal: Goal): Promise<Goal> =>
    clone(await AppService.CreateGoal(toBindingGoal(goal))),
  updateGoal: async (goal: Goal): Promise<Goal> =>
    clone(await AppService.UpdateGoal(toBindingGoal(goal))),
  deleteGoal: async (id: string): Promise<void> => AppService.DeleteGoal(id),

  listEntries: async (goalId?: string): Promise<Entry[]> =>
    clone(await AppService.ListEntries(goalId ?? "")),
  getEntry: async (id: string): Promise<Entry | null> => {
    const entry = await AppService.GetEntry(id);
    return entry ? clone(entry) : null;
  },
  createEntry: async (entry: Entry): Promise<Entry> => clone(await AppService.CreateEntry(entry)),
  updateEntry: async (entry: Entry): Promise<Entry> => clone(await AppService.UpdateEntry(entry)),
  deleteEntry: async (id: string): Promise<void> => AppService.DeleteEntry(id),

  listTodos: async (): Promise<Todo[]> => clone(await AppService.ListTodos()),
  createTodo: async (todo: Todo): Promise<Todo> => clone(await AppService.CreateTodo(todo)),
  updateTodo: async (todo: Todo): Promise<Todo> => clone(await AppService.UpdateTodo(todo)),
  deleteTodo: async (id: string): Promise<void> => AppService.DeleteTodo(id),
  reorderTodos: async (orderedIds: string[]): Promise<void> => AppService.ReorderTodos(orderedIds),

  listTags: async (): Promise<Tag[]> => clone(await AppService.ListTags()),
  createTag: async (tag: Tag): Promise<Tag> => clone(await AppService.CreateTag(tag)),
  updateTag: async (tag: Tag): Promise<Tag> => clone(await AppService.UpdateTag(tag)),
  deleteTag: async (id: string): Promise<void> => AppService.DeleteTag(id),
};
