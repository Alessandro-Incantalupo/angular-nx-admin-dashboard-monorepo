/**
 * ============================================================
 * EXERCISE 02 — Observables: Write the code (practical)
 * ============================================================
 *
 * Each section gives you a GOAL and a skeleton.
 * Fill in the missing code. TypeScript errors = wrong answer.
 * Run in browser console or copy into a component to test.
 *
 * No more "predict the output" — write real pipes.
 */

import { HttpClient } from '@angular/common/http';
import {
  DestroyRef,
  Injectable,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';
import { Observable, catchError, forkJoin, of } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  exhaustMap,
  filter,
  map,
  switchMap,
  tap,
} from 'rxjs/operators';

// ─────────────────────────────────────────────────────────────
// TASK 1 — Build a search pipeline
// ─────────────────────────────────────────────────────────────
// GOAL: Given a FormControl that a user types into,
//       build a pipeline that searches after 300ms,
//       skips duplicate terms, cancels the previous request,
//       and recovers from errors with an empty array.
//
// This is the exact pattern for a search box in any Angular app.

function buildSearchPipeline(
  searchControl: FormControl<string>,
  http: HttpClient
): Observable<string[]> {
  return searchControl.valueChanges.pipe(
    debounceTime(300),
    distinctUntilChanged(),
    switchMap(term =>
      http.get<string[]>(`/api/search?q=${term}`).pipe(catchError(() => of([])))
    )
    // TODO 1a: wait 300ms after user stops typing
    /* ... */
    // TODO 1b: don't re-fire if the value hasn't changed
    /* ... */
    // TODO 1c: cancel the previous HTTP request and start a new one
    //          inside, recover from errors with an empty array (TODO 1d)
    /* ... */
  );

  /*
   * ✅ ANSWER:
   * return searchControl.valueChanges.pipe(
   *   debounceTime(300),
   *   distinctUntilChanged(),
   *   switchMap(term =>
   *     http.get<string[]>(`/api/search?q=${term}`).pipe(
   *       catchError(() => of([]))
   *     )
   *   )
   * );
   *
   * WHY catchError INSIDE switchMap?
   * If you put catchError outside, one error kills the entire stream.
   * Inside switchMap it only kills that one inner request — the outer
   * stream (the search box) stays alive. This is the correct pattern.
   */
}

// ─────────────────────────────────────────────────────────────
// TASK 2 — Cleanup with takeUntilDestroyed
// ─────────────────────────────────────────────────────────────
// GOAL: Subscribe to a form control's valueChanges and
//       auto-unsubscribe when the component is destroyed.
//       This is EXACTLY what your user-form.component.ts does.
//
// Copy of the real pattern from your project:
//
//   this.form.get('name')!.valueChanges.pipe(
//     takeUntilDestroyed(this.destroyRef),
//     map(value => value.toUpperCase())
//   ).subscribe(val => console.log(val));

@Injectable()
export class Ex02Service {
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);

  // Signal-based state (modern Angular — no BehaviorSubject needed)
  readonly results = signal<string[]>([]);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  // Computed signal derived from results (replaces BehaviorSubject + map)
  readonly hasResults = computed(() => this.results().length > 0);
  readonly resultCount = computed(() => this.results().length);

  setupSearch(searchControl: FormControl<string>): void {
    searchControl.valueChanges
      .pipe(
        takeUntilDestroyed(),
        debounceTime(300),
        distinctUntilChanged(),
        tap(() => this.isLoading.set(true)),
        switchMap(term =>
          this.http
            .get<string[]>(`/api/search?q=${term}`)
            .pipe(catchError(() => of([])))
        ),
        tap(() => this.isLoading.set(false))
      )
      .subscribe(sv => this.results.set(sv));
    // TODO 2: wire up the full search pipeline here
    //   - takeUntilDestroyed(this.destroyRef)
    //   - debounceTime(300)
    //   - distinctUntilChanged()
    //   - tap(() => this.isLoading.set(true))    ← loading on
    //   - switchMap with catchError inside        ← HTTP + error recovery
    //   - tap(() => this.isLoading.set(false))   ← loading off
    //   - subscribe: update this.results signal

    /*
     * ✅ ANSWER:
     *
     * searchControl.valueChanges.pipe(
     *   takeUntilDestroyed(this.destroyRef),  // ← cleanup
     *   debounceTime(300),
     *   distinctUntilChanged(),
     *   tap(() => this.isLoading.set(true)),  // ← loading on
     *   switchMap(term =>
     *     this.http.get<string[]>(`/api/search?q=${term}`).pipe(
     *       catchError(() => of([]))
     *     )
     *   ),
     *   tap(() => this.isLoading.set(false)), // ← loading off
     * ).subscribe(data => {
     *   this.results.set(data);               // ← update signal
     * });
     *
     * WHY signals instead of BehaviorSubject?
     * - signal() is simpler: no .next(), no .subscribe(), no .value
     * - Angular templates read signals directly: results() — no async pipe needed
     * - BehaviorSubject still works, but signals are the modern Angular way
     * - In your store: updateState() updates signals, components re-render automatically
     */
  }
}

// ─────────────────────────────────────────────────────────────
// TASK 3 — switchMap vs exhaustMap (login button scenario)
// ─────────────────────────────────────────────────────────────
// GOAL: Prevent a double login call when the user clicks twice.
//       One operator cancels the old request; one ignores the new click.
//       Know WHICH is right for a login form.

interface LoginCredentials {
  email: string;
  password: string;
}
interface AuthToken {
  token: string;
}

function buildLoginHandler(
  clicks$: Observable<LoginCredentials>,
  authService: { login(creds: LoginCredentials): Observable<AuthToken> }
) {
  // TODO 3a: pick the right operator
  //   - switchMap  → cancels PREVIOUS request if user clicks again
  //   - exhaustMap → IGNORES new clicks while current request is in-flight
  //
  // For a login button, which is correct? Why?
  // (Hint: do you want to cancel a login in-progress, or just ignore extra clicks?)

  return clicks$.pipe(exhaustMap(creds => authService.login(creds)));

  /*
   * ✅ ANSWER: exhaustMap
   *
   * return clicks$.pipe(
   *   exhaustMap(creds => authService.login(creds))
   * );
   *
   * WHY exhaustMap for login?
   * switchMap would CANCEL the login request if user clicks again.
   * That means if the user double-clicks, the first request gets aborted
   * and starts fresh — bad for auth.
   *
   * exhaustMap IGNORES the second click while the first request is running.
   * The user just pressed the button twice — we trust the first click.
   *
   * RULE:
   *   switchMap  → search box, pagination (latest click wins)
   *   exhaustMap → login, save buttons (first click wins, ignore rest)
   *   concatMap  → queue actions in ORDER (upload files sequentially)
   *   mergeMap   → parallel, independent (fetch N items by id at once)
   */
}

// ─────────────────────────────────────────────────────────────
// TASK 4 — forkJoin (like Promise.all — load data in parallel)
// ─────────────────────────────────────────────────────────────
// GOAL: On page init, fetch users AND stats in PARALLEL.
//       Only proceed when BOTH have completed.
//       This is the Observable equivalent of Promise.all().

interface User {
  id: string;
  name: string;
}
interface Stats {
  totalUsers: number;
  activeUsers: number;
}

function loadDashboardData(http: HttpClient): Observable<{
  users: User[];
  stats: Stats;
}> {
  // TODO 4: use forkJoin to fetch both endpoints in parallel
  //   http.get<User[]>('/api/users')
  //   http.get<Stats>('/api/stats')
  // Return them as a combined object { users, stats }
  return forkJoin({
    users: http.get<User[]>('/api/users'),
    stats: http.get<Stats>('/api/stats'),
  });

  /*
   * ✅ ANSWER:
   * return forkJoin({
   *   users: http.get<User[]>('/api/users'),
   *   stats: http.get<Stats>('/api/stats'),
   * });
   *
   * forkJoin waits for ALL inner observables to COMPLETE,
   * then emits one combined result.
   *
   * Equivalent to:
   * const [users, stats] = await Promise.all([
   *   fetch('/api/users').then(r => r.json()),
   *   fetch('/api/stats').then(r => r.json()),
   * ]);
   */
}

// ─────────────────────────────────────────────────────────────
// TASK 5 — map + filter chain (what your interceptor does)
// ─────────────────────────────────────────────────────────────
// GOAL: Given a stream of numbers 1-10:
//   1. keep only numbers divisible by 3
//   2. multiply each by 100
//   3. add a € symbol as a string

function transformPrices(): Observable<string> {
  const numbers$ = of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

  return numbers$.pipe(
    filter(v => v % 3 === 0),
    map(v => v * 100),
    map(n => `€${n}`)
    // TODO 5a: filter — keep only numbers divisible by 3
    /* ... */
    // TODO 5b: map — multiply by 100
    /* ... */
    // TODO 5c: map — convert to string with '€' prefix
    /* ... */
  );

  // Expected emissions: '€300', '€600', '€900'

  /*
   * ✅ ANSWER:
   * return numbers$.pipe(
   *   filter(n => n % 3 === 0),
   *   map(n => n * 100),
   *   map(n => `€${n}`),
   * );
   */
}
