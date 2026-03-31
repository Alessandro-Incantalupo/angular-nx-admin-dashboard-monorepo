/**
 * ============================================================
 * EXERCISE 08 — Live Coding: JS / TypeScript Fundamentals
 * ============================================================
 *
 * RULES (simulate a live coding screen):
 *   - No looking at notes. No scaffolding given.
 *   - Type EVERYTHING from scratch, including imports.
 *   - If TypeScript errors, fix them — they count.
 *   - Target: ~5 min per task.
 *
 * Topics covered (from Tier 1 & 5 pool):
 *   Closures · Pure functions · Memoize · Debounce
 *   Array methods · OOP · Map/Record · TypeScript utility types
 */

// ═══════════════════════════════════════════════════════════
// TASK 1 — CLOSURE: Counter factory
// ═══════════════════════════════════════════════════════════
//
// Write a createCounter() function.
// Returns: { increment(): void, decrement(): void, getCount(): number }
// The internal count is PRIVATE — not accessible directly.
// Calling getCount() must return the current number.
//
// Usage:
//   const c = createCounter();
//   c.increment(); c.increment(); c.decrement();
//   console.log(c.getCount()); // 1

// ═══════════════════════════════════════════════════════════
// TASK 2 — PURE FUNCTION + MEMOIZATION: memoize()
// ═══════════════════════════════════════════════════════════
//
// Write memoize(fn) — wraps any single-argument function and
// caches results by argument using a Map.
// On subsequent calls with the same argument, return the cached value.
//
// Usage:
//   const expensiveDouble = memoize((n: number) => { console.log('computing'); return n * 2; });
//   expensiveDouble(5); // logs 'computing', returns 10
//   expensiveDouble(5); // returns 10, no log

// ═══════════════════════════════════════════════════════════
// TASK 3 — DEBOUNCE: debounce()
// ═══════════════════════════════════════════════════════════
//
// Write debounce(fn, ms) — returns a new function that only calls fn
// after ms milliseconds have elapsed since the last invocation.
// If called again before ms elapses, reset the timer.
//
// This is the manual version of RxJS debounceTime().
//
// Usage:
//   const onSearch = debounce((term: string) => console.log('search:', term), 300);
//   onSearch('a');    // timer starts
//   onSearch('ab');   // timer resets
//   onSearch('abc');  // timer resets — only THIS fires after 300ms

// ═══════════════════════════════════════════════════════════
// TASK 4 — ARRAY METHODS: groupBy using reduce
// ═══════════════════════════════════════════════════════════
//
// Write groupBy<T>(arr: T[], keyFn: (item: T) => string): Record<string, T[]>
// Group an array into a dictionary of arrays, keyed by the result of keyFn.
// Do NOT use a for loop — use Array.reduce().
//
// Usage:
//   const users = [
//     { name: 'Alice', role: 'admin' },
//     { name: 'Bob',   role: 'user' },
//     { name: 'Carol', role: 'admin' },
//   ];
//   groupBy(users, u => u.role);
//   // → { admin: [Alice, Carol], user: [Bob] }

// ═══════════════════════════════════════════════════════════
// TASK 5 — OOP: EventBus class
// ═══════════════════════════════════════════════════════════
//
// Write a class EventBus with:
//   on(event: string, handler: (data: unknown) => void): void
//       → registers a handler for event
//   off(event: string, handler: (data: unknown) => void): void
//       → removes a specific handler (same function reference)
//   emit(event: string, data: unknown): void
//       → calls all registered handlers for event with data
//
// Handlers for an event are stored in a Map<string, Set<handler>>.
// Use Set so duplicate registrations are ignored automatically.
//
// Usage:
//   const bus = new EventBus();
//   const log = (d: unknown) => console.log(d);
//   bus.on('save', log);
//   bus.emit('save', { id: 1 });  // logs { id: 1 }
//   bus.off('save', log);
//   bus.emit('save', { id: 2 });  // nothing logged

// ═══════════════════════════════════════════════════════════
// TASK 6 — TYPESCRIPT: Write utility types manually
// ═══════════════════════════════════════════════════════════
//
// WITHOUT using the built-in helpers (Partial, Readonly, Omit, Pick),
// re-implement them from scratch using mapped types.
//
// Hint: mapped type syntax → { [K in keyof T]: ... }
// Hint: to make optional → { [K in keyof T]?: T[K] }
// Hint: Exclude<K, X> → K extends X ? never : K
//
// A. MyPartial<T>   — all keys become optional
// B. MyReadonly<T>  — all keys become readonly
// C. MyOmit<T, K>   — remove keys K from T  (K extends keyof T)
// D. MyPick<T, K>   — keep only keys K from T

// A.

// B.

// C.

// D.

// ═══════════════════════════════════════════════════════════
// ✅ SOLUTIONS — only look after trying
// ═══════════════════════════════════════════════════════════
/*
// TASK 1 — Closure counter
function createCounter() {
  let count = 0;
  return {
    increment: () => { count++; },
    decrement: () => { count--; },
    getCount: () => count,
  };
}

// TASK 2 — Memoize
function memoize<T, R>(fn: (arg: T) => R): (arg: T) => R {
  const cache = new Map<T, R>();
  return (arg: T): R => {
    if (cache.has(arg)) return cache.get(arg)!;
    const result = fn(arg);
    cache.set(arg, result);
    return result;
  };
}

// TASK 3 — Debounce
function debounce<T extends unknown[]>(fn: (...args: T) => void, ms: number) {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: T) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

// TASK 4 — groupBy
function groupBy<T>(arr: T[], keyFn: (item: T) => string): Record<string, T[]> {
  return arr.reduce<Record<string, T[]>>((acc, item) => {
    const key = keyFn(item);
    acc[key] = [...(acc[key] ?? []), item];
    return acc;
  }, {});
}

// TASK 5 — EventBus
class EventBus {
  private readonly handlers = new Map<string, Set<(data: unknown) => void>>();

  on(event: string, handler: (data: unknown) => void): void {
    if (!this.handlers.has(event)) this.handlers.set(event, new Set());
    this.handlers.get(event)!.add(handler);
  }

  off(event: string, handler: (data: unknown) => void): void {
    this.handlers.get(event)?.delete(handler);
  }

  emit(event: string, data: unknown): void {
    this.handlers.get(event)?.forEach(h => h(data));
  }
}

// TASK 6 — Utility types
type MyPartial<T>         = { [K in keyof T]?: T[K] };
type MyReadonly<T>        = { readonly [K in keyof T]: T[K] };
type MyOmit<T, K extends keyof T>  = { [P in Exclude<keyof T, K>]: T[P] };
type MyPick<T, K extends keyof T>  = { [P in K]: T[P] };
*/
