# 🟠 Tier 4 — Advanced Angular

> Where senior devs get separated from mid-level. Know the why.
> ← Back to [main index](interview_coach_2026.md)

---

## 📋 Contents

1. [Signals](#1-signals)
2. [Writable vs Read-only Signals](#2-writable-vs-read-only-signals)
3. [computed() & linkedSignal()](#3-computed-linkedsignal)
4. [effect()](#4-effect)
5. [Change Detection — OnPush](#5-change-detection-onpush)
6. [Zone.js & Zoneless](#6-zonejs-zoneless)
7. [Interceptors](#7-interceptors)
8. [Eager vs Lazy Loading](#8-eager-vs-lazy-loading)
9. [@defer](#9-defer)
10. [@for Cycle Syntax](#10-for-cycle-syntax)
11. [Shadow DOM](#11-shadow-dom)
12. [View Encapsulation — Plain English](#12-view-encapsulation-plain-english)
13. [Runtime Error Examples](#13-runtime-error-examples)
14. [Error Handling](#14-error-handling)

---

## 1. Signals

### 🗣️ Spoken answer

> "Signals are Angular's new primitive for reactive state — a value wrapper that notifies consumers when it changes. You create a writable signal with `signal(initialValue)`, read it by calling it like a function — `mySignal()` — and update it with `.set(newValue)` or `.update(fn)`. The key point: Angular's template knows exactly which signals it reads at runtime, so if a signal changes, Angular re-renders only the components that read it. No Zone.js polling, no unnecessary checks. Signals replace BehaviorSubjects for local component state in modern Angular."

```ts
// writable signal
readonly count = signal(0);

increment() {
  this.count.update(n => n + 1);
}
```

### 🎤 Practice question

> _"What is a signal in Angular and how is it different from a BehaviorSubject?"_

---

## 2. Writable vs Read-only Signals

### 🗣️ Spoken answer

> "A `WritableSignal<T>` is created with `signal()` — you can call `.set()`, `.update()`, and `.mutate()` on it. A read-only `Signal<T>` is what `computed()` returns — no write methods, just the getter. This is an important design pattern: your store or service owns the writable signal privately, and exposes only a read-only signal to consumers. Components can read state but can't bypass the store's update logic by writing directly. You expose a read-only view with `mySignal.asReadonly()` or by typing the property as `Signal<T>`."

```ts
@Injectable({ providedIn: 'root' })
export class CounterStore {
  // private writable
  private readonly _count = signal(0);

  // public read-only
  readonly count: Signal<number> = this._count.asReadonly();

  increment() {
    this._count.update(n => n + 1); // only the store can write
  }
}
```

### 🎤 Practice question

> _"How do you expose a signal publicly from a service without letting consumers modify it?"_

---

## 3. computed() & linkedSignal()

### 🗣️ Spoken answer

> "`computed()` derives a new read-only signal from one or more other signals. It's **automatically memoized** — it only re-evaluates when its signal dependencies change, not on every read. This is the clean way to derive state: totals, filtered lists, display strings. `linkedSignal()` is newer — it's a writable signal whose value resets to a derived value when its source changes, but can be overridden by the user. The canonical use case: a selected item in a list that resets to the first item whenever the list changes, but can be manually changed until then."

```ts
// computed
readonly fullName = computed(() => `${this.firstName()} ${this.lastName()}`);

// linkedSignal
readonly selectedId = linkedSignal(() => this.items()[0]?.id ?? null);
// Can be set manually: this.selectedId.set(someId)
// Resets to items()[0].id when items() changes
```

### 🎤 Practice question

> _"What is `computed()` and when would you use `linkedSignal()` instead?"_

---

## 4. effect()

### 🗣️ Spoken answer

> "`effect()` runs a side effect whenever the signals it reads change. It's the signals equivalent of `subscribe` + `takeUntilDestroyed`. Use it for things that can't be expressed as computed values: logging, persisting to localStorage, synchronising to an external non-Angular library. The rules: effects run asynchronously in a microtask, not synchronously. You should not write to signals inside an effect by default because it can create loops — if you must, use the `allowSignalWrites` option. Overuse of effects is a code smell — most state derivations should be `computed()`, not `effect()`."

```ts
readonly theme = signal<'light' | 'dark'>('light');

constructor() {
  effect(() => {
    document.body.setAttribute('data-theme', this.theme());
  });
}
```

### 🎤 Practice question

> _"What is `effect()` in Angular signals? When should and shouldn't you use it?"_

---

## 5. Change Detection — OnPush

### 🗣️ Spoken answer

> "Angular's **Default** change detection checks every component on every browser event — click, keypress, timer, HTTP response. For large trees this is wasteful. **OnPush** tells Angular: only re-check this component when one of three things happens — a signal it reads emits, an `@Input` reference changes (not just mutation of an existing object), or `async` pipe value emits. With signals, OnPush components update exactly when needed and nothing else. I use OnPush on every component by default — it's a free performance win and enforces immutability."

```ts
@Component({
  selector: 'app-user-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<p>{{ user().name }}</p>`,
})
export class UserCardComponent {
  readonly user = input.required<User>();
}
```

### 🎤 Practice question

> _"What is OnPush change detection and why would you use it?"_

---

## 6. Zone.js & Zoneless

### 🗣️ Spoken answer

> "Zone.js is a library that patches the browser's async APIs — setTimeout, Promises, XHR, event listeners — so Angular knows when any async operation finishes. When async completes, Zone.js notifies Angular, which then runs change detection across the whole component tree to update the view. This is the magic behind 'it just works' — you don't call `detectChanges` manually. The downside: running change detection on everything is expensive. **Zoneless Angular** (available since Angular 18, stable in 19) removes this dependency — you opt in and use signals or explicit `markForCheck` calls instead. The benefit: no unnecessary checks, smaller bundle, better performance."

### 🎤 Practice question

> _"What is Zone.js and why is Angular moving away from it?"_

---

## 7. Interceptors

### 🗣️ Spoken answer

> "An HTTP interceptor is middleware that sits between your application code and the browser's HTTP mechanism. Every request and response passes through it. Use cases: attach an auth token to every request, handle 401/403 responses globally, show a loading spinner, log timing, normalise error shapes. In modern Angular, interceptors are functional — a plain function with the signature `HttpInterceptorFn`. You register them in `app.config.ts` with `provideHttpClient(withInterceptors([interceptorFn]))`. They execute in array order for requests and in reverse order for responses."

```ts
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).token();
  if (!token) return next(req);
  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
```

### 🎤 Practice question

> _"What is an HTTP interceptor and what would you use one for?"_

---

## 8. Eager vs Lazy Loading

### 🗣️ Spoken answer

> "**Eager loading** means code is downloaded and parsed as part of the initial bundle — everything the user might need is loaded upfront. **Lazy loading** means code is split into separate chunks and only downloaded when actually needed — typically when the user navigates to a route. In Angular you implement lazy routing with `loadComponent: () => import('./path').then(m => m.Component)` or `loadChildren`. The benefit: smaller initial bundle → faster first paint. The cost: a small delay on first navigation to a lazy route — which you can mitigate with route preloading strategies."

```ts
// Lazy loaded route
{
  path: 'admin',
  loadChildren: () => import('./admin/admin.routes').then(m => m.ADMIN_ROUTES),
}

// Lazy loaded component
{
  path: 'profile',
  loadComponent: () => import('./profile/profile.component').then(m => m.ProfileComponent),
}
```

### 🎤 Practice question

> _"How does lazy loading work in Angular and what problem does it solve?"_

---

## 9. @defer

### 🗣️ Spoken answer

> "`@defer` is Angular's built-in template-level lazy loading, introduced in Angular 17. It lazily loads a component or block of template only when a condition is met — you don't need to change routes. The default trigger is when the browser is idle. Other triggers: `on viewport` — loads when the element would enter the viewport; `on interaction` — on first click; `on hover`. You can pair it with `@placeholder` for what to show before loading, `@loading` during the download, and `@error` if it fails. It's perfect for below-the-fold content like charts or heavy third-party widgets."

```html
@defer (on viewport) {
<app-heavy-chart />
} @placeholder {
<div class="skeleton"></div>
} @loading {
<app-spinner />
} @error {
<p>Failed to load chart</p>
}
```

### 🎤 Practice question

> _"What is `@defer` in Angular and how is it different from lazy routing?"_

---

## 10. @for Cycle Syntax

### 🗣️ Spoken answer

> "`@for` is Angular 17's new control flow syntax replacing `*ngFor`. The key difference: **`track` is required** — you must tell Angular how to identify items, which enables efficient DOM reconciliation without always destroying and re-creating elements. Track by a unique identifier like `item.id`. The `$index`, `$first`, `$last`, `$even`, `$odd`, `$count` context variables are available. Pair with `@empty` for an empty state — no more `*ngIf` hack on the list."

```html
@for (user of users(); track user.id) {
<app-user-card [user]="user" />
} @empty {
<p>No users found.</p>
}
```

### 🎤 Practice question

> _"What is the `track` in `@for` and why is it required?"_

---

## 11. Shadow DOM

### 🗣️ Spoken answer

> "The Shadow DOM is a browser-native API that encapsulates a subtree of DOM nodes — the styles inside don't leak out and external styles don't leak in. Web Components use Shadow DOM to make truly isolated custom elements. In Angular, `ViewEncapsulation.Emulated` (the default) simulates style encapsulation by adding a unique attribute to elements and scoping CSS selectors — but it's not real Shadow DOM. `ViewEncapsulation.ShadowDom` uses the real browser API. `ViewEncapsulation.None` turns off all encapsulation — styles become global."

### 🎤 Practice question

> _"What is Shadow DOM and how does Angular's view encapsulation relate to it?"_

---

## 12. View Encapsulation — Plain English

### 🗣️ Spoken answer

> "View encapsulation is Angular's answer to one of CSS's biggest problems: styles bleeding between components. By default, Angular uses **Emulated** encapsulation — it adds a unique attribute like `_ngcontent-abc-c0` to every element in your component's template, and rewrites your CSS selectors to include that attribute. So `.btn { color: red }` becomes `.btn[_ngcontent-abc-c0] { color: red }` — it only targets your component's buttons, not buttons in other components. It's not real Shadow DOM; it's a clever trick that works everywhere. Real **ShadowDom** encapsulation uses the native browser API — stronger isolation but has some limitations with global styles. **None** turns it all off — your styles go global, like plain CSS."

### Three modes

| Mode                 | What it does                         | Use when                                   |
| -------------------- | ------------------------------------ | ------------------------------------------ |
| `Emulated` (default) | Scopes styles via attribute shimming | Always — it's safe and fast                |
| `ShadowDom`          | Real browser Shadow DOM              | Building Web Components / Angular Elements |
| `None`               | Styles are global                    | Shared utility classes, rarely needed      |

```ts
@Component({
  selector: 'app-card',
  encapsulation: ViewEncapsulation.Emulated, // default, usually omit this line
  styles: ['.card { background: white; }'] // stays scoped to this component
})
```

### 🎤 Practice question

> _"What is Angular's default view encapsulation and what problem does it solve?"_

---

## 13. Runtime Error Examples

### 🗣️ Spoken answer

> "Common runtime errors in Angular: `TypeError: Cannot read properties of null` — you tried to access a property on something that turned out to be null at runtime, TypeScript had no way to know at compile time. `ExpressionChangedAfterItHasBeenCheckedError` — you changed a value that Angular already read during change detection, usually from `ngAfterViewInit`; fix with `changeDetectorRef.detectChanges()` or making the value a signal. `NullInjectorError: No provider for X` — a service or token wasn't provided in the DI tree at that scope. `NG0100` (`ExpressionChangedAfterChecked`) is a dev-only check. HTTP 401/403 responses are runtime errors, not code errors."

### Runtime vs Build-time error cheatsheet

| Error                           | When caught            | Example                                    |
| ------------------------------- | ---------------------- | ------------------------------------------ |
| Type mismatch                   | Build time             | `const x: number = 'hello'`                |
| Template binding error          | Build time (AOT)       | `{{ user.nme }}` (typo on `name`)          |
| Null dereference                | **Runtime**            | `user.address.city` when `address` is null |
| Missing provider                | **Runtime**            | `NullInjectorError`                        |
| HTTP 404                        | **Runtime**            | Wrong API URL                              |
| `ExpressionChangedAfterChecked` | **Runtime** (dev only) | Changing value in `ngAfterViewInit`        |

### 🎤 Practice question

> _"Give me an example of a runtime error that TypeScript cannot catch at compile time."_

---

## 14. Error Handling

### 🗣️ Spoken answer

> "Several layers: at the RxJS level, `catchError` in a pipe catches stream errors without killing the observable; `retry(3)` retries before erroring. At the HTTP interceptor level, you intercept error responses globally — 401 redirects to login, 500 shows a toast. At the store level, `tapResponse` from NgRx ComponentStore handles next and error without letting the signal store's rxMethod stream die silently. For uncaught errors, Angular provides `ErrorHandler` — you extend it and provide your custom implementation to send errors to a logging service like Sentry."

```ts
// Global error handler
@Injectable()
export class AppErrorHandler implements ErrorHandler {
  handleError(error: unknown) {
    // send to Sentry, show toast, etc.
  }
}

// in app.config.ts
{ provide: ErrorHandler, useClass: AppErrorHandler }
```

### 🎤 Practice question

> _"How do you handle HTTP errors globally in an Angular application?"_

---
