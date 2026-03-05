# 🎯 Interview Q&A — Angular Developer (Tomorrow's Questions)

---

## RxJS

### Subject vs BehaviorSubject?

Both are **multicast Observables** — they let you push values to multiple subscribers. The difference is about **initial value and replay**:

**Subject** — no initial value, no replay. Subscribers only get values emitted _after_ they subscribe.

```ts
const subject = new Subject<number>();
subject.subscribe(v => console.log('A:', v));
subject.next(1); // A: 1
subject.next(2); // A: 2
subject.subscribe(v => console.log('B:', v)); // B subscribes late
subject.next(3); // A: 3, B: 3  — B missed 1 and 2
```

**BehaviorSubject** — requires an initial value, replays the _last emitted value_ to any new subscriber immediately.

```ts
const bs = new BehaviorSubject<number>(0); // initial: 0
bs.subscribe(v => console.log('A:', v)); // A: 0 immediately
bs.next(1); // A: 1
bs.next(2); // A: 2
bs.subscribe(v => console.log('B:', v)); // B: 2 ← gets last value right away
bs.next(3); // A: 3, B: 3

// You can also read the current value synchronously:
console.log(bs.getValue()); // 3
```

> **When to use which:**
>
> - `Subject` → event bus, fire-and-forget events (e.g. "user clicked save")
> - `BehaviorSubject` → state that must always have a current value (e.g. current user, loading flag)

> **In modern Angular:** both are replaced by `signal()`. `signal(0)` is basically a BehaviorSubject — it has a current value, you can read it synchronously with `mySignal()`, and consumers (computed, templates) update automatically. No `.subscribe()`, no manual cleanup needed.

---

### Operators you have used?

> _"In my project I use `switchMap` for HTTP calls triggered by user events (it cancels the previous request if a new one starts), `debounceTime` to rate-limit search inputs, `distinctUntilChanged` to skip duplicate values, `catchError` scoped inside each switchMap to recover per-request without killing the outer stream, `tap` for side effects like setting loading state, `forkJoin` to make parallel HTTP calls and wait for all to complete, `takeUntilDestroyed` for cleanup, and `map`/`filter` for transformations."_

---

### Observable vs Promise?

|             | Promise             | Observable                   |
| ----------- | ------------------- | ---------------------------- |
| Starts      | Immediately (eager) | Only when subscribed (lazy)  |
| Values      | **One, then done**  | **Many, over time (stream)** |
| Cancellable | ❌                  | ✅ (unsubscribe)             |
| Operators   | `.then().catch()`   | `pipe(map, filter, ...)`     |

**What does "many values" actually mean?**

A Promise is like ordering a pizza — you place one order, you get one delivery, it's done.

An Observable is like a TV channel subscription — it keeps sending you things over time. You can cancel (unsubscribe) whenever you want.

**Concrete examples from your project:**

```ts
// ❌ Promise-brained thinking:
//    "I ask → I get one answer → done"

// ✅ Observable = a STREAM of events over time

// 1. The user types in a search box:
//    Every keystroke is a new value on the stream
this.searchControl.valueChanges   // emits: 'a', 'an', 'ang', 'angu', 'angul'...
  .pipe(
    debounceTime(300),            // waits for typing to pause
    switchMap(term => this.service.search(term)) // each value triggers HTTP
  )

// 2. Your paginators in user.store.ts:
//    Every time the user clicks a page → new value on the rxMethod stream
loadUsers(paginatorState)  // called many times, each page click = one emission

// 3. HTTP itself is a single-value Observable (emits once, then completes)
//    BUT — wrapping it in switchMap makes it work like a stream:
this.actions$.pipe(
  ofType(loadUsers),   // listens FOREVER for this action
  switchMap(...)       // each new action = new HTTP call
)
// This stream NEVER completes — it waits for the next loadUsers action
```

**The key mental image:**

```
Promise:     ──────────────●  (one result, then done)
Observable:  ────●──────●──────●──────●──●──  (values over time, you decide when to stop)
```

> _"A single `this.http.get()` actually emits ONE value, like a Promise. The Observable power comes from the pipeline around it — `debounceTime`, `switchMap`, `takeUntilDestroyed`. These let me react to a continuous stream of user actions (typing, clicking pages, navigating) and automatically cancel previous in-flight requests."_

---

## Angular

### Change Detection Strategy?

> `ChangeDetectionStrategy.OnPush` — Angular only re-renders the component when:
>
> 1. An `@Input()` reference changes
> 2. An event inside the component fires
> 3. An Observable/Signal it's subscribed to emits

```ts
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
})
```

> _"I use OnPush everywhere in my project. Combined with signals, the component only re-renders when state actually changes — not on every parent change detection cycle. It's a significant performance improvement for large trees."_

---

### What advantages have Signals brought?

> _"Three main things:"_
>
> 1. **Fine-grained reactivity** — only components that read a changed signal re-render. No zone.js, no full tree check.
> 2. **No async pipe** — templates read signals directly with `mySignal()`, no `| async` needed.
> 3. **Simpler state** — `signal()`, `computed()`, `effect()` replace BehaviorSubject, combineLatest, and subscription management. Less boilerplate.

---

### Do you know memoization?

> Memoization = **cache the result of a function based on its inputs. Only re-compute when inputs changes.**

```ts
// NgRx createSelector is memoized:
const selectActiveUsers = createSelector(
  selectAllUsers,
  users => users.filter(u => u.status === 'active')
  // ↑ only re-runs if selectAllUsers changes
);

// Angular signal computed() is also memoized:
const activeCount = computed(() => users().filter(u => u.status === 'active').length);
// ↑ only re-runs if users() changes
```

> _"In my project, `withComputed()` in the SignalStore creates memoized derived state — same concept as NgRx selectors. Angular's `computed()` only re-evaluates when its signal dependencies change."_

---

### "Deferral" — old JS pattern before async/await

This is the **old way to handle async** before `Promise` and `async/await` existed. Libraries like jQuery used `$.Deferred()` to create a manually-resolved promise-like object.

```js
// OLD pattern (jQuery era, ~2010-2015)
function fetchData() {
  const deferred = $.Deferred();
  setTimeout(() => {
    deferred.resolve('data ready'); // manually signal success
  }, 1000);
  return deferred.promise(); // return the "promise"
}
fetchData().then(data => console.log(data));

// MODERN equivalent — you don't need deferred anymore:
async function fetchData() {
  const data = await someApiCall();
  return data;
}
```

> **Why it's obsolete:** Native `Promise` + `async/await` (ES2017) replaced it entirely. Deferred was a workaround for the lack of language-level async support. You'd only see it in legacy codebases.

> **Interview answer:** _"That's the old pre-Promise pattern from libraries like jQuery. You'd create a Deferred object, manually call `.resolve()` or `.reject()`, and return its `.promise()`. It's fully replaced by `async/await` and native Promises today. I've never needed it in modern Angular."_

### "Che vantaggi puoi avere?" — follow-up: what advantages does the async/deferred pattern give you?

The interviewer is asking: what do you gain by using async patterns (Deferred/Promise/async-await) instead of raw callbacks?

> **1. Escape callback hell** — callbacks nest infinitely, async chains stay flat:
>
> ```js
> // Callback hell ❌
> login(user, () =>
>   fetchProfile(id, () =>
>     loadSettings(id, () => {
>       /* ... */
>     })
>   )
> );
>
> // Promise chain ✅
> login(user).then(fetchProfile).then(loadSettings).catch(handleError);
>
> // async/await ✅✅
> const profile = await login(user);
> await loadSettings(profile.id);
> ```
>
> **2. Centralized error handling** — one `.catch()` handles errors from the entire chain. Callbacks need error params at every level.
>
> **3. Composability** — `Promise.all([a, b, c])` to wait for multiple, `Promise.race()` for first-to-resolve. Can't do that with pure callbacks.

---

## JavaScript

### Event Loop — what is it?

JavaScript has **one thread** — it can only do one thing at a time. The event loop is what manages "what runs next."

```
Imagine a chef (JS engine) with two queues of orders:

  COUNTER (microtasks): Promise.then, async/await continuations  ← served FIRST, immediately
  TABLE   (macrotasks): setTimeout, DOM events, HTTP callbacks    ← served AFTER counter is empty

After each dish (sync code), chef checks the counter FIRST, empties it completely,
then takes ONE order from the table, then back to the counter, repeat.
```

**The quiz question:** `setTimeout(fn, 0)` — does it run immediately?

> **No.** It goes to the macrotask queue. Any `Promise.then()` runs before it, even if the Promise was created after.

---

### How many threads can JavaScript use + Web Workers?

**One thread.** If you run a heavy loop (sorting 100,000 records), the UI freezes — nothing can update because the single thread is busy.

**Web Workers = extra threads.**

```ts
// Give heavy work to a background thread:
const worker = new Worker('./heavy.worker.js');
worker.postMessage(largeDataset); // send data to worker thread
worker.onmessage = e => console.log(e.data); // get result back
// Meanwhile, the UI stays responsive — the worker runs in parallel
```

**When would YOU use this as a coder?**

- Processing a large CSV the user uploads
- Running a complex sort/filter on 10k+ items
- Real-time data transformation (telemetry, charts)
- Image processing in-browser

_"I haven't used Web Workers in production, but I know they're the solution when a JS operation is blocking the UI thread. You offload the heavy work to a Worker thread and get the result back via postMessage."_\_

---

## Browser Internals

### What happens when you type `google.com` and press Enter?

**Simple 5-step answer** (memorise this sequence):

```
1. DNS     — "google.com" → browser asks DNS: what's the IP? → 142.250.x.x
2. Connect — browser opens a TCP connection to that IP (+ TLS handshake for HTTPS)
3. Request — browser sends HTTP GET request: "give me the homepage"
4. Response — server sends back HTML
5. Render  — browser parses HTML, loads CSS/JS, draws pixels on screen
```

That's the full journey: **name → address → connect → ask → receive → show**.

### Before loading the page, does the browser do anything to speed up?

Yes — **prefetching/preconnecting:**

- **DNS prefetch** — browser pre-resolves a domain name before you click a link
- **Preconnect** — opens the TCP+TLS connection early (saves ~100-300ms)
- **Preload** — downloads a critical resource (font, main JS) immediately
- **Browser prediction** — Chrome pre-renders pages from your history in the background

As a dev you add hints in HTML:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" /> <link rel="preload" href="main.js" as="script" />
```

---

### CORS — what is it?

> **Cross-Origin Resource Sharing.** A browser security mechanism that blocks JavaScript from reading responses from a different origin (domain/port/protocol) unless the server explicitly allows it.

```
Origin: https://myapp.com
Fetches: https://api.otherdomain.com/users  ← different origin → CORS check

Server must respond with:
  Access-Control-Allow-Origin: https://myapp.com  ← allow this origin
  Access-Control-Allow-Methods: GET, POST          ← allow these methods
```

> **The most important thing about CORS (= "Cos'è la cosa più importante?" follow-up):**
>
> - CORS is **browser enforcement only** — `curl` and Postman are unaffected
> - The browser sends a **preflight OPTIONS request** for non-simple requests (PUT, DELETE, custom headers) before the real one
> - **It's a server-side fix** — the backend must set the headers. The Angular app can't fix CORS by itself.

---

### "Se digiti www.google.it nel browser e la pagina non si carica, cosa controlleresti?" — Page doesn't load?

Work **outside-in**: start from the network, end at the code.

```
1. NETWORK      → Is there internet at all? Try another site.
                  Open DevTools → Network tab: is the request even being made?
                  HTTP status? 404, 500, 502, ERR_CONNECTION_REFUSED?

2. SERVER       → Is the server running? Check server logs.
                  502 Bad Gateway = server up, app behind it is down.
                  504 Gateway Timeout = app responding too slowly.

3. ANGULAR ROUTER → Does the route exist in app.routes.ts?
                    Is the lazy-loaded chunk downloading? (check Network tab for .js)
                    Did a route guard block the navigation?
                    Any error in the browser console?

4. CODE         → ngOnInit throwing? HTTP call failing silently?
                  Check console for uncaught errors.

5. ENVIRONMENT  → Prod only? Check env variables (base URL, API keys).
                  SPA on hard refresh? Server must serve index.html for all paths.
```

> _"I start with the DevTools Network tab — if the request isn't even going out, it's client-side. If it goes out but returns 500, it's the server. If the page loads but content is missing, I check the Angular router and guards."_

---

### "Se ricevi un errore legato al dominio ('MS Prompt Domain'), da cosa potrebbe dipendere?" — Domain-related error?

> They're describing a browser error related to a domain mismatch. Most likely causes:

| Cause                       | What it looks like                                                                    |
| --------------------------- | ------------------------------------------------------------------------------------- |
| **CORS**                    | `Access to fetch blocked by CORS policy` — API domain doesn't allow your app's origin |
| **Mixed content**           | HTTPS page loading an HTTP resource — browser blocks it                               |
| **Wrong API domain in env** | Environment config points to wrong URL (staging vs prod, HTTP vs HTTPS)               |
| **Expired SSL certificate** | `NET::ERR_CERT_DATE_INVALID` — HTTPS fails                                            |
| **DNS mismatch**            | Domain resolves to wrong IP — old DNS cache or misconfigured record                   |

> _"First thing I'd do: open the browser console and Network tab. The browser always tells you the exact error type — whether it's CORS, a certificate problem, or a connection failure. Then I'd verify the API base URL in the Angular environment config matches where the backend actually is."_

---

## Personal / Soft Questions

### What is the most important thing you've worked on?

> Prep a 2-minute answer: pick your best project, say what problem it solved, what role you played, what was the technical challenge. Practice it out loud.

### What is the most difficult thing you've faced technically?

> Prep an honest answer: describe the problem, your debugging approach, the solution, what you learned. "Managing complex async state with race conditions across pagination, add, delete operations — solved by moving to NgRx SignalStore with `rxMethod` and `switchMap` to cancel in-flight requests automatically."

---

## Practical Exercise — What to Expect

Almost certainly one of:

1. **Search component** with Observable pipeline (debounce + switchMap + error handling)
2. **Reactive form** with custom validator
3. **Simple store** or service with signal state
4. **@for loop** or `@if` block with data from a service

**Your strongest answer is the search pipeline from ex02.** If they give you a blank component, start with:

```ts
readonly form = inject(NonNullableFormBuilder).group({ search: [''] });
readonly results = signal<string[]>([]);

ngOnInit() {
  this.form.get('search')!.valueChanges.pipe(
    takeUntilDestroyed(this.destroyRef),
    debounceTime(300),
    distinctUntilChanged(),
    switchMap(term => this.service.search(term).pipe(catchError(() => of([]))))
  ).subscribe(r => this.results.set(r));
}
```

> That covers: Observables, operators, signals, reactive forms, cleanup — in ~10 lines.

---

## NgRx — Actions, Effects, Store

### Projects + NgRx experience?

> _"My main project is an admin dashboard SPA: data tables with pagination, CRUD for users, JWT auth, REST API integration. For state I use **NgRx SignalStore** — the modern signals-based API. I understand classical NgRx too: I've written the equivalent Actions/Reducer/Effects/Selectors for my store as a study exercise."_

---

### Lifecycle of Actions and Effects in NgRx?

```
1. Component dispatches an Action        store.dispatch(loadUsers({ page:1 }))
2. Effect listens (ofType)               actions$.pipe(ofType(loadUsers), ...)
3. Effect does async work (HTTP)         switchMap → this.service.getUsers()
4. Effect dispatches result Action       → loadUsersSuccess({ users })
5. Reducer receives it (on())            on(loadUsersSuccess, (s,a) => ({...s, users:a.users}))
6. Store state updates
7. Selector re-computes                  createSelector re-runs projection
8. Component re-renders                  new value pushed to template
```

> In SignalStore: Effect = `rxMethod()`, Reducer = `updateState()`, Selector = `withComputed()`.

---

### Main actors in Store updates?

| Actor                 | Classical NgRx                        | Your SignalStore                   |
| --------------------- | ------------------------------------- | ---------------------------------- |
| **Trigger**           | `store.dispatch(action)`              | `store.loadUsers(payload)`         |
| **Async work**        | `Effect` + `ofType` + `switchMap`     | `rxMethod` + `switchMap`           |
| **State mutation**    | `Reducer` — `on(action, ...)`         | `updateState(state, label, patch)` |
| **Derived state**     | `Selector` — `createSelector`         | `withComputed` — `computed()`      |
| **Read in component** | `store.select(selector)` → Observable | `store.signalName()` → Signal      |

---

### When/why is RxJS used in Angular?

> RxJS is everywhere in Angular because async operations return Observables:
>
> - **HTTP** — `HttpClient.get()` returns `Observable<T>`
> - **Forms** — `formControl.valueChanges` is an Observable
> - **Router** — `router.events`, `activatedRoute.params` are Observables
> - **Custom events** — search pipelines, websockets, polling

> _"I use it primarily for HTTP calls with `switchMap` for cancellation and `debounceTime` for rate-limiting, and for form `valueChanges` with `takeUntilDestroyed` for cleanup."_

---

## Performance Strategies

### How would you improve Angular app performance?

> Say 3-4 of these — you have all of them in your project:

| Strategy            | What it means                                            | In your project           |
| ------------------- | -------------------------------------------------------- | ------------------------- |
| `OnPush`            | Only re-render when inputs/signals change                | ✅ used everywhere        |
| **Signals**         | Fine-grained reactivity, no zone.js full tree            | ✅ SignalStore            |
| `trackBy` / `track` | Avoid full DOM re-render in @for loops                   | `track user.id`           |
| `@defer`            | Lazy-load heavy components                               | `@defer (on viewport)`    |
| Lazy routes         | Load feature modules only when navigated to              | `loadComponent` in routes |
| Memoized selectors  | `computed()` / `createSelector` — only re-runs on change | ✅ `withComputed()`       |
| HTTP caching        | Map/cache for pagination pages                           | HashMap pattern (ex06)    |

---

### How are component updates triggered?

**Default (zone.js):** Any async event (click, HTTP, setTimeout) triggers Angular to check the ENTIRE component tree.

**OnPush:** Angular only checks the component if:

1. A signal it reads changes
2. An `@Input()` gets a new object reference
3. An async pipe emits
4. An event from inside the component fires

**Signals (zoneless):** Even more granular — only components that actually called `mySignal()` in their template re-render. Angular doesn't even need zone.js.

> _"In my project everything is OnPush + signals. When a user is updated in the store, only the component whose template reads `store.users()` re-renders — nothing else."_

---

## Domain Error ("MS Prompt Domain")

### "You receive a domain-related error — what could cause it?"

> This likely means one of:

1. **CORS** — your app is on `app.example.com`, API is on `api.other.com` → browser blocks it. Fix: server adds `Access-Control-Allow-Origin` header.
2. **Mixed content** — HTTPS page loading HTTP resource. Browser blocks it.
3. **Wrong base URL** — API URL in environment config points to wrong domain.
4. **Expired SSL cert** — HTTPS fails because certificate is invalid.
5. **DNS mismatch** — domain doesn't resolve to expected IP (misconfigured DNS, old cache).

> _"First I'd check the browser console — it usually tells you exactly which domain caused the error and whether it's CORS, mixed content, or a certificate issue. Then I'd check the network tab to see the full request/response."_

---

## Angular Modern Features

### Signals + Angular 21?

> _"Signals are Angular's answer to fine-grained reactivity — like React's hooks but more integrated. Three key APIs:"_

```ts
const count = signal(0); // writable signal
const doubled = computed(() => count() * 2); // memoized derived signal
effect(() => console.log(count())); // side effect when signal changes
```

> _"Angular 21 extended this with:"_
>
> - **`resource()`** — signal that fires an async function and tracks loading/error state
> - **`httpResource()`** — like resource() but wired to HttpClient directly
> - **`linkedSignal()`** — a writable signal that resets when a source signal changes
> - **Signal inputs/outputs** — `input()`, `output()`, `model()` replace `@Input()` / `@Output()`

---

### New control flow structures (Angular 17+)?

> Before: structural directives (`*ngIf`, `*ngFor`, `*ngSwitch`)
> After: built-in block syntax — faster, no imports needed, better type narrowing

```html
<!-- @if / @else if / @else — replaces *ngIf -->
@if (user.role === 'admin') {
<app-admin-panel />
} @else if (user.role === 'user') {
<app-dashboard />
} @else {
<app-login />
}

<!-- @for — replaces *ngFor, track is MANDATORY -->
@for (user of users(); track user.id) {
<app-user-card [user]="user" />
} @empty {
<p>No users found.</p>
<!-- built-in empty state — no extra *ngIf needed! -->
}

<!-- @switch — replaces *ngSwitch -->
@switch (status) { @case ('active') { <span class="green">Active</span> } @case ('inactive') { <span class="red">Inactive</span> } @default { <span>Unknown</span> } }

<!-- @defer — replaces manual lazy loading -->
@defer (on viewport) {
<app-heavy-chart />
} @placeholder { <app-skeleton /> }
```

> **Key advantage of `@for` over `*ngFor`:** `@empty` block is built in — no need for a separate `*ngIf="users.length === 0"`. Also `track` is required, which enforces performance best practice.

---

## ❓ Remaining Questions (Not Yet Covered)

### "Ha usato anche altri linguaggi?" — Other languages?

> _"My main language is TypeScript, which is a superset of JavaScript — so yes, JavaScript daily. For the backend API in my project I use Node.js with Hono (a lightweight HTTP framework), so I'm comfortable with server-side JS too. I've read C# and .NET code but haven't written production .NET."_

---

### "Hai visto la parte del JDx?" — Have you seen the JD / tech spec?

> This is asking if you've read the **job description** carefully (JD = Job Description).
> _"Yes, I've read the requirements carefully. The parts that align most with my experience are [mention 2-3 specific things from the JD — Angular, NgRx, RxJS, TypeScript]."_

---

### "Usavate la stessa versione di Angular?" — Same Angular version in the team?

> They want to know if your team had a consistent Angular version or if you worked across versions.
> _"Yes, we kept the project on a consistent version. We are currently on Angular 21. I've also seen projects on Angular 16-17 during the transition period to standalone components and signals. Version alignment matters for consistent APIs — for example, control flow syntax (`@if`, `@for`) requires Angular 17+."_

---

### "Hai usato JavaScript?" — Have you used JavaScript?

> _"TypeScript is my primary language, which compiles to JavaScript. So yes — everything I write is JavaScript at runtime. I understand closures, prototypes, the event loop, and async patterns (Promises, async/await). The browser runs JavaScript, not TypeScript."_

---

### "Cos'è la cosa più importante?" — What is the most important thing?

> This question **follows after CORS** in the list, so they're asking: what's the most important thing to know about CORS?
>
> _"The most important thing is that **CORS is enforced by the browser, not the server**. That means if you get a CORS error, the fix is always on the **server side** — adding the right `Access-Control-Allow-Origin` headers. The Angular app itself cannot fix a CORS error. And `curl`/Postman will never show CORS errors because they're not browsers."_

---

### "Ti è mai capitato di vedere applicativi .NET?" — Ever seen .NET applications?

> _"Yes — I've worked alongside .NET backends. The Angular app consumed REST APIs built in ASP.NET Core. I could read C# code to understand the API contracts and data models, and I've debugged integration issues between the Angular frontend and .NET backend (mostly CORS config and authentication token handling). I haven't written .NET myself."_

---

### "Cos'è la cosa più difficile che hai dovuto affrontare?" — Hardest technical challenge?

> Prep your own answer — but a strong template:
> _"Managing complex async state with race conditions: when a user rapidly changes pagination, multiple HTTP requests were in-flight simultaneously. I solved it by using NgRx SignalStore with `rxMethod` + `switchMap`, which automatically cancels the previous request when a new one starts. I also added per-operation loading/error state (`withCallState`) so any operation failure doesn't affect the others."_

---

### "Dove risiedi?" — Where do you live?

> Personal — just answer honestly.
