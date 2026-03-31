# 🔵 Tier 2 — Angular Core

> The bread and butter. Every Angular interview question lives here.
> ← Back to [main index](interview_coach_2026.md)

---

## 📋 Contents

1. [Framework vs Library](#1-framework-vs-library)
2. [Why Node.js is Relevant to Angular & npm](#2-why-nodejs-is-relevant-to-angular-npm)
3. [npm vs pnpm](#3-npm-vs-pnpm)
4. [main.ts, index.html & app.config.ts](#4-maints-indexhtml-appconfigts)
5. [Data Binding](#5-data-binding)
6. [Lifecycle Hooks](#6-lifecycle-hooks)
7. [constructor vs ngOnInit](#7-constructor-vs-ngoninit)
8. [DOM Basics & Terminology](#8-dom-basics-terminology)
9. [Event Bubbling & Document Root](#9-event-bubbling-document-root)
10. [Template-Driven Forms](#10-template-driven-forms)
11. [Reactive Forms](#11-reactive-forms)
12. [Form Validation & Manipulation](#12-form-validation-manipulation)
13. [General Form Rules](#13-general-form-rules)
14. [A11y Basics](#14-a11y-basics)
15. [Semantic HTML](#15-semantic-html)
16. [ARIA & Alt Text](#16-aria-alt-text)
17. [HTTP CRUD with HttpClient](#17-http-crud-with-httpclient)
18. [ViewChild & Content Projection](#18-viewchild-content-projection)
19. [ViewChild — Concrete Use Cases](#19-viewchild-concrete-use-cases)

---

## 1. Framework vs Library

### 🗣️ Spoken answer

> "A library is code you call — you're in control of the flow. jQuery, Lodash, RxJS: you import them, call functions when you need them. A framework is code that calls you — it provides the structure and you fill in the blanks. Angular is a full framework: it controls the bootstrapping, the component lifecycle, the dependency injection, the routing. The technical term is Inversion of Control. React is often called a library because it only handles the view layer — you compose it with React Router, Redux, etc. Angular is opinionated and batteries-included."

### 🎤 Practice question

> _"What's the difference between a framework and a library? Is Angular a framework or a library?"_

---

## 2. Why Node.js is Relevant to Angular & npm

### 🗣️ Spoken answer

> "Angular doesn't run in Node.js in production — it runs in the browser. But Node.js is essential for the **development toolchain**. The Angular CLI, esbuild, Webpack, the dev server, Jest, ESLint — all of these are Node.js programs. When you run `pnpm install`, Node fetches packages from the npm registry to your local `node_modules`. npm — Node Package Manager — is the ecosystem. The `package.json` describes your project's dependencies and scripts; `node_modules` contains the installed packages. Node.js is also used for Angular SSR (server-side rendering) — the server that pre-renders Angular pages is a Node.js Express app."

### Mental model

```
Node.js role:
  Development → runs CLI, bundler, test runner, linter
  npm/pnpm    → installs packages from the npm registry
  SSR (optional) → runs the Angular server-side renderer
  Production browser app → NOT Node.js, pure browser JS
```

### 🎤 Practice question

> _"Does Angular run on Node.js? Then why do you need it installed?"_

---

## 3. npm vs pnpm

### 🗣️ Spoken answer

> "npm is Node's default package manager — it downloads packages into a `node_modules` folder per project. The problem: if you have ten projects all using React 18, you have ten copies on disk. pnpm solves this with a global content-addressable store — packages are stored once globally and hard-linked into `node_modules`. The result: dramatically less disk space and faster installs. pnpm also uses a strict non-flat `node_modules` structure — packages can only import what they've declared in their `package.json`, which prevents phantom dependency bugs. It's the standard in Nx monorepos because of the workspace protocol and strictness."

### 🎤 Practice question

> _"Why does this monorepo use pnpm instead of npm?"_

---

## 4. main.ts, index.html & app.config.ts

### 🗣️ Spoken answer

> "`index.html` is the HTML shell the server returns for every URL — it's almost empty: just the `<app-root>` element and a `<script>` tag pointing to the JS bundle. `<meta>` tags live in the `<head>` — they control the page title, description (for SEO), viewport scaling (`<meta name='viewport' content='width=device-width, initial-scale=1'>`), and social media previews. `main.ts` is Angular's entry point — it calls `bootstrapApplication(AppComponent, appConfig)` which starts the Angular runtime, evaluates `app.config.ts`, sets up DI providers, and mounts the root component into `<app-root>`. `app.config.ts` is where you register global providers: the router, HttpClient, interceptors, stores, i18n."

```html
<!-- index.html -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="My app description for SEO" />
    <title>Admin Dashboard</title>
  </head>
  <body>
    <app-root></app-root>
  </body>
</html>
```

```ts
// main.ts
bootstrapApplication(AppComponent, appConfig);

// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), provideHttpClient(withInterceptors([authInterceptor])), provideAnimations()],
};
```

### 🎤 Practice question

> _"What is the role of `main.ts` and `app.config.ts` in an Angular application?"_

---

## 5. Data Binding

### 🗣️ Spoken answer

> "Angular has four types of data binding. **Interpolation** — `{{ value }}` — renders a component property in the template. **Property binding** — `[src]="imageUrl"` — sets a DOM property from a component expression. **Event binding** — `(click)="doSomething()"` — listens to DOM events and calls a component method. **Two-way binding** — `[(ngModel)]` — is syntactic sugar for property + event binding combined. The square brackets mean data flows in, parentheses mean data flows out, banana-in-a-box `[()]` is both."

### Memory aid

- `{{ }}` → one-way, interpolation, text output
- `[ ]` → one-way IN: component → DOM
- `( )` → one-way OUT: DOM event → component
- `[( )]` → two-way: both, "banana in a box"

### 🎤 Practice question

> _"Explain the four types of data binding in Angular with an example of each."_

---

## 6. Lifecycle Hooks

### 🗣️ Spoken answer

> "Lifecycle hooks are methods Angular calls at specific moments of a component's life. The most important ones in order: `ngOnChanges` — called before `ngOnInit` and whenever an `@Input` value changes; `ngOnInit` — called once after the first `ngOnChanges`, the right place for initialisation and HTTP calls; `ngAfterViewInit` — called after the template and child views are rendered, where you can safely access `@ViewChild` queries; `ngOnDestroy` — cleanup, unsubscribe, cancel timers. With signals and `inject(DestroyRef)`, `ngOnDestroy` is needed less often. There's also `ngDoCheck` — called on every change detection run — avoid it unless you know exactly what you're doing."

### Order table

| Hook                    | When                               |
| ----------------------- | ---------------------------------- |
| `ngOnChanges`           | Before init and on input changes   |
| `ngOnInit`              | Once after first ngOnChanges       |
| `ngDoCheck`             | Every change detection run         |
| `ngAfterContentInit`    | After `<ng-content>` projection    |
| `ngAfterContentChecked` | After each content check           |
| `ngAfterViewInit`       | After template + children render   |
| `ngAfterViewChecked`    | After each view check              |
| `ngOnDestroy`           | Just before component is destroyed |

### 🎤 Practice question

> _"Where do you make HTTP calls in a component — constructor or ngOnInit — and why?"_

---

## 7. constructor vs ngOnInit

### 🗣️ Spoken answer

> "The **constructor** runs first — it's JavaScript's class constructor, fired when Angular instantiates the class. At this point, Angular has set up dependency injection but has NOT yet processed `@Input` bindings. So `this.myInput` is undefined in the constructor. Use the constructor only to inject services with `inject()` and initialise signals or computed values. **ngOnInit** runs once after Angular has set the component's inputs. This is where you make HTTP calls, subscribe to observables, or read input values. The rule: constructor = DI setup; ngOnInit = initialisation logic that depends on inputs or that has side effects."

```ts
export class UserComponent {
  // inject in field initializer — preferred modern style
  private readonly service = inject(UserService);
  readonly userId = input.required<string>();

  // safe: signal initialised in field, no inputs needed
  readonly data = signal<User | null>(null);

  ngOnInit() {
    // userId() is available here
    this.service.getUser(this.userId()).subscribe(u => this.data.set(u));
  }
}
```

### 🎤 Practice question

> _"Why should you not make HTTP calls in the constructor?"_

---

## 8. DOM Basics & Terminology

### 🗣️ Spoken answer fast-reference

| Term                        | Definition                                                     |
| --------------------------- | -------------------------------------------------------------- |
| **DOM**                     | Document Object Model — browser's live tree of nodes from HTML |
| **Node**                    | Any item in the DOM tree — element, text, comment              |
| **Element node**            | A rendered HTML element like `<div>`                           |
| **Event**                   | Browser signal: click, keydown, scroll, resize                 |
| **Event bubbling**          | Event travels up from target to document root                  |
| **Event capturing**         | Event travels down from root to target (less common)           |
| **event.stopPropagation()** | Prevents bubble/capture from continuing                        |
| **event.preventDefault()**  | Cancels default browser action (e.g. form submit reload)       |
| **querySelector**           | `document.querySelector('.btn')` — first match                 |
| **querySelectorAll**        | NodeList of all matches                                        |
| **Virtual DOM**             | React's abstraction — Angular does NOT use a virtual DOM       |

### 🎤 Practice question

> _"What is event bubbling? How does Angular handle it?"_

---

## 9. Event Bubbling & Document Root

### 🗣️ Spoken answer

> "When you click a button inside a div, the click event fires on the button first — that's the **target**. Then it **bubbles up**: it fires on the parent div, then the parent section, all the way up to `<body>`, then `<html>`, then the **document root** — `document` itself. This is event bubbling. It's why you can put one listener on a parent container to handle events from many children — called **event delegation**. `stopPropagation()` stops the bubble at that element. Angular's `(click)` binding uses bubbling normally. `$event.target` is the element that was actually clicked; `$event.currentTarget` is the element the listener is on."

```html
<!-- Angular handles bubbling transparently -->
<div (click)="onContainerClick($event)">
  <button (click)="onButtonClick($event)">Click me</button>
</div>
<!-- Both handlers fire — button first, then div -->

<!-- Stop the bubble -->
<button (click)="$event.stopPropagation(); doSomething()">Click</button>
```

### Document root

`window` > `document` > `<html>` > `<body>` > your elements. Events bubble all the way up unless stopped.

### 🎤 Practice question

> _"What is event bubbling? What is `stopPropagation` and when would you use it?"_

---

## 10. Template-Driven Forms

### 🗣️ Spoken answer

> "Template-driven forms put the form logic in the HTML template using Angular directives — `ngModel` for two-way binding and `ngForm` on the form element. Angular automatically builds the `FormGroup` and `FormControl` tree behind the scenes based on what it finds in the template. They're good for simple, small forms where you don't need complex cross-field validation or programmatic control. The downside: they're asynchronous — the form model isn't available until after `AfterViewInit`, and unit testing is harder because the form structure lives in the template."

### Syntax

```html
<form #myForm="ngForm" (ngSubmit)="onSubmit(myForm)">
  <input name="email" [(ngModel)]="user.email" required email />
  <button type="submit" [disabled]="myForm.invalid">Submit</button>
</form>
```

### 🎤 Practice question

> _"What is a template-driven form and when would you choose it over a reactive form?"_

---

## 11. Reactive Forms

### 🗣️ Spoken answer

> "Reactive forms are model-driven — you define the form structure explicitly in the component class using `FormBuilder` or `new FormGroup()`. The form model is synchronous and available immediately in the constructor. This gives you full programmatic control: dynamic fields, complex cross-field validators, reacting to value changes with RxJS. They're the right choice for anything non-trivial. In Angular, you import `ReactiveFormsModule` or use the `FormBuilder` directly with `inject(FormBuilder)`."

### Syntax

```ts
// component
readonly fb = inject(FormBuilder);

readonly form = this.fb.group({
  email: ['', [Validators.required, Validators.email]],
  password: ['', [Validators.required, Validators.minLength(8)]],
});

onSubmit() {
  if (this.form.invalid) return;
  console.log(this.form.value); // { email: '...', password: '...' }
}
```

```html
<form [formGroup]="form" (ngSubmit)="onSubmit()">
  <input formControlName="email" />
  @if (form.get('email')?.hasError('required')) {
  <span>Email is required</span>
  }
  <button type="submit" [disabled]="form.invalid">Submit</button>
</form>
```

### 🎤 Practice question

> _"How do you create and validate a reactive form in Angular?"_

---

## 12. Form Validation & Manipulation

### 🗣️ Spoken answer

> "Angular provides built-in validators: `required`, `email`, `minLength`, `maxLength`, `pattern`, `min`, `max`. For custom logic, you write a validator function that receives an `AbstractControl` and returns `null` if valid or an error object if invalid. For cross-field validation like confirming passwords match, you put the validator on the parent `FormGroup` so it can access both controls. Programmatically you can call `form.setValue()` to set all fields, `form.patchValue()` to set only some, `form.reset()` to clear, and `form.get('field')?.disable()` to disable a control."

### Custom validator

```ts
function noSpaces(control: AbstractControl): ValidationErrors | null {
  return control.value?.includes(' ') ? { noSpaces: true } : null;
}

// Usage
this.fb.control('', [Validators.required, noSpaces]);
```

### Cross-field validator

```ts
function passwordMatch(group: AbstractControl): ValidationErrors | null {
  const pass = group.get('password')?.value;
  const confirm = group.get('confirm')?.value;
  return pass === confirm ? null : { mismatch: true };
}

this.fb.group({ password: [''], confirm: [''] }, { validators: passwordMatch });
```

### 🎤 Practice question

> _"How do you validate that two password fields match in a reactive form?"_

---

## 13. General Form Rules

### 🗣️ Spoken answer

> "Key rules: never trust client-side validation alone — always validate on the server too. Disable the submit button when the form is invalid using `[disabled]='form.invalid'`. Mark controls as touched to show error messages only after the user has interacted: `form.markAllAsTouched()` on submit. Use `form.getRawValue()` instead of `form.value` if you have disabled controls — `value` omits them. For async validators — like checking if a username is taken — use the third parameter of `FormControl` and return an Observable."

### 🎤 Practice question

> _"What are some best practices when working with forms in Angular?"_

---

## 14. A11y Basics

### 🗣️ Spoken answer

> "Accessibility means building UIs that work for everyone, including people using screen readers, keyboard navigation, or high-contrast modes. The standard is WCAG — Web Content Accessibility Guidelines. The four pillars are Perceivable, Operable, Understandable, Robust — abbreviated POUR. In practice: semantic HTML first, keyboard navigability, sufficient color contrast, and meaningful text alternatives for non-text content."

### 🎤 Practice question

> _"How do you approach accessibility in a web application?"_

---

## 15. Semantic HTML

### 🗣️ Spoken answer

> "Semantic HTML means using elements that describe their meaning, not just their appearance. `<nav>` instead of `<div class='nav'>`. `<main>`, `<header>`, `<footer>`, `<article>`, `<section>`, `<aside>`. Screen readers use these landmark roles to let users jump directly to main content, navigation, etc. `<button>` instead of a `<div>` with a click handler — because you get keyboard focus, Enter/Space handling, and the right ARIA role for free. The rule: if HTML has an element for it, use it instead of a generic div or span."

### 🎤 Practice question

> _"Why use `<button>` instead of `<div (click)='...'>`?"_

---

## 16. ARIA & Alt Text

### 🗣️ Spoken answer

> "ARIA — Accessible Rich Internet Applications — is a set of HTML attributes that communicate roles, states, and properties to assistive technologies. The first rule of ARIA: don't use ARIA if native HTML gives you the semantics for free. When you need it: `role='dialog'` on a modal, `aria-label='Close dialog'` on an icon button with no text, `aria-live='polite'` on a region that updates dynamically like a notification area. Alt text on images: if the image conveys information, describe it. If it's decorative, set `alt=''` — empty string, not missing — so screen readers skip it."

### Rules

- `aria-label` → overrides the accessible name
- `aria-labelledby` → points to another element's text as the label
- `aria-describedby` → links to supplemental description
- `aria-live` → announces dynamic changes (`polite` waits, `assertive` interrupts)
- `alt=""` → decorative image, explicit skip
- `alt="meaningful text"` → informative image

### 🎤 Practice question

> _"When should you use `aria-label` and when should you use `alt`?"_

---

## 17. HTTP CRUD with HttpClient

### 🗣️ Spoken answer

> "Angular's `HttpClient` is a typed, injectable service that wraps the browser's HTTP mechanism and returns Observables. You never need to call `fetch` directly. Every method — `get`, `post`, `put`, `delete` — takes a generic type parameter so the response is typed end-to-end. You provide it globally with `provideHttpClient(withInterceptors([...]))` in `app.config.ts`."

### CRUD pattern

```ts
// service
getUsers()           => this.http.get<User[]>(url)
getUser(id: string)  => this.http.get<User>(`${url}/${id}`)
addUser(u: User)     => this.http.post<User>(url, u)
updateUser(u: User)  => this.http.put<User>(`${url}/${u.id}`, u)
deleteUser(id)       => this.http.delete<void>(`${url}/${id}`)
```

### 🎤 Practice question

> _"Walk me through how you'd implement a full CRUD service in Angular."_

---

## 18. ViewChild & Content Projection

### 🗣️ Spoken answer

> "`viewChild()` is a signal-based query that gives you a reference to a child element or component in your template. You use it to call methods or read properties of a child component, or to get a DOM element reference wrapped in `ElementRef`. It replaces the decorator-based `@ViewChild`. Content projection with `<ng-content>` allows a component to accept a slot of HTML from its parent — like `<Button><span>Click me</span></Button>` where the span is projected into the button's template. You can have multiple projection slots with `select`: `<ng-content select='.header'>` only projects elements with class `header`."

```ts
// Signal-based ViewChild
readonly table = viewChild.required<TableComponent>(TableComponent);

ngAfterViewInit() {
  this.table().refresh(); // call child method
}

// ViewChildren — all matches, returns Signal<ReadonlyArray<T>>
readonly items = viewChildren(ItemComponent);
```

```html
<!-- ng-content — content projection -->
<app-card>
  <ng-container slot-header>My Title</ng-container>
  <p>Card body content</p>
</app-card>

<!-- Inside app-card template -->
<div class="card">
  <ng-content select="[slot-header]" />
  <ng-content />
</div>
```

### 🎤 Practice question

> _"What is `viewChild()` in Angular and when would you use it over a regular `@Input`?"_

---

---

## 19. ViewChild — Concrete Use Cases

### 🗣️ Spoken answer

> "`viewChild` is for when you need to reach into a child component and call its method directly, or get a native DOM element. The classic use cases: 1) You have a `<dialog>` element and need to call `dialog.showModal()` — you can't do that from a binding; 2) You wrap a third-party charting library and need to call `chart.resize()` after the container changes size; 3) You need to programmatically focus an input element: `this.input().nativeElement.focus()`; 4) You have a shared `TableComponent` with a `refresh()` method you need to trigger from the parent. You use `@Input` when the parent passes data down. You use `viewChild` when the parent needs to call behaviour on the child."

```ts
// Use case: focus an input programmatically
readonly searchInput = viewChild.required<ElementRef<HTMLInputElement>>('searchInput');

openSearch() {
  this.searchInput().nativeElement.focus();
}
```

```html
<input #searchInput type="search" />
```

### 🎤 Practice question

> _"When would you use `viewChild` instead of just passing data with `@Input`?"_

---
