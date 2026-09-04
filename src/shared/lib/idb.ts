/**
 * Minimal IndexedDB wrapper for the diary.
 *
 * The diary is local-first on purpose: the evening entry gets written in a riad
 * with no signal. Everything lands here first and syncs to Postgres later.
 */
const DB = 'shlyakh-diary';
const VERSION = 1;

export type StoreName = 'entries' | 'media' | 'meta';

let dbp: Promise<IDBDatabase> | null = null;

function open(): Promise<IDBDatabase> {
  if (dbp) return dbp;
  dbp = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('entries')) {
        const s = db.createObjectStore('entries', { keyPath: 'id' });
        s.createIndex('day', 'day', { unique: true });
      }
      if (!db.objectStoreNames.contains('media')) {
        const s = db.createObjectStore('media', { keyPath: 'id' });
        s.createIndex('entryId', 'entryId');
      }
      if (!db.objectStoreNames.contains('meta')) db.createObjectStore('meta');
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbp;
}

function run<T>(store: StoreName, mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest): Promise<T> {
  return open().then((db) => new Promise<T>((resolve, reject) => {
    const tx = db.transaction(store, mode);
    const req = fn(tx.objectStore(store));
    req.onsuccess = () => resolve(req.result as T);
    req.onerror = () => reject(req.error);
  }));
}

export const idb = {
  get: <T>(store: StoreName, key: IDBValidKey) => run<T | undefined>(store, 'readonly', (s) => s.get(key)),
  all: <T>(store: StoreName) => run<T[]>(store, 'readonly', (s) => s.getAll()),
  put: <T>(store: StoreName, value: T, key?: IDBValidKey) =>
    run<IDBValidKey>(store, 'readwrite', (s) => (key !== undefined ? s.put(value, key) : s.put(value))),
  del: (store: StoreName, key: IDBValidKey) => run<undefined>(store, 'readwrite', (s) => s.delete(key)),
  byIndex: <T>(store: StoreName, index: string, value: IDBValidKey) =>
    run<T[]>(store, 'readonly', (s) => s.index(index).getAll(value)),
  clear: (store: StoreName) => run<undefined>(store, 'readwrite', (s) => s.clear()),
};

/** Rough size of what the diary is holding, for the Settings screen. */
export async function diaryUsage(): Promise<{ used: number; quota: number } | null> {
  if (!navigator.storage?.estimate) return null;
  const e = await navigator.storage.estimate();
  return { used: e.usage ?? 0, quota: e.quota ?? 0 };
}
