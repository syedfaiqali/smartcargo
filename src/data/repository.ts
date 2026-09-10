import { AuditFields } from '../domain/common';
import { loadCollection, saveCollection } from './localStore';

/** Generic CRUD repository over a localStorage-backed collection, mimicking a real API's shape. */
export class Repository<T extends AuditFields> {
  constructor(private readonly collection: string) {}

  list(): T[] {
    return loadCollection<T>(this.collection);
  }

  get(id: string): T | undefined {
    return this.list().find((item) => item.id === id);
  }

  find(predicate: (item: T) => boolean): T[] {
    return this.list().filter(predicate);
  }

  save(item: T): T {
    const items = this.list();
    const idx = items.findIndex((i) => i.id === item.id);
    const updated: T = { ...item, updatedAt: new Date().toISOString() };
    if (idx >= 0) {
      items[idx] = updated;
    } else {
      items.push(updated);
    }
    saveCollection(this.collection, items);
    return updated;
  }

  saveAll(newItems: T[]): T[] {
    const items = this.list();
    const now = new Date().toISOString();
    const merged = [...items];
    const result: T[] = [];
    for (const item of newItems) {
      const idx = merged.findIndex((i) => i.id === item.id);
      const updated = { ...item, updatedAt: now };
      if (idx >= 0) {
        merged[idx] = updated;
      } else {
        merged.push(updated);
      }
      result.push(updated);
    }
    saveCollection(this.collection, merged);
    return result;
  }

  remove(id: string): void {
    const items = this.list().filter((item) => item.id !== id);
    saveCollection(this.collection, items);
  }

  replaceAll(items: T[]): void {
    saveCollection(this.collection, items);
  }
}
