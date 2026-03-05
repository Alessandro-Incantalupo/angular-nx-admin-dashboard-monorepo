# 🎯 Senior / Advanced Interview Questions

> These are the **"separate the seniors from the mids"** questions.
> They test runtime JS knowledge, type system depth, and debugging maturity —
> not just Angular API familiarity.

---

## 1. JavaScript Event Loop — Microtask vs Macrotask

### The mental model

```
Execution order:
  1. ALL synchronous code
  2. ALL microtasks (drain completely)
  3. Browser render frame
  4. ONE macrotask
  5. → repeat from step 2
```

| Queue         | Examples                                                                      | Priority                         |
| ------------- | ----------------------------------------------------------------------------- | -------------------------------- |
| **Microtask** | `Promise.then/catch/finally`, `async/await` continuations, `queueMicrotask()` | HIGH — runs before any macrotask |
| **Macrotask** | `setTimeout`, `setInterval`, DOM events, `fetch` response callbacks           | NORMAL                           |

### The classic interview puzzle

```js
console.log('1'); // sync
setTimeout(() => console.log('2'), 0); // macrotask
Promise.resolve().then(() => console.log('3')); // microtask
console.log('4'); // sync

// Output: 1 → 4 → 3 → 2
```

`setTimeout(fn, 0)` does **not** mean "run immediately" — it means "run after all current sync code AND all pending microtasks."

### The async/await version (trickier)

```js
async function run() {
  console.log('A'); // sync inside async fn
  await Promise.resolve(); // suspends run(), returns to caller
  console.log('B'); // microtask continuation
}
run();
console.log('C'); // caller continues synchronously

// Output: A → C → B
```

> When you `await`, the function **pauses and returns control to the caller**. The caller runs synchronously, then the resumed code runs as a microtask.

### One-line answer for interviews

> _"Microtasks (Promises, async/await) always run before the next macrotask (setTimeout). The event loop drains the entire microtask queue between each macrotask."_

---

## 2. `DeepReadonly<T>` — Recursive Conditional Type

### Why `Readonly<T>` is not enough

```ts
const user: Readonly<User> = { id: '1', address: { city: 'Rome' } };
user.id = 'X'; // ✅ TS error — good
user.address.city = 'Milan'; // ❌ NO error — Readonly is shallow!
```

### The 3-layer conditional type (what the interviewer wanted)

```ts
type DeepReadonly<T> =
  // Layer 1: is it an array?
  T extends (infer U)[]
    ? ReadonlyArray<DeepReadonly<U>>
    : // Layer 2: is it an object?
      T extends object
      ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
      : // Layer 3: it's a primitive — pass through unchanged
        T;
```

**Line by line:**

```
T extends (infer U)[]                → is T an array? extract element type as U
  ReadonlyArray<DeepReadonly<U>>     → freeze the array + recurse into each element

T extends object                     → is T a plain object (non-array, non-primitive)?
  { readonly [K in keyof T]: ... }   → mapped type: add readonly to every key
    DeepReadonly<T[K]>               → recurse into the value

: T                                  → primitive (string/number/boolean) — done, pass through
```

**`infer U` explained:** inside `extends`, `infer U` captures part of the matched type.
`T extends (infer U)[]` means _"if T is an array, capture its element type as U"_.

### Verify it works

```ts
declare const frozen: DeepReadonly<{
  id: string;
  address: { city: string; geo: { lat: number } };
  tags: string[];
}>;

frozen.id = 'x'; // ✅ error
frozen.address.city = 'y'; // ✅ error — deep!
frozen.address.geo.lat = 0; // ✅ error — deeper!
frozen.tags.push('x'); // ✅ error — ReadonlyArray
frozen.tags[0] = 'x'; // ✅ error
```

### One-line answer for interviews

> _"It's a recursive conditional type with three branches: arrays become `ReadonlyArray` of deep-frozen elements using `infer` to capture the element type; objects get a mapped type with `readonly` on every key and recursion into values; primitives pass through unchanged."_

---

## 3. Big-O Complexity — The Essentials

> You don't need to derive proofs. Know the practical table cold.

| Complexity     | Name         | Practical example                                      |
| -------------- | ------------ | ------------------------------------------------------ |
| **O(1)**       | Constant     | `Map.get(key)`, `array[index]`, object property lookup |
| **O(log n)**   | Logarithmic  | Binary search, balanced tree lookup                    |
| **O(n)**       | Linear       | `Array.find()`, `Array.filter()`, looping once         |
| **O(n log n)** | Linearithmic | `Array.sort()`                                         |
| **O(n²)**      | Quadratic    | Nested loops (`for i ... for j ...`)                   |

### HashMap vs Array for lookups

```ts
// O(n) — slower as list grows
const user = users.find(u => u.id === targetId); // scans every element

// O(1) — instant regardless of size
const userMap = new Map(users.map(u => [u.id, u]));
const user = userMap.get(targetId); // hash lookup
```

### Pagination cache — HashMap pattern

```ts
private readonly pageCache = new Map<number, User[]>();

getPage(page: number): Observable<User[]> {
  // O(1) cache check
  if (this.pageCache.has(page)) {
    return of(this.pageCache.get(page)!); // cache hit — no HTTP
  }
  // Cache miss — fetch and store
  return this.http.get<PaginatedUsers>(`/api/users?page=${page}`).pipe(
    tap(res => this.pageCache.set(page, res.data)), // store in O(1)
    map(res => res.data)
  );
}

// Invalidate when data changes (add/delete)
invalidatePage(page: number) { this.pageCache.delete(page); }
clearAll()                   { this.pageCache.clear(); }
```

> The interviewer wanted to see: `Map` (not array), `of()` to keep the return type consistent, and cache invalidation awareness.

---

## 4. Memory Tab Debugging — Finding Observable Leaks

### What the Memory tab is (Chrome DevTools)

`DevTools → Memory tab` lets you take **heap snapshots** — a frozen picture of every JavaScript object currently in memory. If you take two snapshots and compare them, you can see what grew between them.

### How to find a leaked subscription

**Symptom:** component is destroyed but still receiving events (double API calls, stale data, growing memory).

**Step-by-step in Chrome DevTools:**

```
1. Open DevTools → Memory tab
2. Take Snapshot 1  (before the suspected leak)
3. Navigate to the component, interact, then navigate AWAY (destroy it)
4. Take Snapshot 2
5. Change dropdown to "Comparison" — shows what was allocated/freed
6. Filter by "Subscription" or your component name in the search box
7. If you see Subscription objects still retained → you have a leak
```

**What you'll see when leaking:**

```
Constructor         | # New | # Deleted | # Delta
Subscriber          |   5   |     0     |   +5   ← these should have been freed
SafeSubscriber      |   5   |     0     |   +5
EventEmitter        |   2   |     0     |   +2
```

### How to prevent it (the Angular way)

```ts
// ✅ Option 1: takeUntilDestroyed (modern, preferred)
this.form.valueChanges.pipe(
  takeUntilDestroyed(this.destroyRef)
).subscribe(...);

// ✅ Option 2: async pipe in template (auto-unsubscribes)
// template: {{ users$ | async }}

// ✅ Option 3: manual unsubscribe (old way, avoid)
private sub = new Subscription();
ngOnInit()   { this.sub.add(obs$.subscribe(...)); }
ngOnDestroy(){ this.sub.unsubscribe(); }
```

### The retained size concept

In the heap snapshot, each object has two size columns:

- **Shallow size** — just this object
- **Retained size** — this object + everything it keeps alive

A leaked `Subscription` often has a large **retained size** because it holds references to the Observable source, the component instance, and its DOM tree — preventing garbage collection of all of them.

### One-line answer for interviews

> _"I open DevTools Memory tab, take a heap snapshot before and after destroying the component, switch to Comparison view, and filter for Subscription objects. A leaked subscription shows a positive delta — objects that were never freed. In Angular I prevent this with `takeUntilDestroyed` which auto-unsubscribes when the DestroyRef fires."_

---

## 🔴 How to Handle These in Future Interviews

| If asked about...                 | Lead with...                                                                                                                                         |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Event loop order                  | _"Microtasks — Promises — always run before macrotasks — setTimeout."_ Then offer to walk through an example.                                        |
| `DeepReadonly` or recursive types | _"Three-branch conditional type: array check with `infer`, object check with mapped type, primitive passthrough."_ Draw it if you have a whiteboard. |
| Big-O / HashMap                   | _"Map.get is O(1) vs Array.find O(n). I cache pages in a Map keyed by page number."_                                                                 |
| Memory/performance debugging      | _"Heap snapshot comparison in DevTools Memory tab. I look at retained size delta after destroying the component."_                                   |
