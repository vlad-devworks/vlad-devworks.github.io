type Listener<T> = (value: T) => void;

export interface Store<T> {
  get(): T;
  set(next: T | ((prev: T) => T)): void;
  subscribe(listener: Listener<T>): () => void;
  reset(): void;
}

interface PersistOptions<T> {
  key: string;
  /** Bump when the stored shape changes; old data is discarded rather than migrated. */
  version: number;
  initial: () => T;
}

/**
 * A JSON value kept in localStorage and synced across tabs through the `storage` event.
 * Falls back to memory when storage is blocked (private mode, disabled cookies), so the demos
 * still work, just without persistence.
 */
export function createPersistentStore<T>({ key, version, initial }: PersistOptions<T>): Store<T> {
  const storageKey = `${key}@${version}`;
  const listeners = new Set<Listener<T>>();

  const read = (): T | null => {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw === null ? null : (JSON.parse(raw) as T);
    } catch {
      return null;
    }
  };

  const write = (next: T) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      // Quota exceeded or storage disabled: keep going in memory.
    }
  };

  let value = read() ?? initial();
  write(value);

  const emit = () => listeners.forEach((listener) => listener(value));

  window.addEventListener('storage', (event) => {
    if (event.key !== storageKey) return;
    value = read() ?? initial();
    emit();
  });

  return {
    get: () => value,
    set(next) {
      value = typeof next === 'function' ? (next as (prev: T) => T)(value) : next;
      write(value);
      emit();
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    reset() {
      value = initial();
      write(value);
      emit();
    },
  };
}
