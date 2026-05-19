import { useEffect, useRef } from 'react';
import type { AppState, Habit, Completion } from '../types';
import { localDateString } from '../lib/date';

type NotificationSettings = AppState['notificationSettings'];

type Params = {
  enabled: boolean;
  settings: NotificationSettings;
  habits: Habit[];
  completions: Completion[];
  language: string;
  isStandalone: boolean;
  dispatch: React.Dispatch<any>;
};

const META_KEY = 'habit-tracker-meta';

const readMeta = () => {
  try {
    const raw = localStorage.getItem(META_KEY);
    if (!raw) return { lastNotified: 0 };
    return JSON.parse(raw) as { lastNotified: number };
  } catch {
    return { lastNotified: 0 };
  }
};

const writeMeta = (meta: { lastNotified: number }) => {
  try {
    localStorage.setItem(META_KEY, JSON.stringify(meta));
  } catch {}
};

const normalizeDate = (value: string) => value.slice(0, 10);

const getPreviousDate = (dateString: string) => {
  const date = new Date(`${dateString}T00:00:00`);
  date.setDate(date.getDate() - 1);
  return date.toISOString().slice(0, 10);
};

const isWithinWindow = (settings: NotificationSettings) => {
  const hour = new Date().getHours();
  return settings.startHour <= hour && hour <= settings.endHour;
};

const ensurePermission = async () => {
  if (!('Notification' in window)) return false;

  if (Notification.permission === 'granted') return true;

  if (Notification.permission === 'denied') return false;

  const result = await Notification.requestPermission();
  return result === 'granted';
};

export default function useNotifications({
  enabled,
  settings,
  habits,
  completions,
  language,
  isStandalone,
  dispatch,
}: Params) {
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;
    if (!isStandalone) return;
    if (!('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;

    const getMissingToday = () => {
      const today = localDateString();
      const set = new Set(
        completions.map(c => `${c.habitId}|${normalizeDate(c.date)}`)
      );

      return habits.filter(
        h => h.active && !set.has(`${h.id}|${today}`)
      );
    };

    const getMissedYesterday = () => {
      const today = localDateString();
      const yesterday = getPreviousDate(today);
      const beforeYesterday = getPreviousDate(yesterday);

      return habits.filter(h => {
        if (!h.active) return false;

        const hadYesterday = completions.some(
          c =>
            c.habitId === h.id &&
            normalizeDate(c.date) === yesterday
        );

        const hadBefore = completions.some(
          c =>
            c.habitId === h.id &&
            normalizeDate(c.date) === beforeYesterday
        );

        return !hadYesterday && hadBefore;
      });
    };

    const tick = async () => {
      const ok = await ensurePermission();
      if (!ok) return;

      if (!isWithinWindow(settings)) return;

      const meta = readMeta();
      const now = Date.now();

      const minInterval =
        settings.intervalHours * 60 * 60 * 1000;

      if (now - meta.lastNotified < minInterval) return;

      const missing = getMissingToday();
      if (missing.length === 0) return;

      const missedYesterday = getMissedYesterday();

      const title =
        language === 'tr' ? 'Hatırlatma' : 'Reminder';

      const body =
        missedYesterday.length > 0
          ? language === 'tr'
            ? `Dün kaçırılan: ${missedYesterday
                .slice(0, 3)
                .map(h => h.name)
                .join(', ')}`
            : `Missed yesterday: ${missedYesterday
                .slice(0, 3)
                .map(h => h.name)
                .join(', ')}`
          : language === 'tr'
          ? `Bugün eksik: ${missing
              .slice(0, 3)
              .map(h => h.name)
              .join(', ')}`
          : `Missing today: ${missing
              .slice(0, 3)
              .map(h => h.name)
              .join(', ')}`;

      try {
        const registration =
          await navigator.serviceWorker.getRegistration();

        if (registration?.showNotification) {
          registration.showNotification(title, {
            body,
            data: {
              type: 'reminder',
              habitIds: missing.map(h => h.id),
            },
            icon: '/icon512.png',
          });
        } else {
          new Notification(title, { body });
        }

        writeMeta({ lastNotified: now });
      } catch {
        // silent
      }
    };

    intervalRef.current = window.setInterval(
      tick,
      15 * 60 * 1000
    );

    tick();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [
    enabled,
    settings,
    habits,
    completions,
    language,
    isStandalone,
  ]);

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      const msg = event.data;
      if (!msg || msg.type !== 'notificationAction') return;

      const { action, data } = msg;

      if (
        action === 'complete' &&
        Array.isArray(data?.habitIds)
      ) {
        const today = localDateString();

        data.habitIds.forEach((habitId: string) => {
          dispatch({
            type: 'addCompletion',
            payload: { habitId, date: today },
          });
        });
      }
    };

    navigator.serviceWorker?.addEventListener(
      'message',
      handler as any
    );

    return () => {
      navigator.serviceWorker?.removeEventListener(
        'message',
        handler as any
      );
    };
  }, [dispatch]);
}