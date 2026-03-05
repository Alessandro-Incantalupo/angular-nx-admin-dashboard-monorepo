# 🎯 Angular Interview Prep — from Your Own Codebase

> Based on `admin-dashboard-nx-monorepo`. Real code, real patterns.
> **Role:** Senior Frontend Developer @ Digital Customer Solutions (multinational, elevators/escalators sector).

---

## 🏢 0. JD Targeting — What _They_ Care About

> Read this first. Frame every answer around these priorities.

### Requirements → your codebase

| JD Requirement                            | What to show                                              | Where in your code                               |
| ----------------------------------------- | --------------------------------------------------------- | ------------------------------------------------ |
| **Angular (primary)**                     | Signals, SignalStore, lazy routing, OnPush, standalone    | `user.store.ts`, `*.routes.ts`, any component    |
| **High-quality customer-facing frontend** | OnPush + typed forms + clean architecture                 | `sign-in.component.ts`, `user-form.component.ts` |
| **Performance on different devices**      | OnPush, lazy loading, `debounceTime` before API calls     | `app.routes.ts`, `user.store.ts`                 |
| **API integration (REST)**                | Full CRUD, typed HTTP, interceptors, `HttpContext`        | `user.service.ts`, interceptors                  |
| **Unit testing**                          | Jest, `TestBed`, `HttpTestingController`, mock stores     | section 11                                       |
| **Mobile / Capacitor** (plus)             | Bridge Angular SPA → Capacitor (see tips below)           | —                                                |
| **Architectural support**                 | Composable store features, interceptor pipeline, route DI | `withPagination.ts`, `users.routes.ts`           |

---

### 🎙️ Opening pitch (30 seconds)

> _"I've been building a production Nx monorepo Angular dashboard with OnPush components, NgRx SignalStore, a full CRUD service layer with typed HttpClient, and functional HTTP interceptors for auth and response normalisation. I'm comfortable going deep on reactive patterns, typed forms, and performance."_

---

### 🔥 How to frame key topics

**Performance:**

- `OnPush` + signals → re-renders only when a signal emits
- `loadComponent` / `loadChildren` → lazy initial bundle
- `debounceTime(300)` → no wasted HTTP calls on keystrokes
- `switchMap` → cancels stale in-flight requests
- Route-level `providers: [UsersStore]` → store is scoped, not global

**API integration:**

- Typed `HttpClient`: `get<PaginatedResponse<User>>(url)`
- Functional interceptors: auth token injection, global response transformer, loading spinner bypass
- `HttpContextToken` → per-request flags without coupling service to interceptor

**Testing:**

- `TestBed` + `HttpTestingController` for services
- Mock stores with `jest.fn()` + `signal()` for component tests
- Test forms by setting values + asserting `hasError()`

**Capacitor / mobile (when it comes up):**

> _"My Angular app is a full SPA — wrapping it in Capacitor is straightforward. Routing, HTTP service layer, and NgRx store stay identical. Capacitor provides the native shell, then I'd progressively add native plugins (Camera, Push, Filesystem). The key concern is auth: token-based (Bearer) works natively without CORS issues — exactly what my interceptor already handles."_

**Architecture / working with Lead Engineer:**

- `withPagination` custom `signalStoreFeature` → reusable, composable abstraction
- `satisfies Routes` → type-safe route configs
- Nx libs (`libs/models`, `libs/design-system`) → shared code with clear boundaries

---

### ⚠️ Likely tricky questions for this role

1. **"Default vs OnPush change detection?"** → Default checks every component on every event; OnPush only re-checks when an `@Input` reference changes or a signal/async pipe emits.
2. **"How do you share state between unrelated components?"** → Injectable SignalStore at root or route level — components `inject(UsersStore)` independently.
3. **"How do you handle errors globally?"** → Functional `HttpInterceptorFn` for HTTP errors + `tapResponse` in the store so the rxMethod stream never dies silently.
4. **"What is a standalone component?"** → No `NgModule` needed; `imports` declared directly in `@Component`. Your entire app is standalone.
5. **"Real-time / MQTT?"** → `webSocket()` from `rxjs/webSocket` → pipe through `switchMap` → `updateState` in the store. Same reactive pattern as HTTP.
6. **"How do you prevent a double form submit?"** → `exhaustMap` (ignores new emissions until current completes) OR disabled button on submit.

---

## 📑 Table of Contents

0. [JD Targeting](#-0-jd-targeting--what-they-care-about) ← **read first**
1. [HttpClient — params, context, interceptors](#1-httpclient)
2. [Observables vs Promises](#2-observables-vs-promises)
3. [Reactive Forms — syntax, validation, cross-field](#3-reactive-forms)
4. [Template syntax — @for, @if, @empty, @switch](#4-template-syntax)
5. [Array Methods](#5-array-methods)
6. [Custom Validation](#6-custom-validation)
7. [Routing — lazy loading, dynamic segments, guards](#7-routing)
8. [subscribe() syntax & takeUntilDestroyed](#8-subscribe)
9. [Key RxJS Operators](#9-rxjs-operators)
10. [SignalStore — architecture & flow](#10-signalstore)
11. [Jest Testing](#11-jest-testing)

---

## 1. HttpClient

### Pattern: typed GET with query params

```ts
// user.service.ts
getUsers(page: number = 1, size: number = 5) {
  return this.http.get<PaginatedResponse<User>>(
    `${this.usersUrl}?page=${page}&size=${size}`
  );
}
```

> **Interview tip:** `HttpClient` methods always return `Observable<T>` — lazy, not fired until subscribed.

### Pattern: typed POST / PUT / DELETE

```ts
addUser(user: User) {
  return this.http.post<User>(this.usersUrl, user);
}

updateUser(user: User) {
  return this.http.put<User>(`${this.usersUrl}/${user.id}`, user);
}

deleteUser(userId: string) {
  return this.http.delete<void>(`${this.usersUrl}/${userId}`);
}
```

### Pattern: HttpContext (pass metadata to interceptors)

```ts
// Define a token
export const BYPASS_LOADING_SPINNER = new HttpContextToken<boolean>(() => false);
export const WHITELISTED_API       = new HttpContextToken<boolean>(() => false);

// Build a context in the service
private readonly RESET_USERS_HTTP_CONTEXT = new HttpContext()
  .set(BYPASS_LOADING_SPINNER, true);

// Pass it to the request
this.http.post<void>(url, {}, { context: this.RESET_USERS_HTTP_CONTEXT });
```

> **Why?** Lets interceptors read per-request flags without coupling the service to the interceptor logic.

### Pattern: Functional interceptor (HTTP_INTERCEPTORS replacement)

```ts
// auth.interceptor.ts
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  if (!token) return next(req);

  const cloned = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });
  return next(cloned);
};

// base-response.interceptor.ts — transforms or filters the stream
export const BaseResponseInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.context.get(WHITELISTED_API)) return next(req);

  return next(req).pipe(
    filter((event): event is HttpResponse<BaseResponse<unknown>> => event instanceof HttpResponse),
    map(resp => {
      if (!resp.body) throw new Error('No body in response');
      const { code, message } = resp.body;
      if (typeof message === 'string' && (code === -1 || code > 0)) {
        throw new Error(message ?? 'Unknown error');
      }
      return resp.clone({ body: resp.body });
    })
  );
};
```

> **Registered in** `app.config.ts` via `provideHttpClient(withInterceptors([authInterceptor, BaseResponseInterceptor]))`.

---

## 2. Observables vs Promises — Deep Tutorial

### 🧠 Mental Model

Think of it like this:

```
Promise  = ordering a pizza 🍕
           You place the order → it arrives ONCE → done.
           You can't cancel it. You can't get 2 slices as they're made.

Observable = a Netflix subscription 🎬
           Nothing plays until you press PLAY (subscribe).
           You can get many episodes (values) over time.
           You can cancel (unsubscribe) at any point.
           You can transform the stream: filter, map, slow down, merge.
```

---

### 🔬 Promise: what actually happens

```ts
// This fires IMMEDIATELY — the moment this line is executed
const promise = fetch('/api/users'); // ← already running!

promise
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));

// Can you cancel it? ❌ No.
// Can it emit multiple values? ❌ No — one result, one time.
```

---

### 🔬 Observable: what actually happens

```ts
import { Observable } from 'rxjs';

// This defines the work — but does NOT run yet
const users$ = new Observable(observer => {
  console.log('🚀 started!'); // only runs when subscribed
  observer.next({ name: 'Alice' }); // emit value 1
  observer.next({ name: 'Bob' }); // emit value 2
  observer.complete(); // stream is done
});

// Nothing has run yet. users$ is just a blueprint.
console.log('before subscribe');

const sub = users$.subscribe({
  next: value => console.log('got:', value),
  error: err => console.error('error:', err),
  complete: () => console.log('done!'),
});

// Output:
// before subscribe
// 🚀 started!
// got: { name: 'Alice' }
// got: { name: 'Bob' }
// done!

sub.unsubscribe(); // ← you can cancel at any moment
```

---

### 🔬 Angular HttpClient: Observable in practice

```ts
// This does NOT fire the HTTP request:
const obs$ = this.http.get<User[]>('/api/users');

// This DOES fire it (subscribes):
obs$.subscribe(users => console.log(users));

// In your store, rxMethod does the subscribing for you internally.
// The pipe() is just defining transformations on the stream BEFORE it fires.
```

---

### 📊 Side-by-side comparison

```ts
// ─── PROMISE ─────────────────────────────────────────────────────
async function loadUser() {
  try {
    const res = await fetch('/api/user/1'); // fires immediately
    const data = await res.json();
    return data; // one value, done
  } catch (err) {
    console.error(err);
  }
}

// ─── OBSERVABLE (Angular HttpClient) ─────────────────────────────
// Returns an Observable<User> — lazy, typed, composable
this.http
  .get<User>('/api/user/1')
  .pipe(
    map(user => user.name.toUpperCase()), // transform
    catchError(err => of({ name: 'Unknown' })) // recover
  )
  .subscribe(name => console.log(name)); // fires here
```

---

### 🧩 The 3 things Observables can do that Promises cannot

**1. Emit multiple values over time**

```ts
// A timer that ticks every second — impossible with a Promise
import { interval } from 'rxjs';
const tick$ = interval(1000); // emits 0, 1, 2, 3... every second
tick$.subscribe(n => console.log(n));
```

**2. Be cancelled**

```ts
const sub = this.http.get('/api/users').subscribe(...);
// 200ms later, user navigates away:
sub.unsubscribe();  // HTTP request is aborted — no wasted processing
```

> This is why `takeUntilDestroyed()` in your `user-form.component.ts` matters — it calls `unsubscribe()` automatically when the component is destroyed.

**3. Be composed with operators**

```ts
// Search box: don't hit the API on every keystroke
searchInput$
  .pipe(
    debounceTime(300), // wait 300ms after user stops typing
    distinctUntilChanged(), // skip if same value as before
    switchMap(
      (
        term // cancel previous request, start new one
      ) => this.http.get(`/api/search?q=${term}`)
    )
  )
  .subscribe(results => (this.results = results));
// A Promise chain cannot do ANY of this elegantly.
```

---

### Quick Reference: When to use which

| Situation                              | Use                          |
| -------------------------------------- | ---------------------------- |
| Angular HTTP                           | Observable (always)          |
| Search with debounce                   | Observable + `switchMap`     |
| Stream of events (form `valueChanges`) | Observable                   |
| SignalStore `rxMethod`                 | Observable (required)        |
| `async/await` one-off utility          | Promise / `firstValueFrom()` |
| Guard returning a boolean              | Either works                 |

### Converting between them

```ts
import { from, firstValueFrom } from 'rxjs';

// Observable → Promise (one value only)
const user = await firstValueFrom(this.http.get<User>('/api/user'));

// Promise → Observable
const data$ = from(fetch('/api/data').then(r => r.json()));
```

---

## 3. Reactive Forms

### Setup with NonNullableFormBuilder

```ts
// sign-in.component.ts
nnfb = inject(NonNullableFormBuilder);

form = this.nnfb.group({
  email: ['', [Validators.required, Validators.email]],
  password: ['', [Validators.required]],
});
```

> **Why `NonNullableFormBuilder`?** Every control's value is typed as `string` (not `string | null`), so calling `.value` is safe without a null check.

### Groups, controls, and built-in validators

```ts
form = this.nnfb.group({
  name: ['', Validators.required],
  email: ['', [Validators.required, Validators.email]],
  role: ['user', Validators.required],
  status: ['active'],
  password: ['', [Validators.required, Validators.minLength(8)]],
  confirmPassword: ['', Validators.required],
});
```

### Template binding

```html
<form [formGroup]="form" (ngSubmit)="onSubmit()">
  <input formControlName="email" />
  @if (form.get('email')?.hasError('required') && form.get('email')?.touched) {
  <p>Email is required</p>
  } @if (form.get('email')?.hasError('email') && form.get('email')?.touched) {
  <p>Invalid email format</p>
  }
  <button type="submit">Submit</button>
</form>
```

### Checking errors programmatically

```ts
// Your project's pattern (hasError helper)
hasError(controlName: string, errorType: string): boolean | undefined {
  const control = this.form.get(controlName);
  return control?.hasError(errorType) && control.touched;
}
```

### Resetting a form

```ts
this.form.reset({ role: 'user', status: 'active' }); // reset with defaults
```

### Listening to value changes

```ts
// user-form.component.ts
this.form
  .get('name')!
  .valueChanges.pipe(
    takeUntilDestroyed(this.destroyRef),
    map(value => value.toUpperCase())
  )
  .subscribe(val => console.log(val));
```

### Cross-field validation with computed signal (your sign-up approach)

```ts
// sign-up.component.ts
passwordsMatch = computed(() => this.form.value.password === this.form.value.confirmPassword);
```

> Alternative: custom `ValidatorFn` on the group (see section 6).

---

## 4. Template Syntax

### @for with track

```html
<!-- user-table.component.html -->
@for (user of users(); track user.id) {
<tr>
  <td>{{ user.name || '-' }}</td>
  <td>{{ user.email || '-' }}</td>
  <td>{{ user.role }}</td>
</tr>
} @empty {
<tr>
  <td colspan="4">No users found</td>
</tr>
}
```

> **`track` is mandatory** in Angular 17+. Use a unique ID. Without it Angular re-renders every item.

### @if / @else

```html
@if (!readOnly()) {
<button (click)="editAction.emit(user)">Edit</button>
} @else {
<span>View Only</span>
}
```

### @switch

```html
@switch (user.role) { @case ('admin') { <span>Admin</span> } @case ('user') { <span>User</span> } @default { <span>Guest</span> } }
```

### Built-in vs *ngIf / *ngFor (old vs new)

```html
<!-- OLD (structural directives — still works) -->
<tr *ngFor="let user of users; trackBy: trackById">
  ...
</tr>
<div *ngIf="isVisible; else notVisible">...</div>

<!-- NEW (preferred — Angular 17+) -->
@for (user of users; track user.id) { ... } @if (isVisible) { ... } @else { ... }
```

---

## 5. Array Methods

Patterns used in **your store**:

### map — transform

```ts
// Update one user in array
users: state.users().map(u => (u.id === user.id ? user : u));
```

### filter — remove

```ts
// Delete user from array
users: state.users().filter(u => u.id !== userId);
```

### find — lookup

```ts
const user = state.users().find(u => u.id === userId);
```

### Object.entries + filter + Object.fromEntries — remove key from object

```ts
// Remove one cloned user entry
clonedUsers: Object.fromEntries(Object.entries(state.clonedUsers()).filter(([id]) => id !== user.id));
```

### reduce (pattern — know this)

```ts
// Sum up stats
const total = users.reduce((acc, u) => acc + u.score, 0);
```

### flatMap / flat

```ts
// flatten nested arrays
const allPermissions = roles.flatMap(r => r.permissions);
```

### some / every

```ts
const hasAdmin = users.some(u => u.role === 'admin');
const allActive = users.every(u => u.status === 'active');
```

---

## 6. Custom Validation

### Inline ValidatorFn

```ts
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function passwordMatchValidator(): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const pass = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return pass === confirm ? null : { passwordMismatch: true };
  };
}

// Apply to the group:
this.nnfb.group(
  {
    password: ['', Validators.required],
    confirmPassword: ['', Validators.required],
  },
  { validators: passwordMatchValidator() }
);
```

### Async ValidatorFn (e.g. check email unique)

```ts
import { AsyncValidatorFn } from '@angular/forms';
import { map, catchError, of } from 'rxjs';

export function uniqueEmailValidator(service: UserService): AsyncValidatorFn {
  return (control: AbstractControl) =>
    service.checkEmailExists(control.value).pipe(
      map(exists => (exists ? { emailTaken: true } : null)),
      catchError(() => of(null)) // fail open
    );
}
```

### Using in template

```html
@if (form.hasError('passwordMismatch') && form.touched) {
<p>Passwords do not match</p>
} @if (form.get('email')?.hasError('emailTaken')) {
<p>Email already in use</p>
}
```

---

## 7. Routing

### App-level routes (lazy loading)

```ts
// app.routes.ts
export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./layouts/main-layout/main-layout.routes'),
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes'),
  },
  {
    path: 'profile/:id', // ← dynamic segment
    loadComponent: () => import('./features/profile/profile.component'),
    canActivate: [AuthGuard],
  },
  {
    path: '**', // ← wildcard / 404
    loadComponent: () => import('./features/error-page/error-page.component'),
  },
];
```

### Feature-level routes with providers

```ts
// users.routes.ts
export default [
  {
    path: '',
    loadComponent: () => import('./pages/user-list/user-list.component'),
    providers: [UsersStore, provideTranslocoScope('users')], // ← route-scoped DI
  },
  {
    path: 'stats',
    loadComponent: () => import('./pages/user-stats/user-stats-page.component'),
    providers: [UsersStore, provideTranslocoScope('users')],
  },
] satisfies Routes;
```

### Functional guard

```ts
// auth.guard.ts
export const AuthGuard: CanActivateFn = () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  if (!authStore.isAuthenticated()) {
    router.navigate([PATHS.SIGN_UP]);
    return false;
  }
  return true;
};
```

> Functional guards replaced class-based guards in Angular 15+. Use `CanActivateFn`, `CanDeactivateFn`, etc. directly.

### Reading dynamic params in a component

```ts
import { ActivatedRoute } from '@angular/router';
import { toSignal }       from '@angular/core/rxjs-interop';

readonly route = inject(ActivatedRoute);

// Observable style
this.route.paramMap.subscribe(params => {
  const id = params.get('id');
});

// Signal style (modern)
readonly id = toSignal(this.route.paramMap.pipe(map(p => p.get('id'))));
```

### Navigating programmatically

```ts
// navigate by path
this.router.navigate(['/auth/sign-in']);

// navigate with params
this.router.navigate(['/profile', userId]);

// navigate with query params
this.router.navigate(['/users'], { queryParams: { page: 2 } });
```

---

## 8. subscribe() Syntax & Cleanup

### Basic subscribe (3-arg style is deprecated)

```ts
// ❌ Old 3-arg style (deprecated)
obs$.subscribe(
  val => {},
  err => {},
  () => {}
);

// ✅ Modern object style
obs$.subscribe({
  next: val => console.log(val),
  error: err => console.error(err),
  complete: () => console.log('done'),
});
```

### Cleanup — takeUntilDestroyed (your pattern)

```ts
import { DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

private readonly destroyRef = inject(DestroyRef);

this.form.get('name')!.valueChanges.pipe(
  takeUntilDestroyed(this.destroyRef),  // ← auto-unsubscribes on component destroy
  map(value => value.toUpperCase())
).subscribe(val => console.log(val));
```

### Other cleanup alternatives

```ts
// Manual unsubscribe
const sub = obs$.subscribe(val => {});
ngOnDestroy() { sub.unsubscribe(); }

// Using async pipe in template (best for templates)
// users$ is Observable<User[]> in the component
// <div *ngFor="let user of users$ | async">
```

### tapResponse (from @ngrx/operators) — used in your store

```ts
service.getUsers().pipe(
  tapResponse({
    next: response => {
      /* success */
    },
    error: err => {
      /* error   */
    },
  })
);
```

> Safer than `catchError` — automatically catches errors so the rxMethod stream doesn't die.

---

## 9. Key RxJS Operators

### switchMap — cancel previous, start new (your store uses this everywhere)

```ts
// user.store.ts
switchMap(({ page = 1, rows = 5 }) =>
  userService.getUsers(page, rows).pipe(
    tapResponse({ next: ..., error: ... })
  )
)
```

> Use when: search input, pagination — you only care about the latest request.

### mergeMap — run all concurrently

```ts
// Use when: parallel downloads, independent requests
mergeMap(id => service.getItem(id));
```

### concatMap — queue, one by one

```ts
// Use when: ordered operations (e.g., sequential uploads)
concatMap(file => uploadService.upload(file));
```

### exhaustMap — ignore new until current completes

```ts
// Use when: login button (prevent double-submit)
exhaustMap(creds => authService.login(creds));
```

### debounceTime — wait for pause in input

```ts
// user.store.ts — prevents rapid API calls
debounceTime(300),
switchMap(...)
```

### map — transform value

```ts
map(response => response.data);
map(value => value.toUpperCase());
```

### filter — conditional pass-through

```ts
// base-response.interceptor.ts
filter((event): event is HttpResponse<...> => event instanceof HttpResponse)
```

### tap — side effects, no transformation

```ts
tap(() => setUsersLoading()); // log, set loading state, etc.
```

### catchError — handle and recover

```ts
catchError(err => {
  console.error(err);
  return of([]); // recover with empty array
});
```

### forkJoin — wait for all (like Promise.all)

```ts
forkJoin([this.http.get('/users'), this.http.get('/stats')]).subscribe(([users, stats]) => {});
```

### combineLatest — re-emit when any source emits

```ts
combineLatest([user$, roles$]).subscribe(([user, roles]) => {});
```

### pipe() — compose operators

```ts
obs$
  .pipe(
    debounceTime(300),
    switchMap(term => this.search(term)),
    map(results => results.slice(0, 5)),
    catchError(() => of([]))
  )
  .subscribe(results => {});
```

---

## 10. SignalStore — Architecture & Flow

### Full anatomy (your UsersStore)

```
signalStore(
  withState(initialState)          ← raw signal state
  withPagination(config)           ← custom signalStoreFeature
  withDevtools('Users Store')      ← DevTools integration
  withComputed(({ users }) => ...) ← derived signals
  withMethods((state, service) =>...) ← actions (rxMethod + plain methods)
  withHooks(({ loadUsers }) => ...) ← lifecycle
  withCallState({ collection: 'users' }) ← loading/error/loaded flags
)
```

### withState

```ts
type State = {
  users: User[];
  clonedUsers: { [id: string]: User };
  stats: { [key: string]: number };
};

const initialState: State = { users: [], clonedUsers: {}, stats: {} };

withState(initialState),
```

### withComputed

```ts
withComputed(({ users }) => ({
  hasUsers: computed(() => users().length > 0),
})),
```

### withMethods + rxMethod pattern

```ts
withMethods((state, userService = inject(UsersService)) => {

  const loadUsers = rxMethod<PaginatorState | void>(
    pipe(
      tap(() => setUsersLoading()),
      debounceTime(300),
      switchMap(({ page = 1, rows = 5 }: Partial<PaginatorState> = {}) =>
        userService.getUsers(page, rows).pipe(
          tapResponse({
            next: response => {
              updateState(state, 'Users: Load Success', {
                users: response.data,
                totalItems: response.meta.totalItems,
              });
              setUsersLoaded();
            },
            error: err => {
              toast.error(getHttpErrorMessage(err, 'Failed to load users'));
              setUsersError(err);
            },
          })
        )
      )
    )
  );

  return { loadUsers };
}),
```

### withHooks (lifecycle)

```ts
withHooks(({ loadUsers, loadStats }) => ({
  onInit: () => {
    loadUsers();
    loadStats();
  },
})),
```

### updateState — how you mutate

```ts
updateState(state, 'Action Label', {
  users: newUsers,
  currentPage: 1,
});
```

### Custom signalStoreFeature (withPagination)

```ts
// state/features/withPagination.ts
export function withPagination(config?: PaginationConfig) {
  return signalStoreFeature(
    withState<PaginationState>({
      currentPage: config?.initialPage ?? 1,
      pageSize: config?.initialPageSize ?? 10,
      totalItems: 0,
    }),
    withComputed(({ currentPage, pageSize, totalItems }) => ({
      totalPages: computed(() => Math.ceil(totalItems() / pageSize())),
      hasNextPage: computed(() => currentPage() < Math.ceil(totalItems() / pageSize())),
      hasPreviousPage: computed(() => currentPage() > 1),
      startIndex: computed(() => (currentPage() - 1) * pageSize() + 1),
      endIndex: computed(() => Math.min(currentPage() * pageSize(), totalItems())),
    }))
  );
}
```

### Using the store in a component

```ts
protected readonly store = inject(UsersStore);

// template
users  = store.users;          // signal
hasNext = store.hasNextPage;   // computed signal

// call in template: users() / hasNext()
// or bind: [disabled]="!store.hasNextPage()"
```

### Data flow diagram

```
User action (click / paginate)
  → store method (e.g. loadUsers({page, rows}))
    → rxMethod pipe: tap(setLoading) → debounceTime → switchMap
      → HTTP Observable from service
        → tapResponse: next → updateState → signals update → UI re-renders
                       error → toast + setError
```

---

## 11. Jest Testing

### Basic component test structure (your app.component.spec.ts)

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

### Testing a service with HttpClient

```ts
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { UsersService } from './user.service';

describe('UsersService', () => {
  let service: UsersService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UsersService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(UsersService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getUsers should call GET /users', () => {
    service.getUsers(1, 5).subscribe(res => {
      expect(res.data.length).toBe(2);
    });

    const req = httpMock.expectOne(r => r.url.includes('/users'));
    expect(req.request.method).toBe('GET');
    req.flush({ data: [{ id: '1' }, { id: '2' }], meta: { totalItems: 2 } });
  });
});
```

### Testing a component with a store mock

```ts
import { signal } from '@angular/core';

const mockStore = {
  users: signal([
    {
      id: '1',
      name: 'Alice',
      email: 'a@a.com',
      role: 'admin',
      status: 'active',
    },
  ]),
  hasUsers: signal(true),
  loadUsers: jest.fn(),
};

TestBed.configureTestingModule({
  imports: [UserTableComponent],
  providers: [{ provide: UsersStore, useValue: mockStore }],
});
```

### Key Jest matchers

```ts
expect(value).toBe(42); // strict equality
expect(obj).toEqual({ name: 'Alice' }); // deep equality
expect(fn).toHaveBeenCalled();
expect(fn).toHaveBeenCalledWith('arg1');
expect(fn).toHaveBeenCalledTimes(2);
expect(value).toBeTruthy();
expect(value).toBeFalsy();
expect(arr).toContain('item');
expect(arr).toHaveLength(3);
expect(fn).toThrow('error message');

// Async
await expect(promise).resolves.toBe(42);
await expect(promise).rejects.toThrow();
```

### Mocking with jest.fn() and jest.spyOn()

```ts
const spy = jest.spyOn(service, 'getUsers').mockReturnValue(of(mockResponse));

// or mock the entire module
jest.mock('./user.service');
```

### Testing reactive forms

```ts
it('form should be invalid when empty', () => {
  expect(component.form.valid).toBe(false);
});

it('form should be valid with correct values', () => {
  component.form.setValue({ email: 'a@b.com', password: 'secret123' });
  expect(component.form.valid).toBe(true);
});

it('should show error when email is invalid', () => {
  const ctrl = component.form.get('email')!;
  ctrl.setValue('not-an-email');
  ctrl.markAsTouched();
  expect(ctrl.hasError('email')).toBe(true);
});
```

---

## 🔥 Quick-fire Q&A

| Question                                   | Short Answer                                                                      |
| ------------------------------------------ | --------------------------------------------------------------------------------- |
| `switchMap` vs `mergeMap`?                 | `switchMap` cancels previous; `mergeMap` runs all concurrently                    |
| Why `takeUntilDestroyed`?                  | Auto-unsubscribes on component destroy, prevents memory leaks                     |
| `signal()` vs `computed()`?                | `signal` = writable; `computed` = derived, read-only, lazy                        |
| Why `NonNullableFormBuilder`?              | Values typed as `string` (not `string\|null`) → no null-checks needed             |
| What does `track` do in `@for`?            | Tells Angular which identity to track for DOM reuse (like `trackBy`)              |
| What is `rxMethod`?                        | SignalStore helper — bridges Observable streams into store actions                |
| Functional guard vs class guard?           | Functional (`CanActivateFn`) is the modern way; no class, just a function         |
| `provideHttpClient` vs `HttpClientModule`? | `provideHttpClient()` is the standalone/functional API (Angular 15+)              |
| `withState` vs `withComputed`?             | `withState` = writable state; `withComputed` = derived signals                    |
| What is `tapResponse`?                     | Like `tap` but also catches errors, keeping the rxMethod stream alive             |
| `loadChildren` vs `loadComponent`?         | `loadChildren` lazy-loads a routes file; `loadComponent` lazy-loads one component |
| How do you provide a service per route?    | Add it to the `providers` array in the route config                               |
| `structuredClone` vs spread?               | `structuredClone` does a true deep clone; spread is shallow                       |
| `HttpContext` purpose?                     | Pass per-request metadata to interceptors without coupling them                   |
| `effect()` use case?                       | Run side effects when signals change (e.g., navigate when user changes)           |

---

## 12. TypeScript — Types, Interfaces, Utility Types, Map

### 🧠 `type` vs `interface` — when to use which

```ts
// INTERFACE — use for object shapes that describe contracts
// Can be extended (declaration merging), ideal for public APIs
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
  status: 'active' | 'inactive';
}

// Extend an interface
interface AdminUser extends User {
  permissions: string[];
}

// TYPE — use for unions, intersections, primitives, computed shapes
type Role = 'admin' | 'user' | 'guest'; // union
type Status = 'active' | 'inactive';
type UserOrNull = User | null; // union with null
type ApiResponse<T> = { data: T; meta: Meta }; // generic alias
```

> **Rule of thumb:** `interface` for data contracts (like your `User` model); `type` for unions, generics, and computed shapes. You CAN use either for object shapes — this is a style convention.

---

### 🔧 Utility Types — the 5 you MUST know

#### `Partial<T>` — all fields optional

```ts
// Use when: update payloads, patch endpoints, form partial values
type UserPatch = Partial<User>;
// { id?: string; name?: string; email?: string; role?: ...; status?: ... }

function updateUser(id: string, patch: Partial<User>) {
  // patch only contains the fields that changed
}
```

#### `Required<T>` — all fields mandatory (opposite of Partial)

```ts
type CompleteUser = Required<Partial<User>>; // same as User
```

#### `Pick<T, Keys>` — keep only selected fields

```ts
// Use when: form creates a user without id (id is generated server-side)
type CreateUserPayload = Pick<User, 'name' | 'email' | 'role' | 'status'>;
// { name: string; email: string; role: ...; status: ... }
```

#### `Omit<T, Keys>` — exclude selected fields

```ts
// Same result — Omit is the inverse of Pick
type CreateUserPayload = Omit<User, 'id'>;

// Use in your store — omit fields the client shouldn't set
type UserFormValues = Omit<User, 'id' | 'createdAt'>;
```

#### `Record<Keys, Value>` — typed dictionary

```ts
// Exactly how your store uses it:
clonedUsers: Record<string, User>; // { [id: string]: User }
stats: Record<string, number>; // { [key: string]: number }

// Even stricter — key must be a union
type RoleMap = Record<Role, string[]>;
// { admin: [...], user: [...], guest: [...] }
```

---

### 🗺️ TypeScript `Map` — key-value store with methods

> **Don't confuse with `Record`:** `Record<string, T>` is a plain object; `Map<K, V>` is a class with methods.

```ts
// Create
const userMap = new Map<string, User>();

// Set
userMap.set('user-1', { id: 'user-1', name: 'Alice', ... });

// Get
const alice = userMap.get('user-1');   // User | undefined

// Check existence
userMap.has('user-1');   // true

// Delete
userMap.delete('user-1');

// Iterate
userMap.forEach((user, id) => console.log(id, user.name));

// Size
console.log(userMap.size);

// Convert to array
const users = [...userMap.values()];   // User[]
const ids   = [...userMap.keys()];     // string[]
const pairs = [...userMap.entries()];  // [string, User][]
```

#### Map vs Record — when to use which

|                   | `Map<K,V>`                             | `Record<K,V>`                |
| ----------------- | -------------------------------------- | ---------------------------- |
| Key type          | Any type (objects, numbers)            | `string` or `symbol`         |
| Iteration order   | Insertion order guaranteed             | Not guaranteed               |
| Methods           | `.get()` `.set()` `.has()` `.delete()` | Plain property access        |
| JSON serializable | ❌ No (need to convert)                | ✅ Yes                       |
| Use case          | Caches, lookup tables, runtime stores  | API payloads, config objects |

> **In Angular/NgRx** you'll almost always use `Record` (serializable to Redux DevTools). `Map` is for runtime-only caches.

---

### 🔗 Interfaces as contracts — the DI connection

```ts
// Define the contract (interface = what, not how)
interface UserRepository {
  getUsers(page: number, size: number): Observable<PaginatedResponse<User>>;
  addUser(user: User): Observable<User>;
  deleteUser(id: string): Observable<void>;
}

// Implement it
@Injectable({ providedIn: 'root' })
class UsersService implements UserRepository {
  getUsers(page: number, size: number) { ... }
  addUser(user: User) { ... }
  deleteUser(id: string) { ... }
}

// Inject by interface token (for testability)
const USER_REPO = new InjectionToken<UserRepository>('UserRepository');

// In tests: swap the real service for a mock that also implements UserRepository
class MockUsersService implements UserRepository {
  getUsers = jest.fn().mockReturnValue(of({ data: [], meta: { totalItems: 0 } }));
  addUser  = jest.fn();
  deleteUser = jest.fn();
}
```

> **Interview point:** Interfaces don't exist at runtime — TypeScript erases them. They're purely a compile-time contract. This is why Angular DI uses tokens (`InjectionToken`) instead of interfaces directly.

---

### Type narrowing — common patterns

```ts
// typeof
function format(value: string | number) {
  if (typeof value === 'string') return value.toUpperCase();
  return value.toFixed(2);
}

// instanceof
if (err instanceof HttpErrorResponse) {
  console.log(err.status); // TypeScript knows it's HttpErrorResponse here
}

// in operator
if ('permissions' in user) {
  console.log(user.permissions); // TypeScript knows it's AdminUser
}

// Type guard function
function isAdmin(user: User): user is AdminUser {
  return user.role === 'admin';
}
```

---

## 13. Accessibility (a11y) — Essentials

> This role is building **customer-facing** apps — accessibility is not optional.

### Core concepts

| Concept              | What it means                           | Example                          |
| -------------------- | --------------------------------------- | -------------------------------- |
| **Semantic HTML**    | Use the right element for the job       | `<button>` not `<div (click)>`   |
| **ARIA roles**       | Labels for screen readers               | `role="dialog"`, `role="alert"`  |
| **ARIA labels**      | Describe elements without visible text  | `aria-label="Close dialog"`      |
| **Focus management** | Keyboard users need a logical tab order | `tabindex`, `cdkTrapFocus`       |
| **Color contrast**   | Text must be readable                   | WCAG AA = 4.5:1 ratio            |
| **Alt text**         | Images need descriptions                | `<img alt="User profile photo">` |

### Angular-specific patterns

```html
<!-- ❌ Bad — div with click is not keyboard accessible -->
<div (click)="doSomething()">Click me</div>

<!-- ✅ Good — button is natively focusable, keyboard-activatable -->
<button (click)="doSomething()" type="button">Click me</button>

<!-- ✅ Form with proper labels -->
<label for="email">Email address</label>
<input id="email" type="email" formControlName="email" aria-required="true" [attr.aria-invalid]="hasError('email', 'email') || null" />
@if (hasError('email','required')) {
<span role="alert" aria-live="polite">Email is required</span>
}

<!-- ✅ Loading state announced to screen readers -->
<div aria-live="polite" aria-atomic="true">@if (store.usersLoading()) { <span>Loading users...</span> }</div>

<!-- ✅ Icons without visible text need aria-label -->
<button aria-label="Delete user Alice" (click)="delete(user)">
  <svg-icon name="trash" aria-hidden="true"></svg-icon>
</button>
```

### WCAG levels (know in 1 sentence each)

- **A** — minimum: alt text, form labels, no keyboard traps
- **AA** — standard target: 4.5:1 contrast, focus visible, error messages
- **AAA** — enhanced: rarely required contractually

### Quick a11y checklist for your components

- [ ] Every `<img>` has `alt`
- [ ] Every form `<input>` has a connected `<label>`
- [ ] Interactive elements are `<button>` or `<a>` (not `<div>`)
- [ ] Error messages use `role="alert"` or `aria-live`
- [ ] Loading states are announced with `aria-live="polite"`
- [ ] Tab order is logical (avoid `tabindex > 0`)
- [ ] Color is not the only way to convey information
