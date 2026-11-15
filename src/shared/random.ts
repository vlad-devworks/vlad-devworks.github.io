/** mulberry32: tiny seeded PRNG, so sample data looks random but stays stable between reloads. */
export function createRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** FNV-1a, used to turn a string (usually a date) into a PRNG seed. */
export function hashString(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

export function pick<T>(random: () => number, items: readonly T[]): T {
  const item = items[Math.floor(random() * items.length)];
  if (item === undefined) throw new Error('pick() called with an empty list');
  return item;
}

// No 0/O or 1/I, so codes survive being read out over the phone.
const CODE_ALPHABET = [...'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'];

export function createCode(length: number, random: () => number = Math.random): string {
  return Array.from({ length }, () => pick(random, CODE_ALPHABET)).join('');
}

export function createId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${createCode(4).toLowerCase()}`;
}
