# 🟡 Tier 3 — Reactive Patterns

> RxJS and async. Where most senior Angular questions orbit.
> ← Back to [main index](interview_coach_2026.md)

---

## 📋 Contents

1. [Promises vs Observables](#1-promises-vs-observables)
2. [Observables: what they are](#2-observables-what-they-are)
3. [Subscribe and Unsubscribe](#3-subscribe-and-unsubscribe)
4. [async Pipe](#4-async-pipe)
5. [Hot vs Cold Observables](#5-hot-vs-cold-observables)
6. [Subject vs BehaviorSubject](#6-subject-vs-behaviorsubject)
7. [Top RxJS Operators](#7-top-rxjs-operators)
8. [switchMap vs concatMap](#8-switchmap-vs-concatmap)
9. [distinctUntilChanged and debounceTime](#9-distinctuntilchanged-and-debouncetime)
10. [Mutability vs Immutability](#10-mutability-vs-immutability)

---

## 1. Promises vs Observables

### 🗣️ Spoken answer

> "Both handle async, but Observables are strictly more powerful. A Promise: eager — fires immediately on creation; single value; no cancel. An Observable: lazy — only runs when subscribed; multiple values over time; cancellable via unsubscription. In Angular we prefer Observables for HTTP because they compose well with RxJS operators — I can debounce, cancel stale requests with switchMap, or retry. The only time I'd use a Promise is when integrating with third-party APIs that return them, or when the browser API itself returns one — like `fetch`."

### One-liner cheatsheet

- Eager vs Lazy
- One value vs Many
- Not cancellable vs Cancellable
- No operators vs Full RxJS pipeline

### 🎤 Practice question

> _"Why does Angular use Observables instead of Promises for HTTP calls?"_

---

## 2. Observables: what they are

### 🗣️ Spoken answer

> "An Observable is a lazy stream of values over time. Nothing happens until you subscribe to it. Think of it like a function that you call — the Observable is the definition, the subscription is the call. It can emit zero or more values synchronously or asynchronously, and it can complete or error. This is the foundation of Angular's async model — HttpClient, Router events, form value changes — they're all Observables."

### Key points

- **Lazy**: no execution until `.subscribe()`
- **Unicast by default** (cold): each subscriber gets its own independent execution
- Can emit **multiple values** over time (unlike Promises which resolve once)
- Can be **cancelled** via unsubscription

### 🎤 Practice question

> _"What is an Observable and how is it different from a regular function call?"_

---

## 3. Subscribe and Unsubscribe

### 🗣️ Spoken answer

> "You subscribe by calling `.subscribe()` with an observer object or callbacks for `next`, `error`, and `complete`. The critical rule: if the stream never completes on its own — like a Subject or a `fromEvent` on a button — you must unsubscribe, or you leak memory. In modern Angular we use `takeUntilDestroyed()` from `@angular/core/rxjs-interop`, which automatically unsubscribes when the component is destroyed. For HTTP calls, which complete after one emission, you generally don't need to unsubscribe manually."

### Key syntax

```ts
// Basic
const sub = this.service.getUsers().subscribe({
  next: (users) => console.log(users),
  error: (err) => console.error(err),
  complete: () => console.log('done'),
});

// Modern — auto-cleanup
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

source$.pipe(takeUntilDestroyed()).subscribe(val => ...);

// Manual cleanup
sub.unsubscribe();
```

### Gaps to avoid

- Don't say "you always need to unsubscribe" — HTTP observables complete automatically
- Don't forget `takeUntilDestroyed` requires injection context (constructor or field initializer)

### 🎤 Practice question

> _"How do you prevent memory leaks from subscriptions in Angular?"_

---

## 4. async Pipe

### 🗣️ Spoken answer

> "The `async` pipe is an Angular template pipe that subscribes to an Observable or Promise automatically and returns the latest emitted value. When the component is destroyed, it automatically unsubscribes — you don't write a single line of cleanup code. It's the recommended way to consume Observables in templates because it keeps the component class clean: no manual subscribe/unsubscribe, no stored subscription reference. The pattern is `users$ | async` in the template. One important thing: if you use `*ngIf` or `@if` to unwrap it, the template re-renders on every emission."

```html
<!-- In template -->
@if (users$ | async; as users) { @for (user of users; track user.id) {
<app-user-card [user]="user" />
} }
```

```ts
// In component — no subscribe needed
readonly users$ = this.userService.getUsers(); // Observable<User[]>
```

### Gaps to avoid

- With signals you rarely need `async` pipe — just call the signal: `users()`
- `async` pipe in multiple places on the same observable creates multiple subscriptions — use `shareReplay(1)` or `@let` (Angular 18+)

### 🎤 Practice question

> _"What does the `async` pipe do and why is it preferred over manually subscribing in a component?"_

---

## 5. Hot vs Cold Observables

### 🗣️ Spoken answer

> "A **cold** Observable is like a movie on Netflix — every subscriber starts from the beginning and gets their own copy. `HttpClient.get()` is cold: each subscription fires a new HTTP request. A **hot** Observable is like live TV — it's broadcasting regardless of who's watching, and subscribers only see values from the moment they tune in. A Subject is hot. The practical impact: if two components subscribe to the same cold HTTP Observable, you get two HTTP calls. Use `shareReplay(1)` to make it hot and cache the last value."

### Key rule

| Cold                        | Hot                           |
| --------------------------- | ----------------------------- |
| Starts per subscriber       | Shared, ongoing               |
| HttpClient, timer, interval | Subject, fromEvent, WebSocket |
| Isolates each subscriber    | Multicast                     |

### 🎤 Practice question

> _"What's the difference between hot and cold observables? Give me a real example of each."_

---

## 6. Subject vs BehaviorSubject

### 🗣️ Spoken answer

> "The most important difference is: **BehaviorSubject requires an initial value and replays it to new subscribers**. A plain Subject emits nothing to late subscribers — if they subscribe after the last emission, they miss it. BehaviorSubject guarantees that any subscriber immediately gets the current value. That's why we use it for state — you always want new consumers to get the latest value. There's also `ReplaySubject(n)` which replays the last `n` values, and `AsyncSubject` which only emits the last value when complete."

### Table

|                      | Subject | BehaviorSubject | ReplaySubject(n) |
| -------------------- | ------- | --------------- | ---------------- |
| Initial value        | ❌      | ✅ required     | ❌               |
| Late subscriber gets | nothing | last value      | last n values    |
| `.getValue()`        | ❌      | ✅              | ❌               |
| Use case             | events  | state           | logs/history     |

### 🎤 Practice question

> _"When would you use a BehaviorSubject instead of a plain Subject?"_

---

## 7. Top RxJS Operators

### 🗣️ Spoken answer

> "The operators I use most in production are: **map** — transforms each value like Array.map; **filter** — drops values that don't pass a test; **switchMap** — maps to an inner Observable and cancels the previous one, great for search; **debounceTime** — waits for a silence period before emitting, great for input fields; **catchError** — recovers from errors without killing the stream; **takeUntilDestroyed** for cleanup; and **tap** for side effects like logging without touching the value. Each one is a pure function that returns a new Observable."

### Quick map

| Operator               | One-liner                                  |
| ---------------------- | ------------------------------------------ |
| `map`                  | Transform each emission                    |
| `filter`               | Drop emissions that fail a test            |
| `switchMap`            | Flatten + cancel previous inner observable |
| `concatMap`            | Flatten + queue, preserve order            |
| `exhaustMap`           | Flatten + ignore new while busy            |
| `mergeMap`             | Flatten + run all in parallel              |
| `debounceTime(ms)`     | Wait for silence before emitting           |
| `distinctUntilChanged` | Skip if value hasn't changed               |
| `catchError`           | Handle errors, return fallback             |
| `tap`                  | Side effect, passes value through          |
| `takeUntilDestroyed`   | Unsubscribe on component destroy           |
| `shareReplay(1)`       | Make cold observable hot + cache           |

### 🎤 Practice question

> _"Tell me five RxJS operators you've used and what each does."_

---

## 8. switchMap vs concatMap

### 🗣️ Spoken answer

> "These are the two most confused operators. **switchMap** cancels the current inner observable the moment a new outer value arrives — perfect for search typeahead where you don't care about stale results. **concatMap** queues incoming values and processes them in order, waiting for each to complete before starting the next — perfect for sequential writes where order matters, like saving form items one by one. **exhaustMap** is the third sibling: it ignores new values completely while the current one is in flight — you use that for a submit button to prevent double-posting."

### Mental model

- `switchMap` → cancel and replace (search)
- `concatMap` → queue and wait (ordered writes)
- `exhaustMap` → ignore until done (submit buttons)
- `mergeMap` → run all in parallel (fire-and-forget)

### 🎤 Practice question

> _"You have a search input that calls an API on every keystroke. Which RxJS operator do you use and why?"_

---

## 9. distinctUntilChanged and debounceTime

### 🗣️ Spoken answer

> "`debounceTime(300)` waits 300ms after the last emission before letting the value through. If the user types quickly, only the final value after they pause fires — that prevents an API call on every single keystroke. `distinctUntilChanged` suppresses a value that's identical to the previous one — so if the user types 'ab', deletes 'b', then types 'b' again, you don't re-call the API because the query is still 'ab'. You almost always use them together in a search stream."

### Code pattern

```ts
this.searchControl.valueChanges
  .pipe(
    debounceTime(300),
    distinctUntilChanged(),
    switchMap(query => this.api.search(query)),
    takeUntilDestroyed()
  )
  .subscribe(results => this.results.set(results));
```

### 🎤 Practice question

> _"How do you implement a search box that calls the API efficiently?"_

---

## 10. Mutability vs Immutability

### 🗣️ Spoken answer

> "A **mutable** value can be changed in place — arrays and objects in JavaScript are mutable by default. An **immutable** value is never changed — you create a new copy with the modification instead. Immutability matters in Angular because OnPush change detection checks object **references**, not deep equality. If you mutate an array — `arr.push(item)` — the reference is the same and Angular doesn't see a change. If you create a new array — `[...arr, item]` — the reference is new and Angular re-renders. Signals enforce immutability at the API level: you call `.set()` or `.update()` and Angular tracks the change. The same principle is why `const` doesn't make objects immutable — it prevents reassignment of the variable, but the object's properties are still mutable."

```ts
// WRONG with OnPush — mutates, Angular won't detect
this.users.push(newUser); // same array reference

// CORRECT — new reference, Angular detects
this.users = [...this.users, newUser];

// With signals — always correct
this.users.update(list => [...list, newUser]);
```

### 🎤 Practice question

> _"Why does mutating an array cause problems with OnPush change detection?"_

---
