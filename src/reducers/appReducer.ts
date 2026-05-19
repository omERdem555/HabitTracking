import type { Action, AppState, Habit, Completion } from '../types';


const localDateString = (date = new Date()): string => {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
};



const normalizeDate = (value: string): string => {
  const [year, month, day] = value.split('-').map(Number);
  return `${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
};




const reducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'load':
      return action.payload;

    case 'addHabit': {
      const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
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
        habits: state.habits.map((habit) =>
          habit.id === action.payload.id ? { ...habit, name: action.payload.name.trim() } : habit,
        ),
      };

    case 'toggleHabitActive':
      return {
        ...state,
        habits: state.habits.map((habit) =>
          habit.id === action.payload.id
            ? {
                ...habit,
                active: !habit.active,
                archivedAt: habit.active ? localDateString() : undefined,
              }
            : habit,
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
          (completion) => completion.id !== action.payload.completionId,
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

export default reducer;