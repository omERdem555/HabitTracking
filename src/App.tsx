import { useEffect, useMemo, useReducer, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { loadState, saveState, defaultState } from './lib/storage';
import type { Action, AppState, Habit, Completion } from './types';

const HABIT_COLOR = '#60a5fa';

const localDateString = (date = new Date()): string => {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
};

const normalizeDate = (value: string): string => {
  const [year, month, day] = value.split('-').map(Number);
  return `${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
};

const normalizeCompletions = (completions: Completion[]) => {
  return completions.map((c) => ({
    ...c,
    date: normalizeDate(c.date),
  }));
};

const reducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'load':
      return action.payload;

    case 'addHabit': {
      const id =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random()}`;

      return {
        ...state,
        habits: [
          {
            id,
            name: action.payload.name.trim(),
            color: action.payload.color,
            active: true,
            createdAt: localDateString(),
          },
          ...state.habits,
        ],
      };
    }

    case 'editHabit':
      return {
        ...state,
        habits: state.habits.map((h) =>
          h.id === action.payload.id ? { ...h, name: action.payload.name.trim() } : h
        ),
      };

    case 'toggleHabitActive':
      return {
        ...state,
        habits: state.habits.map((h) =>
          h.id === action.payload.id
            ? {
                ...h,
                active: !h.active,
                archivedAt: h.active ? localDateString() : undefined,
              }
            : h
        ),
      };

    case 'addCompletion': {
      const date = normalizeDate(action.payload.date);
      const id =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random()}`;

      return {
        ...state,
        completions: [
          ...state.completions,
          {
            id,
            habitId: action.payload.habitId,
            date,
            hours: action.payload.hours,
            note: action.payload.note,
          },
        ],
      };
    }

    case 'removeCompletion':
      return {
        ...state,
        completions: state.completions.filter(
          (c) => c.id !== action.payload.completionId
        ),
      };

    case 'updateNotificationSettings':
      return {
        ...state,
        notificationSettings: action.payload,
      };

    default:
      return state;
  }
};

const getPreviousDate = (dateString: string): string => {
  const d = new Date(`${dateString}T00:00:00`);
  d.setDate(d.getDate() - 1);
  return localDateString(d);
};

const getStreak = (habitId: string, completionSet: Set<string>) => {
  let streak = 0;
  let cursor = localDateString();

  while (completionSet.has(`${habitId}|${cursor}`)) {
    streak++;
    cursor = getPreviousDate(cursor);
  }

  return streak;
};

function App() {
  const { t, i18n } = useTranslation();
  const [state, dispatch] = useReducer(reducer, defaultState);

  const didInitRef = useRef(false);
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true;

  useEffect(() => {
    dispatch({ type: 'load', payload: loadState() });
  }, []);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const today = localDateString();

  const completionSet = useMemo(() => {
    return new Set(
      normalizeCompletions(state.completions).map(
        (c) => `${c.habitId}|${c.date}`
      )
    );
  }, [state.completions]);

  const activeHabits = useMemo(
    () => state.habits.filter((h) => h.active),
    [state.habits]
  );

  const totalCompletedToday = useMemo(
    () =>
      activeHabits.filter((h) =>
        completionSet.has(`${h.id}|${today}`)
      ).length,
    [activeHabits, completionSet, today]
  );

  // 🔥 NOTIFICATION FIXED EFFECT
  useEffect(() => {
    if (!state.notificationSettings.enabled) return;
    if (typeof Notification === 'undefined') return;
    if (!isStandalone) return;

    if (!didInitRef.current) {
      didInitRef.current = true;
      return;
    }

    const tick = () => {
      if (Notification.permission !== 'granted') return;

      const now = Date.now();
      const metaRaw = localStorage.getItem('habit-tracker-meta');
      const meta = metaRaw ? JSON.parse(metaRaw) : { lastNotified: 0 };

      const interval =
        state.notificationSettings.intervalHours * 60 * 60 * 1000;

      if (now - meta.lastNotified < interval) return;

      const missing = activeHabits.filter(
        (h) => !completionSet.has(`${h.id}|${today}`)
      );

      if (!missing.length) return;

      new Notification('Reminder', {
        body: missing.slice(0, 3).map((m) => m.name).join(', '),
      });

      localStorage.setItem(
        'habit-tracker-meta',
        JSON.stringify({ lastNotified: now })
      );
    };

    const id = window.setInterval(tick, 15 * 60 * 1000);
    return () => window.clearInterval(id);
  }, [state.notificationSettings, state.completions, state.habits]);

  return (
    <div className="app-shell">
      <h1>{t('title')}</h1>
      <p>{totalCompletedToday}</p>
    </div>
  );
}

export default App;