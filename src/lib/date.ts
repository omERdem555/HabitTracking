export const localDateString = (date = new Date()): string => {
  const offset = date.getTimezoneOffset() * 60000;

  return new Date(date.getTime() - offset)
    .toISOString()
    .slice(0, 10);
};

export const normalizeDate = (value: string): string => {
  const [year, month, day] = value.split('-').map(Number);

  return `${year.toString().padStart(4, '0')}-${month
    .toString()
    .padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
};

export const getPreviousDate = (dateString: string): string => {
  const date = new Date(`${dateString}T00:00:00`);

  date.setDate(date.getDate() - 1);

  return localDateString(date);
};

export const getYearDays = (year: number) => {
  const days: string[] = [];

  const start = new Date(`${year}-01-01T00:00:00`);
  const end = new Date(`${year}-12-31T00:00:00`);

  for (
    let current = new Date(start);
    current <= end;
    current.setDate(current.getDate() + 1)
  ) {
    days.push(normalizeDate(current.toISOString().slice(0, 10)));
  }

  return days;
};