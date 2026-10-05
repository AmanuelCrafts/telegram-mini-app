import { TelegramWebApp } from '../types/telegram';

/**
 * Safely retrieve the Telegram WebApp instance from the window object.
 */
export function getTelegramWebApp(): TelegramWebApp | null {
  if (typeof window === 'undefined') return null;
  return window.Telegram?.WebApp || null;
}

/**
 * Check if the app is currently running inside the Telegram WebApp environment.
 */
export function isRunningInTelegram(): boolean {
  const tg = getTelegramWebApp();
  return Boolean(tg && tg.initData && tg.initData.length > 0);
}

/**
 * Initialize Telegram WebApp settings: expands viewport, sets theme colors, notifies Telegram client.
 */
export function initTelegramWebApp(): void {
  const tg = getTelegramWebApp();
  if (!tg) return;

  try {
    tg.ready();
    tg.expand();

    // Set header and background color if supported
    if (tg.setHeaderColor) {
      tg.setHeaderColor('#0a0914');
    }
    if (tg.setBackgroundColor) {
      tg.setBackgroundColor('#0a0914');
    }
  } catch (error) {
    console.warn('Failed to configure Telegram WebApp:', error);
  }
}

/**
 * Safely trigger haptic feedback on supported mobile devices.
 */
export function triggerHaptic(
  type: 'impact' | 'notification' | 'selection',
  style?: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' | 'error' | 'success' | 'warning'
): void {
  const tg = getTelegramWebApp();
  if (!tg?.HapticFeedback) return;

  try {
    if (type === 'impact') {
      const impactStyle = (style as 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') || 'medium';
      tg.HapticFeedback.impactOccurred(impactStyle);
    } else if (type === 'notification') {
      const notifType = (style as 'error' | 'success' | 'warning') || 'success';
      tg.HapticFeedback.notificationOccurred(notifType);
    } else if (type === 'selection') {
      tg.HapticFeedback.selectionChanged();
    }
  } catch {
    // Haptics not supported on device or browser; fail silently
  }
}
