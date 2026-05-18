export interface Habit {
  id: string;
  name: string;
  color: string;
  active: boolean;
  createdAt: string;
  archivedAt?: string;
}

export interface Completion {
  id: string;
  habitId: string;
  date: string;
  hours?: number;
  note?: string;
}

export interface NotificationSettings {
  enabled: boolean;
  intervalHours: 1 | 2 | 3 | 4 | 6 | 8 | 12;
  startHour: number;
  endHour: number;
}

export interface AppState {
  schemaVersion: number;
  habits: Habit[];
  completions: Completion[];
  notificationSettings: NotificationSettings;
}

export type Action =
  | { type: 'load'; payload: AppState }
  | { type: 'addHabit'; payload: { name: string; color: string } }
  | { type: 'editHabit'; payload: { id: string; name: string } }
  | { type: 'toggleHabitActive'; payload: { id: string } }
  | { type: 'addCompletion'; payload: { habitId: string; date: string; hours?: number; note?: string } }
  | { type: 'removeCompletion'; payload: { completionId: string } }
  | { type: 'updateNotificationSettings'; payload: NotificationSettings }