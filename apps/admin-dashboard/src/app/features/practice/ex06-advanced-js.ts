/**
 * ============================================================
 * EXERCISE 06 — JavaScript Advanced: The 3 Questions That Got You
 * ============================================================
 *
 * These are the exact patterns from your interview:
 *   1. Microtask vs Macrotask (event loop execution order)
 *   2. DeepReadonly — manual recursive TypeScript type
 *   3. HashMap for pagination — O(1) page cache
 *
 * Study order: read the explanation, predict the output,
 * then fill in the TODO code sections.
 */

// ═══════════════════════════════════════════════════════════
// TOPIC 1: Microtask vs Macrotask (the event loop)
// ═══════════════════════════════════════════════════════════
//
// JavaScript is SINGLE THREADED — it executes one thing at a time.
// The Event Loop decides what runs next using two queues:
//
//   MICROTASK queue (HIGH priority):
//     - Promise.then() / Promise.catch() / Promise.finally()
//     - queueMicrotask()
//     - async/await continuations (after an await)
//
//   MACROTASK queue (NORMAL priority, also called "task queue"):
//     - setTimeout()
//     - setInterval()
//     - DOM events (click, input)
//     - fetch callbacks (the response, not the Promise)
//
// ORDER OF EXECUTION:
//   1. Run ALL synchronous code to completion
//   2. Drain the ENTIRE microtask queue (could be many)
//   3. Render the DOM (browser only)
//   4. Run ONE macrotask from the macrotask queue
//   5. Go back to step 2
//
// KEY INSIGHT: Microtasks ALWAYS run before the next macrotask.
//              Even if the macrotask was queued first.

export function topic1_predict_the_output() {
  console.log('1 - sync start');

  setTimeout(() => console.log('2 - macrotask (setTimeout 0)'), 0);

  Promise.resolve()
    .then(() => console.log('3 - microtask (Promise.then)'))
    .then(() => console.log('4 - microtask (chained .then)'));

  queueMicrotask(() => console.log('5 - microtask (queueMicrotask)'));

  setTimeout(() => console.log('6 - macrotask 2 (setTimeout 0)'), 0);

  console.log('7 - sync end');

  /*
   * TODO: Write the output ORDER before reading the answer.
   *
   * Line 1: ?
   * Line 2: ?
   * Line 3: ?
   * Line 4: ?
   * Line 5: ?
   * Line 6: ?
   * Line 7: ?
   *
   * ✅ ANSWER:
   *   1 - sync start          ← synchronous, runs first
   *   7 - sync end            ← synchronous, runs before anything async
   *   3 - microtask           ← microtask queue drains FIRST
   *   5 - microtask           ← still microtask queue
   *   4 - microtask (chained) ← the .then() chained to line 3
   *   2 - macrotask           ← first macrotask runs AFTER all microtasks
   *   6 - macrotask 2         ← second macrotask
   *
   * CRITICAL INSIGHT: setTimeout(fn, 0) does NOT mean "run immediately".
   * It means "run AFTER all synchronous code AND all pending microtasks".
   * Even Promise.then() runs BEFORE setTimeout(0).
   */
}

// The async/await version — same rules, different syntax
export async function topic1_async_await() {
  console.log('A - start');

  await Promise.resolve(); // ← creates a microtask checkpoint

  console.log('B - after await'); // runs as a microtask continuation

  setTimeout(() => console.log('C - setTimeout'), 0);

  console.log('D - sync after setTimeout');

  /*
   * TODO: Output order?
   *
   * ✅ ANSWER:
   *   A - start
   *   D - sync after setTimeout   ← sync code in the async fn runs after 'await'
   *   B - after await             ← microtask: await resumes here
   *   C - setTimeout              ← macrotask: runs last
   *
   * WAIT — why does D run before B?
   * When you hit `await`, the function SUSPENDS and returns control
   * to the CALLER. The caller continues synchronously (D runs).
   * Then the awaited Promise resolves → B is scheduled as a microtask.
   *
   * This is the most common interview gotcha for async/await.
   */
}

// ═══════════════════════════════════════════════════════════
// TOPIC 2: DeepReadonly — recursive mapped type
// ═══════════════════════════════════════════════════════════
//
// Built-in Readonly<T> only makes the TOP LEVEL properties readonly.
// Nested objects can still be mutated.
//
// Example of the PROBLEM:
//   const user: Readonly<User> = { id: '1', address: { city: 'Rome' } };
//   user.id = 'X';              // ✅ TypeScript error — good
//   user.address.city = 'Milan'; // ❌ NO error — Readonly doesn't go deep!
//
// Solution: build DeepReadonly recursively.

// ── Step 1: understand Readonly<T> (built-in) ──────────────
type ShallowReadonlyUser = Readonly<{
  id: string;
  address: { city: string };
  tags: string[];
}>;
// { readonly id: string; readonly address: { city: string }; readonly tags: string[] }
//                                            ↑ NOT readonly — shallow!

// ── Step 2: build DeepReadonly manually ───────────────────
//
// The 3 layers (this is what the interviewer wanted):
//   Layer 1: T extends (infer U)[]  → it's an array → extract element type with infer
//   Layer 2: T extends object       → it's an object → mapped type + recurse
//   Layer 3: : T                    → it's a primitive → pass through unchanged
//
// `infer U` captures the element type of the array inside the conditional.
// Without infer you'd write T[number] — both work, infer is more idiomatic.

export type DeepReadonly<T> =
  // TODO T2a: fill in the 3-layer conditional type
  // Hint — skeleton:
  //   T extends (infer U)[]
  //     ? ReadonlyArray<DeepReadonly<U>>
  //     : T extends object
  //       ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
  //       : T
  T; // ← replace this placeholder

// ── Verify your implementation ────────────────────────────
interface UserWithAddress {
  id: string;
  name: string;
  address: {
    city: string;
    country: string;
    geo: { lat: number; lng: number };
  };
  tags: string[];
}

declare const frozenUser: DeepReadonly<UserWithAddress>;

// When your DeepReadonly is correct, ALL of these should be errors:
// frozenUser.id = 'X';                    // ✅ error
// frozenUser.address.city = 'Milan';      // ✅ error (deep!)
// frozenUser.address.geo.lat = 0;         // ✅ error (deeper!)
// frozenUser.tags.push('admin');          // ✅ error (ReadonlyArray)
// frozenUser.tags[0] = 'x';              // ✅ error

/*
 * ✅ ANSWER:
 *
 * export type DeepReadonly<T> = {
 *   readonly [K in keyof T]: T[K] extends any[]
 *     ? ReadonlyArray<DeepReadonly<T[K][number]>>
 *     : T[K] extends object
 *       ? DeepReadonly<T[K]>
 *       : T[K];
 * };
 *
 * EXPLANATION line by line:
 *
 * readonly [K in keyof T]
 *   → mapped type: iterate every key, add `readonly`
 *
 * T[K] extends any[]
 *   → is this property an array?
 *   → T[K][number] = the element type of the array
 *   → ReadonlyArray<DeepReadonly<element>> = readonly + recursed
 *
 * T[K] extends object
 *   → is this property a plain object (not array, not primitive)?
 *   → DeepReadonly<T[K]> = recurse into it
 *
 * : T[K]
 *   → it's a primitive (string, number, boolean) — just keep it as-is
 *
 * HOW TO EXPLAIN IN INTERVIEW:
 * "It's a recursive mapped type. I iterate over every key with `in keyof T`,
 *  add `readonly`, then check the value type: arrays become ReadonlyArray of
 *  deep-frozen elements, nested objects get the same treatment recursively,
 *  and primitives pass through unchanged."
 */

// ═══════════════════════════════════════════════════════════
// TOPIC 3: HashMap for pagination — O(1) page cache
// ═══════════════════════════════════════════════════════════
//
// PROBLEM: without caching, navigating to page 2, back to page 1,
// then to page 2 again fires 3 HTTP requests for 2 unique pages.
//
// SOLUTION: use a Map<pageNumber, results> as a cache.
// First visit → fetch + store. Revisit → return from cache (no HTTP).
//
// TIME COMPLEXITY:
//   Map.get(key) = O(1) — constant, regardless of cache size
//   vs Array.find() = O(n) — slower as cache grows
//
// This is where "HashMap" comes from — it's a hash table under the hood.

import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, of } from 'rxjs';

interface User {
  id: string;
  name: string;
}
interface PaginatedUsers {
  data: User[];
  meta: { totalItems: number };
}

@Injectable({ providedIn: 'root' })
export class PaginatedUsersService {
  private readonly http = inject(HttpClient);

  // ── The HashMap cache ─────────────────────────────────────
  // Key: page number (1, 2, 3...)
  // Value: the array of users for that page
  private readonly pageCache = new Map<number, User[]>();

  // Current page signal — component reads this
  readonly currentPage = signal(1);
  readonly users = signal<User[]>([]);
  readonly totalItems = signal(0);

  // TODO T3a: Implement getPage(page: number): Observable<User[]>
  //
  // Logic:
  //   1. If this.pageCache.has(page) →
  //        return of(this.pageCache.get(page)!) (cache hit, no HTTP)
  //   2. Otherwise →
  //        call http.get, pipe tap() to store result in pageCache,
  //        return the observable of users
  //
  // Hint for the HTTP call:
  //   this.http.get<PaginatedUsers>(`/api/users?page=${page}&size=10`)
  //     .pipe(
  //       tap(response => {
  //         this.pageCache.set(page, response.data);
  //         this.totalItems.set(response.meta.totalItems);
  //       }),
  //       map(response => response.data)
  //     )

  getPage(page: number): Observable<User[]> {
    // TODO: implement cache-first logic
    return of([]); // placeholder
  }

  // TODO T3b: Implement goToPage(page: number): void
  //   1. this.currentPage.set(page)
  //   2. call this.getPage(page).subscribe(users => this.users.set(users))
  goToPage(page: number): void {
    // TODO
  }

  // TODO T3c: Implement invalidatePage(page: number): void
  //   When a user is added/deleted, that page's cache is stale.
  //   Remove it from the map so next visit re-fetches.
  invalidatePage(page: number): void {
    // TODO: this.pageCache.delete(page)
  }

  // TODO T3d: Implement clearCache(): void
  //   Full cache reset (e.g. after bulk operations)
  clearCache(): void {
    // TODO: this.pageCache.clear()
  }

  /*
   * ✅ ANSWERS:
   *
   * T3a:
   * getPage(page: number): Observable<User[]> {
   *   if (this.pageCache.has(page)) {
   *     console.log(`Cache hit for page ${page}`);
   *     return of(this.pageCache.get(page)!);
   *   }
   *   return this.http.get<PaginatedUsers>(`/api/users?page=${page}&size=10`).pipe(
   *     tap(response => {
   *       this.pageCache.set(page, response.data);
   *       this.totalItems.set(response.meta.totalItems);
   *     }),
   *     map(response => response.data)
   *   );
   * }
   *
   * T3b:
   * goToPage(page: number): void {
   *   this.currentPage.set(page);
   *   this.getPage(page).subscribe(users => this.users.set(users));
   * }
   *
   * T3c: this.pageCache.delete(page);
   * T3d: this.pageCache.clear();
   *
   * ── HOW TO EXPLAIN IN INTERVIEW ──────────────────────────
   * "I used a Map<number, User[]> as a page cache. Map.get() is O(1)
   *  so lookups are constant time regardless of how many pages are cached.
   *  On first visit we fetch and store; on revisit we return from cache
   *  immediately with of() so the component gets an Observable either way
   *  and doesn't need to know if it was cached. When data changes I call
   *  invalidatePage() so the next visit re-fetches fresh data."
   *
   * THE PATTERN IN YOUR STORE:
   * Look at withPagination.ts — your store already does page tracking.
   * This cache pattern would be the next optimization on top of it.
   */
}
