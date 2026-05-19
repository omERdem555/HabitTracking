import type { AppState, Completion } from '../types';

const STORAGE_KEY = 'habit-tracker-v1';
const CURRENT_SCHEMA = 1;

export const defaultState: AppState = {
  schemaVersion: CURRENT_SCHEMA,
  habits: [],
  completions: [],
  notificationSettings: {
    
    enabled: false,
    intervalHours: 3,
    startHour: 9,
    endHour: 21,
},
};

const normalizeDate = (value: string): string => {
  const [year, month, day] = value.split('-').map(Number);
  return `${year.toString().padStart(4, '0')}-${month
    .toString()
    .padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
};

const normalizeCompletions = (completions: unknown[]): Completion[] => {
  const result: Completion[] = [];
  let legacyIndex = 0;

  completions.forEach((item) => {
    // 🔒 Type guard
    if (typeof item !== 'object' || item === null) return;

    const completion = item as Partial<Completion>;

    if (typeof completion.habitId !== 'string') return;
    if (typeof completion.date !== 'string') return;

    const date = normalizeDate(completion.date);
    const id =
      typeof completion.id === 'string' && completion.id.trim().length > 0
        ? completion.id
        : `legacy-${completion.habitId}-${date}-${legacyIndex++}`;

    result.push({
      id,
      habitId: completion.habitId,
      date,
      hours:
        typeof completion.hours === 'number' && !Number.isNaN(completion.hours)
          ? completion.hours
          : undefined,
      note:
        typeof completion.note === 'string' && completion.note.trim().length > 0
          ? completion.note
          : undefined,
    });
  });

  return result;
};

export function loadState(): AppState {
  if (typeof window === 'undefined') {
    return defaultState;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;

    const parsed = JSON.parse(raw) as AppState;

    // 🔒 Schema kontrolü
    if (!parsed || parsed.schemaVersion !== CURRENT_SCHEMA) {
      return {
        ...defaultState,
        habits: parsed?.habits ?? [],
        completions: [],
      };
    }

    return {
      schemaVersion: CURRENT_SCHEMA,
      habits: Array.isArray(parsed.habits) ? parsed.habits : [],
      completions: Array.isArray(parsed.completions)
        ? normalizeCompletions(parsed.completions)
        : [],
      notificationSettings: parsed.notificationSettings ?? defaultState.notificationSettings,
    };
  } catch {
    return defaultState;
  }
}

export function saveState(state: AppState): void {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // silent fail (quota vs.)
  }
}
