import { promises as fs } from 'fs';
import path from 'path';
import { Goal, Entry, GoalsData, EntriesData, Todo, TodosData, Tag, TagsData } from './types';

const DATA_DIR = path.join(process.cwd(), 'data');
const GOALS_FILE = path.join(DATA_DIR, 'goals.json');
const ENTRIES_FILE = path.join(DATA_DIR, 'entries.json');
const TODOS_FILE = path.join(DATA_DIR, 'todos.json');
const TAGS_FILE = path.join(DATA_DIR, 'tags.json');

async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

async function ensureFile(filePath: string, defaultContent: string) {
  try {
    await fs.access(filePath);
  } catch {
    await fs.writeFile(filePath, defaultContent, 'utf-8');
  }
}

export async function getGoals(): Promise<Goal[]> {
  await ensureDataDir();
  await ensureFile(GOALS_FILE, JSON.stringify({ goals: [] }, null, 2));
  const data = await fs.readFile(GOALS_FILE, 'utf-8');
  const parsed: GoalsData = JSON.parse(data);
  return parsed.goals;
}

export async function saveGoals(goals: Goal[]): Promise<void> {
  await ensureDataDir();
  const data: GoalsData = { goals };
  await fs.writeFile(GOALS_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export async function getEntries(): Promise<Entry[]> {
  await ensureDataDir();
  await ensureFile(ENTRIES_FILE, JSON.stringify({ entries: [] }, null, 2));
  const data = await fs.readFile(ENTRIES_FILE, 'utf-8');
  const parsed: EntriesData = JSON.parse(data);
  return parsed.entries;
}

export async function saveEntries(entries: Entry[]): Promise<void> {
  await ensureDataDir();
  const data: EntriesData = { entries };
  await fs.writeFile(ENTRIES_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export async function getTodos(): Promise<Todo[]> {
  await ensureDataDir();
  await ensureFile(TODOS_FILE, JSON.stringify({ todos: [] }, null, 2));
  const data = await fs.readFile(TODOS_FILE, 'utf-8');
  const parsed: TodosData = JSON.parse(data);
  return parsed.todos;
}

export async function saveTodos(todos: Todo[]): Promise<void> {
  await ensureDataDir();
  const data: TodosData = { todos };
  await fs.writeFile(TODOS_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export async function getTags(): Promise<Tag[]> {
  await ensureDataDir();
  await ensureFile(TAGS_FILE, JSON.stringify({ tags: [] }, null, 2));
  const data = await fs.readFile(TAGS_FILE, 'utf-8');
  const parsed: TagsData = JSON.parse(data);
  return parsed.tags;
}

export async function saveTags(tags: Tag[]): Promise<void> {
  await ensureDataDir();
  const data: TagsData = { tags };
  await fs.writeFile(TAGS_FILE, JSON.stringify(data, null, 2), 'utf-8');
}
