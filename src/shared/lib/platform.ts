/** Everything the install gate needs to know about where it is running. */

export const isStandalone = (): boolean =>
  window.matchMedia('(display-mode: standalone)').matches ||
  window.matchMedia('(display-mode: fullscreen)').matches ||
  window.matchMedia('(display-mode: minimal-ui)').matches ||
  // iOS Safari's own flag — the only reliable signal on older iOS
  (navigator as Navigator & { standalone?: boolean }).standalone === true ||
  document.referrer.startsWith('android-app://');

export const isIOS = (): boolean => {
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return true;
  // iPadOS 13+ reports itself as a Mac; touch points give it away.
  return /Macintosh/.test(ua) && navigator.maxTouchPoints > 1;
};

export const isAndroid = (): boolean => /Android/i.test(navigator.userAgent);

const IN_APP = [
  [/Telegram/i, 'Telegram'],
  [/Instagram/i, 'Instagram'],
  [/FBAN|FBAV|FB_IAB|FBIOS/i, 'Facebook'],
  [/\bLine\//i, 'LINE'],
  [/WhatsApp/i, 'WhatsApp'],
  [/musical_ly|BytedanceWebview|TikTok/i, 'TikTok'],
  [/Snapchat/i, 'Snapchat'],
  [/\bViber/i, 'Viber'],
  [/GSA\//i, 'Google App'],
] as const;

/** Returns the app name when inside an embedded webview, otherwise null. */
export const inAppBrowser = (): string | null => {
  const w = window as unknown as Record<string, unknown>;
  if (w.TelegramWebviewProxy || (w.Telegram as { WebApp?: unknown })?.WebApp) return 'Telegram';
  const ua = navigator.userAgent;
  for (const [re, name] of IN_APP) if (re.test(ua)) return name;
  return null;
};

/** Escape hatch, so a misfiring gate can never lock you out of your own app. */
const BYPASS_KEY = 'shlyakh.bypassGate';
export const hasBypass = (): boolean => {
  if (new URLSearchParams(location.search).get('browser') === '1') {
    sessionStorage.setItem(BYPASS_KEY, '1');
  }
  return sessionStorage.getItem(BYPASS_KEY) === '1';
};
export const setBypass = () => sessionStorage.setItem(BYPASS_KEY, '1');

export type GateMode = 'ok' | 'ios-install' | 'in-app' | 'android-banner';

export function gateMode(): GateMode {
  if (isStandalone() || hasBypass()) return 'ok';
  const app = inAppBrowser();
  // Desktop browsers, and any in-app browser on desktop, pass through untouched.
  const mobile = isIOS() || isAndroid();
  if (!mobile) return 'ok';
  if (app) return 'in-app';
  if (isIOS()) return 'ios-install';
  return 'android-banner';
}
