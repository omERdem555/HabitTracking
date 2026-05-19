import type { Habit } from '../types';

export const buildReminderMessage = (
  language: string,
  missing: Habit[],
  missedYesterday: Habit[]
) => {
  const names = (arr: Habit[]) =>
    arr.slice(0, 3).map(h => h.name).join(', ');

  // YESTERDAY PRIORITY
  if (missedYesterday.length > 0) {
    return language === 'tr'
      ? `Dün dünde kaldı. Bugün yeniden başla: ${names(missedYesterday)}`
      : `Yesterday is gone. Restart today: ${names(missedYesterday)}`;
  }

  // TODAY MISSING
  return language === 'tr'
    ? `Bugün şunları tamamlamak ister misin: ${names(missing)}`
    : `Do you want to complete: ${names(missing)}?`;
};