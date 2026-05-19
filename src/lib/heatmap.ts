import type { Completion, Habit } from '../types';

import { getYearDays } from './date';

export const getDayBackground = (
  count: number,
  total: number,
) => {
  if (count === 0)
    return 'rgba(226, 232, 255, 0.18)';

  const progress = Math.min(
    count / Math.max(total, 1),
    1,
  );

  const alpha = 0.25 + progress * 0.55;

  return `rgba(96, 165, 250, ${alpha.toFixed(2)})`;
};

export const buildYearSummaries = (
  years: number[],
  completionMap: Record<string, Completion[]>,
  habitsById: Record<string, Habit | undefined>,
  activeHabitCount: number,
) => {
  return years.map((year) => {
    const days = getYearDays(year);

    return {
      year,

      days: days.map((day) => {
        const dayCompletions =
          completionMap[day] ?? [];

        const uniqueHabitIds = Array.from(
          new Set(
            dayCompletions.map((item) => item.habitId),
          ),
        );

        const activeCompletedCount = new Set(
          dayCompletions
            .filter(
              (item) =>
                habitsById[item.habitId]?.active,
            )
            .map((item) => item.habitId),
        ).size;

        const allComplete =
          activeHabitCount > 0 &&
          activeCompletedCount >= activeHabitCount;

        return {
          day,
          count: uniqueHabitIds.length,
          allComplete,
        };
      }),
    };
  });
};