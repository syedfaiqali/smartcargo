import { DEFAULT_PIN_PATHS, FALLBACK_USER_ID, MAX_PINS } from './constants';

/**
 * Sole owner of sidebar menu-preference storage. All localStorage reads/writes for
 * pins and favorites must go through this file.
 */

export interface MenuPreferencesData {
  version: 1;
  pins: string[];
  favorites: string[];
}

export interface ToggleFavoriteResult {
  data: MenuPreferencesData;
}

export interface TogglePinResult {
  data: MenuPreferencesData;
  /** True if the pin was rejected because MAX_PINS was already reached. */
  limitReached: boolean;
}

function storageKey(userId: string): string {
  return `smartcargo.menuprefs.${userId}`;
}

function defaultData(): MenuPreferencesData {
  return { version: 1, pins: [...DEFAULT_PIN_PATHS], favorites: [] };
}

function readRaw(userId: string): MenuPreferencesData {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(storageKey(userId));
  } catch {
    return defaultData();
  }
  if (!raw) return defaultData();
  try {
    const parsed = JSON.parse(raw);
    if (
      !parsed ||
      typeof parsed !== 'object' ||
      !Array.isArray(parsed.pins) ||
      !Array.isArray(parsed.favorites)
    ) {
      return defaultData();
    }
    return {
      version: 1,
      pins: parsed.pins.filter((p: unknown): p is string => typeof p === 'string'),
      favorites: parsed.favorites.filter((f: unknown): f is string => typeof f === 'string'),
    };
  } catch {
    return defaultData();
  }
}

function writeRaw(data: MenuPreferencesData, userId: string): void {
  try {
    // TODO(api): mirror this write to a backend endpoint (e.g. PUT /api/users/:id/menu-preferences)
    // once one exists, instead of (or in addition to) localStorage.
    window.localStorage.setItem(storageKey(userId), JSON.stringify(data));
  } catch {
    // Storage unavailable (private mode, quota, etc.) — silently ignore, preferences just won't persist.
  }
}

export function readPreferences(userId: string = FALLBACK_USER_ID): MenuPreferencesData {
  return readRaw(userId);
}

export function writePreferences(data: MenuPreferencesData, userId: string = FALLBACK_USER_ID): void {
  writeRaw(data, userId);
}

export function getPins(userId: string = FALLBACK_USER_ID): string[] {
  return readRaw(userId).pins;
}

export function togglePin(path: string, userId: string = FALLBACK_USER_ID): TogglePinResult {
  const current = readRaw(userId);
  const isPinned = current.pins.includes(path);

  if (isPinned) {
    const data: MenuPreferencesData = { ...current, pins: current.pins.filter((p) => p !== path) };
    writeRaw(data, userId);
    return { data, limitReached: false };
  }

  if (current.pins.length >= MAX_PINS) {
    return { data: current, limitReached: true };
  }

  const data: MenuPreferencesData = { ...current, pins: [...current.pins, path] };
  writeRaw(data, userId);
  return { data, limitReached: false };
}

export function reorderPins(orderedPaths: string[], userId: string = FALLBACK_USER_ID): MenuPreferencesData {
  const current = readRaw(userId);
  const currentSet = new Set(current.pins);
  const reordered = orderedPaths.filter((p) => currentSet.has(p));
  for (const p of current.pins) {
    if (!reordered.includes(p)) reordered.push(p);
  }
  const data: MenuPreferencesData = { ...current, pins: reordered };
  writeRaw(data, userId);
  return data;
}

export function getFavorites(userId: string = FALLBACK_USER_ID): string[] {
  return readRaw(userId).favorites;
}

export function toggleFavorite(path: string, userId: string = FALLBACK_USER_ID): ToggleFavoriteResult {
  const current = readRaw(userId);
  const isFavorite = current.favorites.includes(path);
  const data: MenuPreferencesData = {
    ...current,
    favorites: isFavorite ? current.favorites.filter((f) => f !== path) : [...current.favorites, path],
  };
  writeRaw(data, userId);
  return { data };
}
