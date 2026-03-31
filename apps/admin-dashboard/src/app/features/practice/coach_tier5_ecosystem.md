# 🔴 Tier 5 — Ecosystem & Architecture

> Tooling, testing, deployment. Shows you've shipped real projects.
> ← Back to [main index](interview_coach_2026.md)

---

## 📋 Contents

1. [Order of "Times" — compile-time, build-time, runtime](#1-order-of-times-compile-time-build-time-runtime)
2. [TypeScript Compilation in Angular](#2-typescript-compilation-in-angular)
3. [Runtime vs Build-Time](#3-runtime-vs-build-time)
4. [TypeScript Generics](#4-typescript-generics)
5. [esbuild & Minification](#5-esbuild-minification)
6. [Vite](#6-vite)
7. [Build Terminology](#7-build-terminology)
8. [tsconfig](#8-tsconfig)
9. [angular.json / project.json](#9-angularjson-projectjson)
10. [Testing Basics — Components & Scope](#10-testing-basics-components-scope)
11. [Service Worker](#11-service-worker)
12. [PWAs](#12-pwas)
13. [Web Components](#13-web-components)
14. [Capacitor](#14-capacitor)
15. [Browser & Server Basics](#15-browser-server-basics)

---

## 1. Order of "Times" — compile-time, build-time, runtime

### 🗣️ Spoken answer

> "Yes — **compile-time and build-time are the same thing** in Angular. The sequence is: first you write source code; then at **build time / compile time** the tools run — TypeScript type-checking, Angular template compilation (AOT), bundling, minification, tree-shaking — everything in the `dist/` output is produced here. Then at **deploy time** you copy that `dist/` to a server or CDN — usually one step. Then at **load time / parse time**, the browser downloads the files, parses the HTML and JavaScript — this is where the JS engine reads and JIT-compiles the bytecode. Then at **runtime**, the app is running in the browser — components mount, HTTP calls happen, the user interacts, DOM updates. Errors at build time are best — they never reach users. Errors at runtime are worst."

### Timeline

```
Source code (you write it)
    ↓ BUILD TIME / COMPILE TIME
tsc + Ivy AOT + esbuild → dist/
    ↓ DEPLOY TIME
Upload dist/ to server/CDN
    ↓ LOAD TIME
Browser downloads + parses files
    ↓ RUNTIME
App runs — user interacts, HTTP calls, DOM updates
```

### 🎤 Practice question

> _"Is compile-time the same as build-time? Walk me through the stages before the user sees the app."_

---

## 2. TypeScript Compilation in Angular

### 🗣️ Spoken answer

> "The pipeline: TypeScript source is compiled by `tsc` according to `tsconfig.json`, which checks types and transpiles to JavaScript. In Angular, the Angular compiler — called Ivy — runs at the same time and compiles Angular templates and decorators into efficient JavaScript. In production, Angular uses AOT — Ahead-of-Time compilation — so the browser receives pre-compiled JavaScript; no compilation happens in the browser. In development historically JIT was used but AOT is now default always. Then esbuild bundles, minifies, and tree-shakes the output into the final dist files."

### Pipeline

```
TypeScript source
     ↓
tsc (type checking) + Ivy (template compilation) → JavaScript
     ↓
esbuild (bundle + minify + tree-shake)
     ↓
dist/ (optimised production files)
```

### 🎤 Practice question

> _"What happens to your Angular TypeScript code before it runs in the browser?"_

---

## 3. Runtime vs Build-Time

### 🗣️ Spoken answer

> "**Build-time** is everything that happens before the code is sent to the browser — TypeScript compilation, template compilation (AOT), bundling, tree-shaking, minification. Errors caught at build time prevent broken code from ever reaching users. **Runtime** is what happens in the browser after the code is loaded — component instantiation, state changes, HTTP requests, DOM updates. Angular prefers catching things at build time: AOT detects template errors, TypeScript catches type mismatches, `strict` mode prevents null dereferences. Lazy-loaded chunks are downloaded at runtime when needed — that's a runtime concern triggered by the router."

### 🎤 Practice question

> _"What's the difference between a build-time error and a runtime error in Angular?"_

---

## 4. TypeScript Generics

### 🗣️ Spoken answer

> "Generics let you write reusable, type-safe code that works with multiple types without losing type information. The canonical example is an identity function or a typed container. You declare a type parameter with angle brackets — `<T>` — and the compiler infers or accepts the type at the call site. In Angular, `HttpClient.get<User[]>(url)` uses a generic to tell TypeScript what type the response body should be. `Signal<T>` and `WritableSignal<T>` are generics you use every day. The rule: when you'd otherwise write `any`, reach for a generic."

```ts
// Generic function
function first<T>(arr: T[]): T | undefined {
  return arr[0];
}

// Generic interface
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

// Usage
const res: ApiResponse<User[]> = await getUsers();
```

### 🎤 Practice question

> _"What are TypeScript generics and where have you used them in Angular?"_

---

## 5. esbuild & Minification

### 🗣️ Spoken answer

> "esbuild is a JavaScript bundler and transpiler written in Go — it's dramatically faster than Webpack because it runs natively and can parallelize work. Angular 17+ uses esbuild as the default builder via `@angular-devkit/build-angular:application`. Minification is the process of removing whitespace, shortening variable names, eliminating dead code — making the bundle file smaller for faster download. esbuild does this in milliseconds. The related concept is tree-shaking: removing code that's imported but never used, which reduces bundle size."

### 🎤 Practice question

> _"What is esbuild and why did Angular switch to it?"_

---

## 6. Vite

### 🗣️ Spoken answer

> "Vite is a dev server and build tool that uses native ES modules in the browser during development — so it doesn't bundle anything at dev time, making cold start near-instant and hot module replacement very fast. For production builds it uses Rollup. Angular's new dev server also uses Vite-based techniques for the same reason. The core insight is: modern browsers understand ES modules natively, so during development you can skip the bundling step entirely and just serve files directly."

### 🎤 Practice question

> _"Why is Vite faster than traditional bundlers like Webpack during development?"_

---

## 7. Build Terminology

### 🗣️ Spoken answer fast-reference

| Term               | One-liner                                                                    |
| ------------------ | ---------------------------------------------------------------------------- |
| **Bundle**         | Multiple files merged into one (or few) files for the browser                |
| **Tree-shaking**   | Remove unused exported code at build time                                    |
| **Minification**   | Remove whitespace + shorten identifiers to reduce file size                  |
| **Transpilation**  | Convert TypeScript/ES2022 → ES5 or target syntax                             |
| **AOT**            | Ahead-of-Time: Angular compiles templates at build time (production default) |
| **JIT**            | Just-in-Time: Angular compiles templates in the browser (dev mode only)      |
| **Source map**     | File mapping minified code back to original source for debugging             |
| **Chunk**          | A lazily-loaded piece of the bundle                                          |
| **Code splitting** | Splitting the bundle into chunks loaded on demand                            |
| **HMR**            | Hot Module Replacement — update modules in browser without full reload       |

### 🎤 Practice question

> _"What is the difference between AOT and JIT compilation in Angular?"_

---

## 8. tsconfig

### 🗣️ Spoken answer

> "`tsconfig.json` is the TypeScript configuration file — it tells `tsc` which files to compile, what target JavaScript version to emit, which type checks to enable, and module resolution settings. In Angular the important options: `strict: true` enables all strict checks; `target` sets the output JS version; `paths` maps module aliases for clean imports; `lib` includes browser or Node type definitions. In an Nx monorepo you have a root `tsconfig.base.json` with shared settings and each project extends it with its own `tsconfig.json`."

### Key options

```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "bundler",
    "paths": {
      "@myapp/models": ["libs/models/src/index.ts"]
    }
  }
}
```

### 🎤 Practice question

> _"What is `tsconfig.json` and what are the most important options in an Angular project?"_

---

## 9. angular.json / project.json

### 🗣️ Spoken answer

> "`angular.json` is the Angular workspace configuration — it defines every project in the workspace, their builders, build targets, and options like output paths, assets, styles, file replacements for environments. In Nx monorepos, this is split into per-project `project.json` files for better scalability. The most important section is `architect` (or `targets` in Nx): it maps target names like `build`, `serve`, `test`, `lint` to their executors and configurations. Swapping esbuild from Webpack is done here by changing the builder from `@angular-devkit/build-angular:browser` to `@angular-devkit/build-angular:application`."

### 🎤 Practice question

> _"What is `angular.json` and what does it control?"_

---

## 10. Testing Basics — Components & Scope

### 🗣️ Spoken answer

> "In Angular we use Jest (or Jasmine) with `TestBed` — Angular's testing utility for creating a mini Angular environment in the test runner. For a component test: `TestBed.configureTestingModule({ imports: [MyComponent] })` for standalone components, then `TestBed.createComponent(MyComponent)` which gives you a `ComponentFixture`. `fixture.detectChanges()` triggers the first change detection cycle. For services that make HTTP calls: `HttpTestingController` lets you mock requests and assert what URL was called with what body."

### Component test skeleton

```ts
describe('UserListComponent', () => {
  let fixture: ComponentFixture<UserListComponent>;
  let component: UserListComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserListComponent],
      providers: [{ provide: UsersStore, useValue: { users: signal([]) } }],
    }).compileComponents();

    fixture = TestBed.createComponent(UserListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render', () => {
    expect(component).toBeTruthy();
  });
});
```

### Scope rules

- Don't test Angular's own framework behaviour
- Test component outputs and rendered HTML, not internal state directly
- Mock all dependencies (services, stores, router)
- **arrange** → **act** → **assert**

### 🎤 Practice question

> _"How do you test an Angular component that depends on a service?"_

---

## 11. Service Worker

### 🗣️ Spoken answer

> "A Service Worker is a JavaScript file that runs in a separate background thread — not the main thread — and acts as a programmable proxy between the browser and the network. It can intercept fetch requests, serve cached assets when offline, receive push notifications, and sync data in the background. The lifecycle: install → activate → idle/fetch. It only works on HTTPS, or localhost for development. In Angular, `@angular/pwa` registers a Service Worker that pre-caches the app shell so it loads instantly even offline. You don't write the Service Worker manually — Angular generates the `ngsw-config.json` and compiles a ready-made worker."

### 🎤 Practice question

> _"What is a Service Worker and how does Angular use one for PWAs?"_

---

## 12. PWAs

### 🗣️ Spoken answer

> "A Progressive Web App is a web application that uses browser APIs to behave like a native app: installable on the home screen, works offline via Service Worker caching, gets push notifications, fast because assets are cached. The Service Worker is the key — it's a background script that intercepts network requests and can serve cached responses when offline. In Angular, you add PWA support with `ng add @angular/pwa`, which sets up the Service Worker and a Web App Manifest. The manifest tells the browser the app name, icons, and the display mode — `standalone` makes it open like a native app without browser chrome."

### 🎤 Practice question

> _"What is a PWA and what makes a web app qualify as one?"_

---

## 13. Web Components

### 🗣️ Spoken answer

> "Web Components are a set of native browser standards — Custom Elements, Shadow DOM, and HTML Templates — that let you create reusable encapsulated HTML elements without any framework. They work in any browser and any framework. In Angular you can consume Web Components in templates without any special treatment — Angular treats them like regular HTML elements. You can also export Angular components as Web Components using Angular Elements, which wraps a component so it can be used outside Angular."

### 🎤 Practice question

> _"What are Web Components and how do they relate to Angular components?"_

---

## 14. Capacitor

### 🗣️ Spoken answer

> "Capacitor is a native runtime by the Ionic team that lets you wrap a web app — Angular included — and deploy it as a native iOS or Android app. You build your Angular app as normal, then Capacitor wraps it in a native WebView. The Angular code runs unchanged; Capacitor provides a JavaScript bridge to native APIs like Camera, Push Notifications, Filesystem. The routing, HTTP services, and state management are identical to the web version. The key concern is auth: token-based Bearer auth works natively in the WebView without CORS issues — which is already handled by an auth interceptor."

### 🎤 Practice question

> _"How would you turn an Angular app into a mobile app using Capacitor?"_

---

## 15. Browser & Server Basics

### 🗣️ Spoken answer

> "When you type a URL and press Enter: the browser checks its DNS cache, then queries a DNS resolver to get the IP address of the domain. Then it opens a TCP connection (three-way handshake), upgrades to TLS for HTTPS, sends an HTTP request. The server responds with HTML. The browser parses HTML, discovers CSS and JS files, fetches them (possibly in parallel), builds the DOM and CSSOM, runs the JavaScript, and paints the screen. In an Angular app, the server usually returns `index.html` with the JS bundle — Angular bootstraps in the browser and takes over from there. With SSR (Angular Universal), the server renders the initial HTML before the bundle arrives."

### Key terms

- **DNS** — domain name → IP address
- **TCP** — connection protocol (reliable, ordered)
- **TLS/SSL** — encryption layer for HTTPS
- **HTTP/2** — multiplexed, header compression
- **CDN** — delivers static assets from edge servers near the user

### 🎤 Practice question

> _"What happens from when a user types a URL to when they see the Angular app?"_

---
