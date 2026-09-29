/**
 * TODO(auth): replace with the real logged-in user id once an auth system exists.
 * Until then every browser profile shares one preferences bucket.
 */
export const FALLBACK_USER_ID = 'local-user';

export const MAX_PINS = 6;

export const HOVER_INTENT_MS = 200;

export const MOBILE_BREAKPOINT = 900;

/** Default Quick Access pins for a brand-new user, per spec — only applied if these paths exist in navConfig. */
export const DEFAULT_PIN_PATHS = ['/freight/sea-import/quotations', '/freight/sea-import/document-receipt'];
