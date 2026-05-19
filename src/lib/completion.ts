import type { Completion } from '../types';
import { normalizeDate } from './date';

export const normalizeCompletions = (
  completions: Completion[],
): Completion[] => {
  return completions.map((completion) => ({
    ...completion,
    date: normalizeDate(completion.date),
  }));
};

export const groupByDate = (completions: Completion[]) => {
  return completions.reduce<Record<string, Completion[]>>(
    (acc, completion) => {
      const date = completion.date;

      acc[date] = acc[date]
        ? [...acc[date], completion]
        : [completion];

      return acc;
    },
    {},
  );
};