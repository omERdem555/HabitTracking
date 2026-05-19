import { useEffect, useRef } from 'react';
import type { AppState, Habit } from '../types';
import { localDateString } from '../lib/date';
import { buildReminderMessage } from '../lib/notificationMessages';

type Params = {
  enabled: boolean;
  settings: AppState['notificationSettings'];
  habits: Habit[];
  completions: { habitId: string; date: string }[];
  language: string;
  isStandalone: boolean;
};

const META_KEY = 'habit-tracker-meta';

const readMeta = () => {
  try {
    const raw = localStorage.getItem(META_KEY);
    return raw ? JSON.parse(raw) : { lastNotified: 0 };
  } catch {
    return { lastNotified: 0 };
  }
};

const writeMeta = (meta: { lastNotified: number }) => {
  try {
    localStorage.setItem(META_KEY, JSON.stringify(meta));
  } catch {}
};

export default function useNotifications({
  enabled,
  settings,
  habits,
  completions,
  language,
  isStandalone,
}: Params) {
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;
    if (!isStandalone) return;
    if (!('Notification' in window)) return;

    const getMissingToday = () => {
      const today = localDateString();

      const doneSet = new Set(
        completions
          .filter(c => c.date.slice(0, 10) === today)
          .map(c => c.habitId)
      );

      return habits.filter(h => h.active && !doneSet.has(h.id));
    };

    const getMissedYesterday = () => {
      const y = new Date();
      y.setDate(y.getDate() - 1);
      const yd = y.toISOString().slice(0, 10);

      const doneSet = new Set(
        completions
          .filter(c => c.date.slice(0, 10) === yd)
          .map(c => c.habitId)
      );

      return habits.filter(h => h.active && !doneSet.has(h.id));
    };

    const tick = async () => {
      if (Notification.permission !== 'granted') return;

      const hour = new Date().getHours();
      if (hour < settings.startHour || hour > settings.endHour) return;

      const meta = readMeta();
      const now = Date.now();

      const interval = settings.intervalHours * 60 * 60 * 1000;
      if (now - meta.lastNotified < interval) return;

      const missing = getMissingToday();
      if (missing.length === 0) return;

      const missedYesterday = getMissedYesterday();

      const title = language === 'tr' ? 'Hatırlatma' : 'Reminder';

      const body = buildReminderMessage(language, missing, missedYesterday);

      try {
        const reg = await navigator.serviceWorker.getRegistration();

        if (reg?.showNotification) {
          reg.showNotification(title, {
            body,
            icon: '/icon512.png',
            data: {
              type: 'reminder',
              habitIds: missing.map(h => h.id),
            },
          });
        } else {
          new Notification(title, { body });
        }

        writeMeta({ lastNotified: now });
      } catch {}
    };

    intervalRef.current = window.setInterval(tick, 15 * 60 * 1000);
    tick();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [enabled, settings, habits, completions, language, isStandalone]);
}