import { promises as fs } from 'fs';
import path from 'path';
import { Goal, Entry, GoalsData, EntriesData } from './types';

const DATA_DIR = path.join(process.cwd(), 'data');
const GOALS_FILE = path.join(DATA_DIR, 'goals.json');
const ENTRIES_FILE = path.join(DATA_DIR, 'entries.json');

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
