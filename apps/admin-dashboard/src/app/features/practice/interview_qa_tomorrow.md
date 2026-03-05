# 🎯 Interview Q&A — Angular Developer (Tomorrow's Questions)

---

## ⏱️ MORNING STUDY PLAN — ~3 hours before lunch

> **Rule:** Don't try to re-read everything. Read ONE block, close the file, say the answer out loud from memory, reopen and check. Then move on.

---

### 🔴 BLOCK 1 — 20 min | RxJS Core (highest ROI, most likely questions)

These will definitely come up. Know them cold.

| #   | Topic                                                     | Section to read                       |
| --- | --------------------------------------------------------- | ------------------------------------- |
| 1   | **Observable vs Promise** — why not just use Promises?    | [→ jump](#observable-vs-promise)      |
| 2   | **Subject vs BehaviorSubject** — initial value is the key | [→ jump](#subject-vs-behaviorsubject) |

After each one: close file → say it out loud → check.

---

### 🟠 BLOCK 2 — 50 min | NgRx / Redux / State ⚠️ WEAK POINT — spend the most time here

They explicitly asked about this. Read slowly, say each answer out loud before moving on.

| #   | Topic                                                                     | Section to read                                                   |
| --- | ------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| 6   | **Redux pattern** — 3 rules + unidirectional flow diagram                 | [→ jump](#what-is-redux)                                          |
| 7   | **Action/Effect lifecycle** — 8-step sequence                             | [→ jump](#lifecycle-of-actions-and-effects-in-ngrx)               |
| 8   | **Main actors table** — NgRx classic vs your SignalStore                  | [→ jump](#main-actors-in-store-updates)                           |
| 9   | **RxJS operators** — your 1-sentence list (switchMap, debounceTime, etc.) | [→ jump](#operators-you-have-used)                                |
| 10  | **NgRx Classic vs SignalStore code** — side-by-side real code             | [→ jump](#ngrx-classic-vs-your-signalstore--real-code-comparison) |

---

### 🟡 BLOCK 3 — 30 min | JavaScript Fundamentals

Lighter, but they asked every single one.

| #   | Topic                                                           | Section to read                                            |
| --- | --------------------------------------------------------------- | ---------------------------------------------------------- |
| 11  | **Event loop** — chef analogy, microtask vs macrotask           | [→ jump](#event-loop--what-is-it)                          |
| 12  | **JS threads** — 1 thread, then Web Workers + no DOM constraint | [→ jump](#how-many-threads-can-javascript-use)             |
| 13  | **Deferral / async pattern** — 4-era timeline, advantages       | [→ jump](#deferral--old-js-pattern-before-asyncawait)      |
| 14  | **Closures** — backpack mental model, Angular examples          | [→ jump](#what-is-a-closure)                               |
| 15  | **TypeScript compilation** — tsc → Ivy → esbuild, AOT vs JIT    | [→ jump](#how-does-typescript-compilation-work-in-angular) |

---

### 🟢 BLOCK 4 — 40 min | Everything Else (all remaining questions from the list)

**Browser / Network / Internet fundamentals:**

| #   | Topic                                                                         | Section to read / what to say                                                                                                                                             |
| --- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 14  | **google.com → press Enter** — HTTP, DNS, Domain, Hosting, Browser all in one | [→ jump](#how-does-the-internet-work--what-happens-when-you-type-googlecom)                                                                                               |
| 15  | **Prima di caricare la pagina** — browser does DNS prefetch + preconnect      | _Say: "DNS prefetch resolves the domain early, preconnect opens the TCP/TLS connection before the user clicks. You hint at this with `<link rel='preconnect'>` in HTML."_ |
| 16  | **CORS** — 1-sentence + evil.com threat + 3 must-say points                   | [→ jump](#cors--what-is-it)                                                                                                                                               |
| 17  | **Page doesn't load / domain error** — outside-in debug order                 | [→ jump](#se-digiti-wwwgoogleit-nel-browser-e-la-pagina-non-si-carica-cosa-controlleresti----page-doesnt-load)                                                            |

**Angular:**

| # | Topic | Section to read | |
| 22 | **Memoization** — computed() + createSelector, same concept | [→ jump](#do-you-know-memoization) |

---

### Subject vs BehaviorSubject?

**The single most important difference: BehaviorSubject requires an initial value. Subject does not.**

That one requirement has three consequences:

|                        | Subject                      | BehaviorSubject                    |
| ---------------------- | ---------------------------- | ---------------------------------- |
| Initial value          | ❌ none — starts empty       | ✅ required at creation            |
| Late subscriber gets   | nothing (missed past values) | the last emitted value immediately |
| Readable synchronously | ❌                           | ✅ `.getValue()`                   |

> **Why does the initial value matter so much?**
> Because it guarantees the subject **always has a current value**. A late subscriber never gets "nothing" — it always gets _something_ (the last known state). That's why BehaviorSubject is used for **state** and Subject is used for **events**.

**Mental model:**

> Think of **Subject** as a doorbell — it fires once when pressed, and if you weren't at the door, you missed it.
>
> Think of **BehaviorSubject** as a **whiteboard** — it always shows the latest value written on it. Anyone who walks in the room right now can read it immediately. If nothing new has been written, it still shows the initial value.

```ts
// Subject — no initial value, late subscriber misses past emissions
const subject = new Subject<number>();
subject.subscribe(v => console.log('A:', v));
subject.next(1); // A: 1
subject.next(2); // A: 2
subject.subscribe(v => console.log('B:', v)); // B subscribes late — gets nothing yet
subject.next(3); // A: 3, B: 3  — B missed 1 and 2

// BehaviorSubject — MUST have initial value, late subscriber gets last value
const bs = new BehaviorSubject<number>(0); // ← initial value required
bs.subscribe(v => console.log('A:', v)); // A: 0 — immediately gets initial value
bs.next(1); // A: 1
bs.next(2); // A: 2
bs.subscribe(v => console.log('B:', v)); // B: 2 ← gets LAST value right away
bs.next(3); // A: 3, B: 3

console.log(bs.getValue()); // 3 — readable synchronously, anytime
```

> **When to use which:**
>
> - `Subject` → one-time events, fire-and-forget ("user clicked save", "dialog closed")
> - `BehaviorSubject` → state that must always have a value (current user, loading flag, selected tab)

> **In modern Angular:** `signal(0)` replaces BehaviorSubject entirely — same guarantee (always has a value, readable synchronously), but no `.subscribe()`, no cleanup needed, and template reads are automatic.

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

**"But each HTTP call only returns one value — why not just use Promises?"**

This is the right question. For the HTTP call itself in isolation? A Promise would work. **The problem is everything _around_ it:**

```ts
// With Promises — you must implement cancellation, debounce, cleanup yourself:
let latestId = 0;
async function onSearch(term: string) {
  const id = ++latestId;
  // debounce? You'd need setTimeout/clearTimeout manually
  const result = await this.service.search(term);
  if (id !== latestId) return; // cancel stale — you track this manually
  this.results = result;
  // cleanup on destroy? You'd need to track and abort() manually
}

// With Observable — same guarantees, one pipeline:
this.searchControl.valueChanges
  .pipe(
    debounceTime(300), // rate limiting: 1 line
    switchMap(
      (
        term // cancels the previous request automatically
      ) => this.service.search(term)
    ),
    takeUntilDestroyed() // cleanup when component destroys: 1 line
  )
  .subscribe(r => this.results.set(r));
```

> The advantage isn't the single HTTP call — it's that **Observables let you compose multiple async concerns into one pipeline**. Cancellation, debouncing, error isolation, and cleanup each need separate manual logic with Promises. `switchMap` alone replaces ~15 lines of manual cancellation tracking.

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

**The three things are NOT the same — here's the timeline:**

```
ERA 1: ~2006-2013  →  Callbacks         (the original, painful way)
ERA 2: ~2011-2015  →  Deferred pattern  (jQuery's fix — a library pattern)
ERA 3: ~2015       →  Promise           (native language feature, built into the browser)
ERA 4: ~2017       →  async/await       (syntactic sugar on top of Promise, same thing underneath)
```

They solve the **same problem** (async code) but each generation made it simpler. The interviewer asked about "deferral" — they mean ERA 2.

---

**ERA 1 — Callbacks (the problem)**

```js
// You pass the "what to do next" function INTO the async call
login(user, function (err, session) {
  // ← you hand the callback in
  fetchProfile(session.id, function (err, profile) {
    // ← nested
    loadSettings(profile.id, function (err, settings) {
      // ← nested again
      // finally usable — but 3 levels deep, and error handling at every level
    });
  });
});
```

Problem: nesting gets infinite, error handling is repeated at every level, and you can't reuse or compose results.

---

**ERA 2 — Deferred (jQuery's library solution)**

Instead of passing a callback IN, you get a **handle** (the deferred/promise) back OUT. The caller can decide what to do with it later.

```js
function fetchData() {
  const deferred = $.Deferred(); // create the handle

  setTimeout(() => {
    deferred.resolve('data ready'); // when done: signal success
    // or: deferred.reject('error'); // signal failure
  }, 1000);

  return deferred.promise(); // give the caller a "ticket" — they .then() on this
}

// Caller — no callback needed upfront, chain flat instead of nesting:
fetchData()
  .then(data => processIt(data))
  .then(result => display(result))
  .catch(err => handleError(err)); // one catch covers the whole chain
```

The "deferred" object has TWO sides:

- `.promise()` — what you hand to the caller (read-only, subscribe to it)
- `.resolve()` / `.reject()` — what YOU call internally when the work finishes

---

**ERA 3 — Promise (native, browser built-in, ES2015)**

Same concept as Deferred, but the browser does it natively — no jQuery needed.

```js
function fetchData() {
  return new Promise((resolve, reject) => {
    // browser gives you resolve/reject directly
    setTimeout(() => resolve('data ready'), 1000);
  });
}

fetchData()
  .then(data => processIt(data))
  .catch(err => handleError(err));
```

Deferred and Promise are **the same idea** — the difference is Deferred is a jQuery library object, Promise is a native language feature. Promise replaced Deferred entirely.

---

**ERA 4 — async/await (ES2017, syntactic sugar over Promise)**

Does NOT introduce a new mechanism. It's just a cleaner way to write Promise chains:

```js
// Promise chain:
fetchData()
  .then(data => processIt(data))
  .catch(handleError);

// async/await — exactly the same thing underneath, just looks synchronous:
async function run() {
  try {
    const data = await fetchData(); // "wait here, then continue"
    processIt(data);
  } catch (err) {
    handleError(err);
  }
}
```

`await` is just `.then()` in different clothes. The JS engine still uses Promises under the hood.

---

**The one-sentence answer per ERA:**

- Callback: _"pass the handler in, get nothing back"_
- Deferred: _"get a ticket back, attach your handler to the ticket"_ (jQuery)
- Promise: _"same as Deferred but native to the browser"_
- async/await: _"Promise but written like normal synchronous code"_

> **Interview answer:** _"Deferred is jQuery's pre-native solution from ~2011. Instead of passing a callback into the function, you get a handle back — a 'promise' — and attach your `.then()` to it later. That separation means you can chain operations flat instead of nesting, and handle errors in one place. Native `Promise` (ES2015) replaced it — same idea, built into the browser. Then `async/await` (ES2017) gave us cleaner syntax on top of Promises — `await` is just `.then()` written to look synchronous. All three solve the same callback hell problem, each generation just made it simpler."_

### "Che vantaggi puoi avere?" — advantages over raw callbacks

> **1. Flat chains instead of nesting** — `.then().then().catch()` vs infinite nesting
> **2. One error handler** — `.catch()` at the end covers the whole chain vs `if(err)` at every callback level
> **3. Composability** — `Promise.all([a, b])` waits for multiple async operations in parallel; impossible with callbacks

---

```js
// Callback hell — hard to read, hard to handle errors
login(user, function (err, session) {
  if (err) handleError(err);
  fetchProfile(session.id, function (err, profile) {
    if (err) handleError(err);
    loadSettings(profile.id, function (err, settings) {
      if (err) handleError(err);
      // finally do something...
    });
  });
});
```

**What a Deferred IS — the mental model:**

> Imagine you go to a deli counter and they give you a **numbered ticket** while your sandwich is being made. You don't wait at the counter — you go sit down. When your number is called, you come back and get the sandwich.
>
> A **Deferred** is that ticket. It's an object you create and hand back to the caller **before the async work is done**. It has two sides:
>
> - The **promise** (the ticket) — what you give to the caller, so they can `.then()` on it
> - The **resolve/reject methods** (the deli worker's call) — what YOU call later when the work is done

```js
// STEP 1: You create the Deferred — like printing the ticket
function fetchData() {
  const deferred = $.Deferred(); // creates the ticket + the controls

  // STEP 2: Start the async work, but DON'T wait — return immediately
  setTimeout(() => {
    // STEP 3: When work is done, "call the number" to notify anyone waiting
    deferred.resolve('data ready'); // success path
    // OR: deferred.reject('something went wrong'); // error path
  }, 1000);

  // STEP 4: Return the "ticket" — the caller can .then() on this
  return deferred.promise();
}

// The caller gets the ticket and registers what to do when it's done
fetchData()
  .then(data => console.log(data)) // called when resolved
  .catch(err => console.error(err)); // called when rejected
```

**Why this was an improvement over raw callbacks:**

1. **Flat chain** — `.then().then().catch()` instead of nested callbacks
2. **Centralized error handling** — one `.catch()` handles anything in the chain
3. **Return values** — you can store the promise and call `.then()` later, anywhere

**Why it's now obsolete:**

The browser (and Node.js) adopted `Promise` natively in ES2015, then `async/await` in ES2017. No ticket system needed — the language handles the waiting:

```js
// Modern equivalent — no Deferred, no callbacks, just await
async function fetchData() {
  const data = await someApiCall(); // JS engine pauses HERE and resumes when done
  return data; // no callbacks, no resolve/reject
}

try {
  const data = await fetchData();
} catch (err) {
  handleError(err);
}
```

> **Interview answer:** _"Deferred is the pre-Promise pattern from jQuery (~2010). You'd manually create a deferred object, hand back its `.promise()` to the caller, then call `.resolve()` or `.reject()` when your async work finished. The key insight is that it separates the 'ticket' (what you hand the caller) from the 'control' (what you use to complete it). Native Promises and async/await replaced it entirely — the language now does that separation automatically. I'd only encounter it in legacy jQuery codebases."_

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

### How many threads can JavaScript use?

**One.** JavaScript has a single main thread. If you run a heavy synchronous operation (sorting 100,000 records, parsing a large file), the entire UI freezes — no clicks, no animations, nothing can happen while that thread is busy.

> _"JavaScript is single-threaded by design. The event loop processes one thing at a time — that's why blocking the main thread with heavy computation causes the page to freeze completely."_

---

### How can you increase the number of threads? (Web Workers)

**Web Workers** give you real parallel threads outside the main thread.

```ts
// Main thread — spin up a worker
const worker = new Worker('./heavy.worker.js');
worker.postMessage(largeDataset); // send data TO the worker thread
worker.onmessage = e => console.log(e.data); // receive result BACK

// The worker runs in parallel — main thread stays responsive
// Worker thread (heavy.worker.js):
self.onmessage = e => {
  const result = processHeavyData(e.data); // runs in background thread
  self.postMessage(result); // send result back
};
```

**Important constraints:**

- Workers have **no access to the DOM** — they can't touch the UI directly
- Communication is via `postMessage()` only — data is copied (not shared) between threads
- For shared memory you can use `SharedArrayBuffer` + `Atomics` (advanced)

**When would you actually use this — and why not just use a Map/HashMap?**

First, the key question to ask: **is the data already in memory, or does computation itself take long?**

- **If data is already loaded** → a `Map` with O(1) lookup solves it instantly. Synchronous, no Worker needed.
- **If the computation is what's slow** (parsing, transforming, sorting 100k rows) → a `Map` doesn't help because you still have to _build_ it, and building it blocks the main thread. That's when you need a Worker.

**Concrete example — user uploads a 100,000-row CSV:**

```ts
// ❌ No Worker — UI freezes for 2-3 seconds while parsing
const parsed = parseHugeCSV(rawText); // blocks main thread: no clicks, no animations
this.rows.set(parsed);

// ✅ With Worker — UI stays completely responsive
// In the component:
const worker = new Worker(new URL('./csv.worker.ts', import.meta.url));
worker.postMessage(rawText); // send raw text to background thread
worker.onmessage = ({ data }) => {
  this.rows.set(data); // Worker finished — update UI with result
};

// csv.worker.ts (separate thread, NO DOM access)
self.onmessage = ({ data: rawText }) => {
  const rows = rawText.split('\n').map(line => line.split(','));
  // This heavy loop runs in background — main thread is free the entire time
  self.postMessage(rows); // send result back
};

// After the Worker finishes, you can build a Map for O(1) lookups:
// const index = new Map(rows.map(r => [r[0], r])); // id → row
// Worker did the heavy lifting, Map gives you fast access afterward.
```

**The mental model:**

> `Map`/`HashMap` solves **lookup speed** — O(1) vs O(n) access to data already in memory.
> Web Worker solves **computation blocking the UI** — moves expensive work off the main thread.
> They solve different problems. The best solution often uses **both**: Worker to build the data, Map to query it fast.

> _"I haven't used Web Workers in production, but I understand when they're needed. A Map with O(1) lookup is great once data is ready — but if building that data (parsing, sorting, transforming) takes 2 seconds, it still freezes the UI. That's when you offload to a Worker. Map and Worker aren't alternatives — they complement each other."_

---

### What is a closure?

**One sentence:** A closure is a function that **remembers the variables from the scope where it was created**, even after that outer function has finished running.

```ts
function makeCounter() {
  let count = 0; // this variable lives in makeCounter's scope

  return function increment() {
    count++; // increment() closes over 'count' — it remembers it
    return count;
  };
}

const counter = makeCounter(); // makeCounter() is done — but count is NOT gone
counter(); // → 1
counter(); // → 2  ← count is still there, captured in the closure
```

**Mental model:** Think of a backpack. When `increment` is created inside `makeCounter`, it packs `count` into its backpack and carries it everywhere. Even after `makeCounter` exits, `increment` still has its backpack.

**Where you use them without realizing:**

- Every Angular service is a closure — it captures injected dependencies in its constructor scope
- `setTimeout(() => console.log(value), 1000)` — the arrow function closes over `value`
- RxJS operators like `switchMap(term => this.service.search(term))` — closes over `this`

> _"A closure is a function that captures the variables of its surrounding scope at the time it's created. You use them constantly in Angular — any arrow function that references `this.service` or a component property is a closure."_

---

### How does TypeScript compilation work in Angular?

**Two-step process: TypeScript compiler → Angular compiler**

```
Your .ts / .html files
       ↓
  [tsc — TypeScript compiler]
  Checks types, strips type annotations → plain JavaScript
       ↓
  [Angular Compiler (ngc / Ivy)]
  Compiles templates (.html) into JS instructions
  Converts @Component, @Injectable decorators into factory functions
       ↓
  [Bundler — esbuild / webpack]
  Tree-shakes, minifies, splits into chunks → dist/ folder
       ↓
  Browser downloads and runs plain JavaScript
```

**Key points:**

- **TypeScript** only handles types — it has no idea what `@Component` or `*ngIf` means
- **Angular's Ivy compiler** is what understands Angular-specific syntax — it turns your HTML template into JavaScript that creates and updates DOM nodes
- **AOT (Ahead-of-Time)** compilation (production default) — templates compiled at build time. Faster startup, catches template errors at build time
- **JIT (Just-in-Time)** — templates compiled in the browser at runtime. Used in dev mode historically, mostly gone now

> _"TypeScript strips types and becomes JavaScript — that's tsc. Then Angular's Ivy compiler processes the templates and decorators, turning `@Component` and HTML templates into efficient JavaScript factory functions. In production, AOT compiles everything at build time so the browser gets pre-compiled code, which is faster and catches template errors before they ship."_

---

## Browser Internals

### How does the internet work? / What happens when you type `google.com`?

**The full picture — all the layers involved:**

**1. Domain Name** — `google.com` is a human-friendly address. The browser can't use it directly — it needs an IP address.

**2. DNS (Domain Name System)** — translates `google.com` → a numeric IP address. Global network of servers. Browser checks cache first, then asks ISP's DNS if not found.

**3. Hosting** — the server at that IP. Where the actual website files live. Types: shared (cheap, many sites on one server), dedicated (one site, whole server), cloud (e.g. Vercel, AWS).

**4. HTTP** — the language browser and server use to talk. Browser sends a request (`GET /`), server sends back HTML. Stateless — each request is independent. HTTPS = HTTP with encryption.

**5. Browser** — receives the HTML and renders it. Parses HTML → builds the DOM, applies CSS, runs JavaScript, draws pixels on screen.

**Full flow:**

```
1. DNS      — google.com → IP address
2. Connect  — browser connects to that server
3. Request  — browser asks: "give me the page" (HTTP GET)
4. Response — server sends back HTML
5. Render   — browser parses HTML/CSS/JS and draws the page
```

> _"DNS translates the domain to an IP, the browser connects to that server and sends an HTTP request, the hosting server responds with HTML, and the browser renders it — parsing the HTML, applying styles, running JavaScript, and painting the page."_

---

### CORS — what is it?

**One sentence:** CORS is a browser rule that says: _"if your page is on domain A, you can't read data from domain B — unless domain B explicitly gives permission."_

**Why it exists:** Your browser stores cookies and session tokens for every site you're logged into. Without CORS, any website you visit could make requests to those other sites in the background — authenticated as you, without you knowing. Imagine you're logged into your bank and you open some random page: that page's JavaScript could silently call `yourbank.com/api/transfer`, and since your bank cookies are in the browser, the request would go through as if it were you. CORS stops that — the browser won't give the response to a page's JavaScript unless the server explicitly says _"I trust requests from this origin."_

**Our app as the example:**

Your Angular app runs on `localhost:4200`. Your API runs on `localhost:3100`. Different ports = different origin. When the app calls `http://localhost:3100/api/users`, the browser checks: _"did the server say it's OK for port 4200 to read this?"_

If the API doesn't send back this header:

```
Access-Control-Allow-Origin: http://localhost:4200
```

→ the browser **blocks the response**. The request still reached the server, the server still processed it and replied 200 — but the browser throws it away and shows a CORS error in the console.

**The fix is always on the server.** In our Hono API, you'd add a CORS middleware:

```ts
app.use('*', cors({ origin: 'http://localhost:4200' }));
```

Angular can't do anything about it. The browser enforces it, the server solves it.

**The three things to say:**

1. **Browser-only** — CORS is a rule the browser invented and enforces. The server doesn't know about it. If you make the same request from anywhere other than a browser, there is no CORS.
2. **Fix is on the server** — add `Access-Control-Allow-Origin`. Angular can't fix it.
3. **Blocks reading, not sending** — the request goes through, the browser just refuses to give the response to your JS

> _"CORS is a browser security rule. Our Angular app on port 4200 calling our API on port 3100 — different ports mean different origins, so the browser checks for permission headers. If the server doesn't include `Access-Control-Allow-Origin`, the browser blocks the response even if the server returned 200. The fix is always a server-side header — Angular can't do anything about it."_

**Angular-side note (HttpClient headers):**
You can pass custom headers per-request in `HttpClient` — e.g. the `Authorization` token:

```ts
this.http.get('/api/users', {
  headers: new HttpHeaders({ Authorization: `Bearer ${token}` }),
});
```

This doesn't fix CORS. It just sends credentials. If the server isn't configured to allow the `Authorization` header, you'll still get a CORS error.

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

> **This is a Windows / Active Directory question, not a web question.**
> "MS Prompt Domain" means the Windows machine **cannot find or connect to the Active Directory domain controller**.

| Cause                         | What happens                                                                         |
| ----------------------------- | ------------------------------------------------------------------------------------ |
| **DNS failure**               | Machine can't resolve the domain controller's hostname — most common cause           |
| **Network issue**             | Machine is offline or can't reach the internal network (VPN not connected, etc.)     |
| **Domain controller is down** | The AD server itself is unavailable                                                  |
| **Stale/wrong cached creds**  | Windows has cached credentials that no longer match — forces re-authentication       |
| **Machine account expired**   | The computer's account in Active Directory has become untrusted after a long offline |

> _"MS Prompt Domain is a Windows sign-in error — the machine can't locate a domain controller. The most common cause is DNS: if the machine can't resolve the DC's hostname, Windows can't authenticate. You'd check DNS settings, whether the machine is on the right network or VPN, and whether the domain controller itself is reachable."_

---

## Redux Pattern

### What is Redux?

**The problem Redux solves:**

As apps grow, components start mutating shared state in unpredictable ways. Component A changes user data, Component B reads stale data, Component C doesn't know who changed what. Debugging is a nightmare.

Redux enforces three simple rules to make state changes **predictable and traceable**:

```
Rule 1: Single source of truth
        → All app state lives in ONE store object. No scattered local state.

Rule 2: State is read-only
        → You NEVER mutate state directly. The only way to change it is to dispatch an action.

Rule 3: Changes are made with pure functions (reducers)
        → A reducer takes (currentState, action) → returns NEW state. It never mutates.
```

**The core data flow \u2014 always one direction:**

```
User does something
       │
       ▼
  DISPATCH ACTION          store.dispatch(loadUsers({ page: 1 }))
  (a plain object          { type: '[Users] Load Users', page: 1 }
   describing WHAT happened)
       │
       ▼
  EFFECT (optional)        listens for the action, does async HTTP
  (for async work)         dispatches a result action when done
       │
       ▼
  REDUCER                  pure function: (state, action) => newState
  (the only thing that     returns a NEW object \u2014 never mutates
   can update state)
       │
       ▼
  STORE STATE UPDATES      new state stored
       │
       ▼
  SELECTORS RE-COMPUTE     memoized, only run if their input changed
       │
       ▼
  COMPONENTS RE-RENDER     get the new value from the selector
```

**Why this is powerful:**

- Every state change is **logged** (DevTools shows every action + before/after state)
- State changes are **reproducible** \u2014 same actions → same state, always
- You can **time-travel** in DevTools \u2014 replay or undo actions
- Pure reducers are **easy to test**: give them state + action, assert output

> _"Redux is the pattern. NgRx is Angular's implementation of that pattern. The core idea is: no component can silently mutate shared state \u2014 every change is an explicit, logged, replayable action."_

---

## NgRx \u2014 Actions, Effects, Store

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

### NgRx Classic vs Your SignalStore \u2014 Real Code Comparison

Both implement the exact same feature (user CRUD with pagination). Here's what each concept looks like in your actual files.

**1. Defining state**

```ts
// ─── NgRx Classic (users.reducer.ts) ───────────────────────────────────────
export interface UsersState {
  users: User[];
  clonedUsers: Record<string, User>;
  stats: Record<string, number>;
  currentPage: number; pageSize: number; totalItems: number;
  usersLoading: boolean; usersError: string | null;
  addLoading: boolean; addError: string | null;
  // ... one loading+error flag per operation, manually maintained
}

// ─── Your SignalStore (user.store.ts) ───────────────────────────────────────
type State = { users: User[]; clonedUsers: { [id: string]: User }; stats: {...} };
withState(initialState),
withPagination({ initialPage: 1, initialPageSize: 5 }),  // plugin handles pagination fields
withCallState({ collection: 'users' })                    // plugin handles all loading/error flags
```

SignalStore uses plugins to avoid repeating boilerplate state fields for every operation.

---

**2. Triggering an operation**

```ts
// ─── NgRx Classic ───────────────────────────────────────────────────────────
// In users.actions.ts:
export const loadUsers = createAction('[Users] Load Users', props<{ page?: number; size?: number }>());

// In component:
this.store.dispatch(loadUsers({ page: 1, size: 5 }));

// ─── Your SignalStore ────────────────────────────────────────────────────────
// In component:
this.store.loadUsers({ page: 1, rows: 5 });
// loadUsers IS the method directly \u2014 no action object needed
```

---

**3. Handling async work (the most important part)**

```ts
// ─── NgRx Classic (users.effects.ts) ───────────────────────────────────────
loadUsers$ = createEffect(() =>
  this.actions$.pipe(           // listen to ALL dispatched actions globally
    ofType(UsersActions.loadUsers),
    debounceTime(300),
    switchMap(({ page = 1, size = 5 }) =>
      this.usersService.getUsers(page, size).pipe(
        map(response => UsersActions.loadUsersSuccess({ ...response })), // dispatch success action
        catchError(err => of(UsersActions.loadUsersFailure({ error })))  // dispatch failure action
      )
    )
  )
);

// ─── Your SignalStore (user.store.ts) ────────────────────────────────────────
const loadUsers = rxMethod<PaginatorState | void>(
  pipe(                         // same operators, but self-contained in the method
    tap(() => setUsersLoading()),
    debounceTime(300),
    switchMap(({ page = 1, rows = 5 } = {}) =>
      userService.getUsers(page, rows).pipe(
        tapResponse({
          next: response => { updateState(...); setUsersLoaded(); }, // update state directly
          error: err => { toast.error(...); setUsersError(...); }    // no action dispatch needed
        })
      )
    )
  )
);
```

Key difference: In NgRx classic, the effect dispatches **action objects** and the reducer handles the state. In your store, `rxMethod` updates state **directly** via `updateState()` \u2014 no middleman.

---

**4. Updating state**

```ts
// ─── NgRx Classic (users.reducer.ts) ───────────────────────────────────────
(on(UsersActions.loadUsersSuccess, (state, { users, totalItems, currentPage, pageSize }) => ({
  ...state, // spread old state (NEVER mutate directly \u2014 Redux rule)
  users,
  totalItems,
  currentPage,
  pageSize,
  usersLoading: false,
  usersError: null,
})),
  // ─── Your SignalStore (user.store.ts) ────────────────────────────────────────
  updateState(state, 'Users: Load Success', {
    users: response.data,
    currentPage: page,
    pageSize: rows,
    totalItems: response.meta.totalItems,
  }));
setUsersLoaded(); // sets the loading flag via withCallState
```

Same concept \u2014 different syntax. Both produce a new state object.

---

**5. Derived/computed state**

```ts
// ─── NgRx Classic (users.selectors.ts) ─────────────────────────────────────
export const selectHasUsers = createSelector(
  selectAllUsers,
  users => users.length > 0 // memoized: only re-runs if selectAllUsers changes
);

// In component: this.store.select(selectHasUsers) → Observable<boolean>

// ─── Your SignalStore (user.store.ts) ────────────────────────────────────────
withComputed(({ users }) => ({
  hasUsers: computed(() => users().length > 0), // memoized: only re-runs if users() changes
}));

// In component: this.store.hasUsers() → boolean  (synchronous, no subscribe needed)
```

---

**6. Sync operations (no HTTP)**

```ts
// ─── NgRx Classic ───────────────────────────────────────────────────────────
// Action in users.actions.ts:
export const startEditing = createAction('[Users] Start Editing', props<{ user: User }>());

// Reducer handles it directly (NO effect \u2014 pure sync, no async needed):
on(UsersActions.startEditing, (state, { user }) => ({
  ...state,
  clonedUsers: { ...state.clonedUsers, [user.id]: structuredClone(user) },
})),

// ─── Your SignalStore (user.store.ts) ────────────────────────────────────────
// Just a regular method \u2014 no rxMethod, no action, no reducer:
const startEditing = (user: User) => {
  updateState(state, 'User: Start Editing', {
    clonedUsers: { ...state.clonedUsers(), [user.id]: structuredClone(user) },
  });
};
```

---

**The big picture summary:**

| Concept           | NgRx Classic                                   | Your SignalStore                   |
| ----------------- | ---------------------------------------------- | ---------------------------------- |
| State shape       | `interface` + `initialState` + `createReducer` | `withState()` + plugins            |
| Trigger operation | `store.dispatch(action)`                       | call method directly               |
| Async/HTTP        | `createEffect` in separate class               | `rxMethod` inside store            |
| Update state      | `on(action, reducer fn)` → new object          | `updateState(state, label, patch)` |
| Derived state     | `createSelector` → Observable                  | `withComputed` → Signal            |
| Read in component | `store.select(selector).subscribe()`           | `store.signalName()`               |
| Boilerplate       | High — 4 files per feature                     | Low — 1 file                       |
| DevTools          | Redux DevTools                                 | `withDevtools('Users Store')`      |
| Debugging         | Every action logged by name                    | Every `updateState` label logged   |

> _"Both implement the same Redux unidirectional data flow: trigger → async work → state update → UI re-renders. SignalStore just collapses the 4-file structure into one, and replaces Observable subscriptions with signals you read directly."_

---

### Redux DevTools — browser debugging

**Install:** Chrome/Firefox extension → "Redux DevTools"

Once installed, open DevTools → "Redux" tab.

**What you see with NgRx Classic:**

- Every dispatched action appears in the left panel by name: `[Users] Load Users`, `[Users] Load Users Success`
- Click any action → see the **exact state diff** (what changed)
- **Time-travel**: click any past action → the state rewinds to that point
- See the full state tree at any moment

**What you see with SignalStore + `withDevtools('Users Store')`:**

- Every `updateState(state, 'label', patch)` call appears as an action by its label: `Users Store/User: Load Users Success`
- Same state diff and time-travel — same DevTools experience
- The string in `withDevtools('Users Store')` is the namespace prefix you see in the panel

**In your project:**

```ts
// user.store.ts — this line wires up the DevTools:
(withDevtools('Users Store'),
  // Then every updateState call becomes a logged action:
  updateState(state, 'User: Load Users Success', { users: result.content }));
// → shows as: "Users Store/User: Load Users Success" in DevTools
```

> _"I use Redux DevTools to debug state transitions. If a user list isn't updating, I open the Redux tab, find the last dispatched action, and check the state diff — I can see immediately whether the state was actually updated or whether the component isn't reading from the right signal."_

---

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

> **Browser-side Windows Integrated Auth failure.** The server expects NTLM/Kerberos (`401 WWW-Authenticate: Negotiate`) and the browser can't complete the handshake.

1. **Off VPN / wrong network** — machine can't reach the domain controller to get a Kerberos ticket
2. **DNS failure** — browser can't resolve the corporate API hostname
3. **Stale cached credentials** — browser presents wrong domain creds, server rejects them
4. **Machine not domain-joined** — no domain identity to present
5. **Ticket expired** — Kerberos session expired, re-auth required

> _"It's a Windows Integrated Auth error in the browser — the server demands NTLM or Kerberos but the browser can't complete it. First check VPN, then clear cached credentials."_

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

### "Cos'è la cosa più importante?" — What is the most important thing?

> This question **follows after CORS** in the list, so they're asking: what's the most important thing to know about CORS?
>
> _"The most important thing is that **CORS is enforced by the browser, not the server**. That means if you get a CORS error, the fix is always on the **server side** — adding the right `Access-Control-Allow-Origin` headers. The Angular app itself cannot fix a CORS error. Non-browser tools never show CORS errors because they're not subject to browser security policies."_

---
