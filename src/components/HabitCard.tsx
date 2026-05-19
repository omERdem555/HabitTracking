import type { Dispatch, SetStateAction } from 'react';

import type {
  Action,
  Completion,
  Habit,
} from '../types';

type HabitStatsItem = {
  habitId: string;
  monthlyHours: number;
  weeklyHours: number;
};

type HabitCardProps = {
  habit: Habit;

  completions: Completion[];

  completionSet: Set<string>;

  today: string;

  streak: number;

  stats: {
    habitStats: HabitStatsItem[];
  };

  t: (key: string) => string;

  handleMarkToday: (habit: Habit) => void;

  handleOpenUndo: (habit: Habit) => void;

  setEditingId: Dispatch<
    SetStateAction<string | null>
  >;

  setEditingName: Dispatch<
    SetStateAction<string>
  >;

  dispatch: Dispatch<Action>;
};

export default function HabitCard({
  habit,
  completions,
  completionSet,
  today,
  streak,
  stats,
  t,
  handleMarkToday,
  handleOpenUndo,
  setEditingId,
  setEditingName,
  dispatch,
}: HabitCardProps) {
  const completedToday = completionSet.has(
    `${habit.id}|${today}`,
  );

  const total = completions.filter(
    (item) => item.habitId === habit.id,
  ).length;

  const lastCompletion =
    completions
      .filter((item) => item.habitId === habit.id)
      .map((item) => item.date)
      .sort()
      .pop() ?? '—';

  const monthlyHours =
    stats.habitStats.find(
      (s) => s.habitId === habit.id,
    )?.monthlyHours || 0;

  const weeklyHours =
    stats.habitStats.find(
      (s) => s.habitId === habit.id,
    )?.weeklyHours || 0;

  return (
    <div className="habit-row">
      <div className="habit-details">
        <div className="habit-label">
          <span
            className="habit-color"
            style={{
              background: habit.color,
            }}
          />

          <strong>{habit.name}</strong>

          {!habit.active && (
            <span style={{ opacity: 0.6 }}>
              {t('archived')}
            </span>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <span style={{ opacity: 0.8 }}>
            {t('streak')}: {streak}
          </span>

          <span style={{ opacity: 0.8 }}>
            {t('total')}: {total}
          </span>

          <span style={{ opacity: 0.8 }}>
            {t('last')}: {lastCompletion}
          </span>

          <span style={{ opacity: 0.8 }}>
            {t('month')}: {monthlyHours}h
          </span>

          <span style={{ opacity: 0.8 }}>
            {t('week')}: {weeklyHours}h
          </span>
        </div>
      </div>

      <div className="habit-actions">
        <button
          type="button"
          className={`marker-button ${
            completedToday
              ? 'completed'
              : ''
          } ${
            !habit.active ? 'inactive' : ''
          }`}
          disabled={!habit.active}
          onClick={() =>
            handleMarkToday(habit)
          }
        >
          {t('mark')}
        </button>

        <button
          type="button"
          className={`marker-button ${
            !completedToday
              ? 'inactive'
              : ''
          }`}
          disabled={
            !habit.active || !completedToday
          }
          onClick={() =>
            handleOpenUndo(habit)
          }
        >
          {t('undo')}
        </button>

        <button
          type="button"
          onClick={() => {
            setEditingId(habit.id);
            setEditingName(habit.name);
          }}
        >
          {t('rename')}
        </button>

        <button
          type="button"
          onClick={() =>
            dispatch({
              type: 'toggleHabitActive',
              payload: {
                id: habit.id,
              },
            })
          }
        >
          {habit.active
            ? t('archive')
            : t('activate')}
        </button>
      </div>
    </div>
  );
}