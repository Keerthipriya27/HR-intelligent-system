import { secureStorage } from './sessionManager';

// ─── Trusted Device Configuration ───

const TRUSTED_DEVICE_EXPIRY_DAYS = 30;
const STORAGE_KEY = 'trusted_device';
const DEVICE_ID_KEY = 'device_fingerprint';

// ─── Device Fingerprint ───

export function generateDeviceFingerprint(): string {
  const components = [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    screen.colorDepth,
    navigator.hardwareConcurrency,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
  ];

  const raw = components.join('|||');
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  return Math.abs(hash).toString(36) + Date.now().toString(36);
}

export function getOrCreateDeviceId(): string {
  let deviceId = secureStorage.get(DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = generateDeviceFingerprint();
    secureStorage.set(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
}

export function getDeviceLabel(): string {
  const ua = navigator.userAgent;
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Safari')) return 'Safari';
  if (ua.includes('Edge')) return 'Edge';
  return 'Unknown Browser';
}

// ─── Trusted Device Management ───

export interface TrustedDeviceInfo {
  deviceId: string;
  label: string;
  trustedAt: string;
  expiresAt: number;
  userId: string;
}

export function isDeviceTrusted(userId: string): boolean {
  try {
    const stored = secureStorage.get(`${STORAGE_KEY}_${userId}`);
    if (!stored) return false;

    const info: TrustedDeviceInfo = JSON.parse(stored);
    if (Date.now() > info.expiresAt) {
      removeTrustedDevice(userId);
      return false;
    }

    // Verify device fingerprint matches
    const currentDeviceId = secureStorage.get(DEVICE_ID_KEY);
    if (info.deviceId !== currentDeviceId) return false;

    return true;
  } catch {
    return false;
  }
}

export function markDeviceAsTrusted(userId: string): TrustedDeviceInfo {
  const deviceId = getOrCreateDeviceId();
  const expiresAt = Date.now() + TRUSTED_DEVICE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

  const info: TrustedDeviceInfo = {
    deviceId,
    label: getDeviceLabel(),
    trustedAt: new Date().toISOString(),
    expiresAt,
    userId,
  };

  secureStorage.set(`${STORAGE_KEY}_${userId}`, JSON.stringify(info));
  return info;
}

export function removeTrustedDevice(userId: string): void {
  secureStorage.remove(`${STORAGE_KEY}_${userId}`);
}

export function removeAllTrustedDevices(): void {
  const keys = Object.keys(localStorage).filter(k => k.startsWith('hrci_auth_' + STORAGE_KEY));
  keys.forEach(k => localStorage.removeItem(k));
  secureStorage.remove(DEVICE_ID_KEY);
}

export function getTrustedDevices(): TrustedDeviceInfo[] {
  const devices: TrustedDeviceInfo[] = [];
  const keys = Object.keys(localStorage).filter(k => k.startsWith('hrci_auth_' + STORAGE_KEY));

  for (const key of keys) {
    try {
      const data = localStorage.getItem(key);
      if (data) {
        devices.push(JSON.parse(data));
      }
    } catch {
      // ignore corrupted entries
    }
  }

  return devices;
}

// ─── Config ───

export function getTrustedDeviceExpiryDays(): number {
  return TRUSTED_DEVICE_EXPIRY_DAYS;
}
