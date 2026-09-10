const NAMESPACE = 'smartcargo';

function key(collection: string): string {
  return `${NAMESPACE}:${collection}`;
}

export function loadCollection<T>(collection: string): T[] {
  const raw = window.localStorage.getItem(key(collection));
  if (!raw) return [];
  try {
    return JSON.parse(raw) as T[];
  } catch {
    return [];
  }
}

export function saveCollection<T>(collection: string, items: T[]): void {
  window.localStorage.setItem(key(collection), JSON.stringify(items));
}

export function isSeeded(collection: string): boolean {
  return window.localStorage.getItem(key(`${collection}:seeded`)) === '1';
}

export function markSeeded(collection: string): void {
  window.localStorage.setItem(key(`${collection}:seeded`), '1');
}
