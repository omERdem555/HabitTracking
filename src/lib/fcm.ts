import { getToken } from 'firebase/messaging';
import { messaging } from './firebase';

export const initFCMForUser = async (userId: string, i18n: any, notificationSettings: any) => {
  if (!('serviceWorker' in navigator)) return;

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return;

  const registration = await navigator.serviceWorker.ready;

  const token = await getToken(messaging, {
    vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
    serviceWorkerRegistration: registration,
  });

  await fetch('YOUR_FUNCTION_URL/registerDevice', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token,
      userId,
      platform: 'web',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: i18n.language,
      notificationSettings,
    }),
  });

  return token;
};