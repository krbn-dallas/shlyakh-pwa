import { getSpace } from './diary';

/**
 * Web push. On iOS this only works from an installed PWA (16.4+), which the
 * install gate already enforces — so by the time this runs, the app is on the
 * home screen and the subscription will stick.
 */
const PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined;

export const pushSupported = () =>
  'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;

export const pushConfigured = () => Boolean(PUBLIC_KEY);

export const pushPermission = (): NotificationPermission =>
  pushSupported() ? Notification.permission : 'denied';

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padded = (base64 + '='.repeat((4 - (base64.length % 4)) % 4))
    .replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(padded);
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

export interface PushPrefs {
  lang: string;
  city?: string;
  departure?: string | null;
  ret?: string | null;
  morningHour?: number;
  eveningHour?: number;
}

export async function subscribePush(prefs: PushPrefs): Promise<boolean> {
  if (!pushSupported() || !PUBLIC_KEY) return false;

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return false;

  const reg = await navigator.serviceWorker.ready;
  const existing = await reg.pushManager.getSubscription();
  const sub = existing ?? (await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(PUBLIC_KEY) as BufferSource,
  }));

  const res = await fetch(`/api/push/subscribe?space=${getSpace()}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      ...sub.toJSON(),
      tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
      ...prefs,
    }),
  });
  return res.ok;
}

export async function unsubscribePush(): Promise<void> {
  if (!pushSupported()) return;
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  if (!sub) return;
  await fetch(`/api/push/subscribe?space=${getSpace()}`, {
    method: 'DELETE',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ endpoint: sub.endpoint }),
  }).catch(() => { /* the local unsubscribe below still matters */ });
  await sub.unsubscribe();
}

export async function isPushSubscribed(): Promise<boolean> {
  if (!pushSupported()) return false;
  const reg = await navigator.serviceWorker.getRegistration();
  return Boolean(await reg?.pushManager.getSubscription());
}
