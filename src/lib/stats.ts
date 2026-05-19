import type { Habit, Completion } from '../types';

import {
  getPreviousDate,
  normalizeDate,
} from './date';



export const getStreak = (
  habitId: string,
  completionSet: Set<string>,
) => {
  let streak = 0;

  let cursor = normalizeDate(
    new Date().toISOString().slice(0, 10),
  );

  while (completionSet.has(`${habitId}|${cursor}`)) {
    streak += 1;
    cursor = getPreviousDate(cursor);
  }

  return streak;
};




export const getLongestStreak = (
  habits: Habit[],
  completions: Completion[],
) => {
  return habits.reduce((best, habit) => {
    const items = completions
      .filter((c) => c.habitId === habit.id)
      .map((c) => normalizeDate(c.date));

    const uniqueSet = new Set(items);

    let maxStreak = 0;
    let current = 0;

    const sortedDays = Array.from(uniqueSet).sort();

    for (let i = 0; i < sortedDays.length; i += 1) {
      if (i === 0) {
        current = 1;
      } else {
        const prev = getPreviousDate(sortedDays[i]);

        current =
          sortedDays[i - 1] === prev
            ? current + 1
            : 1;
      }

      maxStreak = Math.max(maxStreak, current);
    }

    return Math.max(best, maxStreak);
  }, 0);
};



export const getTotalCompletions = (
  completions: Completion[],
) => completions.length;




export const getHabitStats = (
  habits: Habit[],
  completions: Completion[],
) => {
  const now = new Date();

  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const currentWeek =
    Math.floor((now.getDate() - now.getDay() + 1) / 7) + 1;

  return habits.map((habit) => {
    const habitCompletions = completions.filter(
      (c) => c.habitId === habit.id,
    );

    const monthlyHours = habitCompletions
      .filter((c) => {
        const date = new Date(c.date);

        return (
          date.getFullYear() === currentYear &&
          date.getMonth() === currentMonth
        );
      })
      .reduce((sum, c) => sum + (c.hours || 0), 0);

    const weeklyHours = habitCompletions
      .filter((c) => {
        const date = new Date(c.date);

        const week =
          Math.floor(
            (date.getDate() - date.getDay() + 1) / 7,
          ) + 1;

        return (
          date.getFullYear() === currentYear &&
          date.getMonth() === currentMonth &&
          week === currentWeek
        );
      })
      .reduce((sum, c) => sum + (c.hours || 0), 0);

    return {
      habitId: habit.id,
      monthlyHours,
      weeklyHours,
    };
  });
};