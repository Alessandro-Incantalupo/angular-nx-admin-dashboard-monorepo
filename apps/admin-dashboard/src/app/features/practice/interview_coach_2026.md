# 🎙️ Angular Senior Interview Coach — Full Prep 2026

> One file per tier. Study bottom-up. Don't jump to Tier 3 if Tier 1 is shaky.
> Section numbers are stable across all files — use them to cross-reference exercises.

---

## 🗺️ Tier System

| Tier | File                                                  | Topics | Focus                                       |
| ---- | ----------------------------------------------------- | ------ | ------------------------------------------- |
| 🟢 1 | [Tier 1 — Foundations](coach_tier1_foundations.md)    | 16     | HTML, CSS, JS, OOP, HTTP basics             |
| 🔵 2 | [Tier 2 — Angular Core](coach_tier2_angular_core.md)  | 19     | Components, forms, lifecycle, DI, DOM       |
| 🟡 3 | [Tier 3 — Reactive Patterns](coach_tier3_reactive.md) | 10     | Observables, RxJS, async pipe, streams      |
| 🟠 4 | [Tier 4 — Advanced Angular](coach_tier4_advanced.md)  | 14     | Signals, OnPush, interceptors, performance  |
| 🔴 5 | [Tier 5 — Ecosystem](coach_tier5_ecosystem.md)        | 15     | Build tools, testing, tooling, architecture |

> **Rule for non-technical interviewers:** stay in Tier 1–2 vocabulary even when answering Tier 4 topics.

---

## 📑 Full Index — by Number

| #   | Topic                                                                                                                               | Tier |
| --- | ----------------------------------------------------------------------------------------------------------------------------------- | ---- |
| 1   | [Observables — what they are](coach_tier3_reactive.md#1-observables--what-they-are)                                                 | 🟡   |
| 2   | [Subscribe & Unsubscribe](coach_tier3_reactive.md#2-subscribe--unsubscribe)                                                         | 🟡   |
| 3   | [Hot vs Cold Observables](coach_tier3_reactive.md#3-hot-vs-cold-observables)                                                        | 🟡   |
| 4   | [Subject vs BehaviorSubject](coach_tier3_reactive.md#4-subject-vs-behaviorsubject)                                                  | 🟡   |
| 5   | [Promises vs Observables](coach_tier3_reactive.md#5-promises-vs-observables)                                                        | 🟡   |
| 6   | [Top RxJS Operators](coach_tier3_reactive.md#6-top-rxjs-operators)                                                                  | 🟡   |
| 7   | [switchMap vs concatMap](coach_tier3_reactive.md#7-switchmap-vs-concatmap)                                                          | 🟡   |
| 8   | [distinctUntilChanged & debounceTime](coach_tier3_reactive.md#8-distinctuntilchanged--debouncetime)                                 | 🟡   |
| 9   | [HTTP CRUD with HttpClient](coach_tier2_angular_core.md#9-http-crud-with-httpclient)                                                | 🔵   |
| 10  | [Template-Driven Forms](coach_tier2_angular_core.md#10-template-driven-forms)                                                       | 🔵   |
| 11  | [Reactive Forms](coach_tier2_angular_core.md#11-reactive-forms)                                                                     | 🔵   |
| 12  | [Data Binding](coach_tier2_angular_core.md#12-data-binding)                                                                         | 🔵   |
| 13  | [Form Validation & Manipulation](coach_tier2_angular_core.md#13-form-validation--manipulation)                                      | 🔵   |
| 14  | [General Form Rules](coach_tier2_angular_core.md#14-general-form-rules)                                                             | 🔵   |
| 15  | [A11y Basics](coach_tier2_angular_core.md#15-a11y-basics)                                                                           | 🔵   |
| 16  | [Semantic HTML](coach_tier2_angular_core.md#16-semantic-html)                                                                       | 🔵   |
| 17  | [ARIA & Alt Text](coach_tier2_angular_core.md#17-aria--alt-text)                                                                    | 🔵   |
| 18  | [Framework vs Library](coach_tier2_angular_core.md#18-framework-vs-library)                                                         | 🔵   |
| 19  | [Web Components](coach_tier5_ecosystem.md#19-web-components)                                                                        | 🔴   |
| 20  | [Capacitor](coach_tier5_ecosystem.md#20-capacitor)                                                                                  | 🔴   |
| 21  | [esbuild & Minification](coach_tier5_ecosystem.md#21-esbuild--minification)                                                         | 🔴   |
| 22  | [Vite](coach_tier5_ecosystem.md#22-vite)                                                                                            | 🔴   |
| 23  | [Build Terminology](coach_tier5_ecosystem.md#23-build-terminology)                                                                  | 🔴   |
| 24  | [Testing Basics — Components & Scope](coach_tier5_ecosystem.md#24-testing-basics--components--scope)                                | 🔴   |
| 25  | [Flexbox](coach_tier1_foundations.md#25-flexbox)                                                                                    | 🟢   |
| 26  | [CSS Specificity](coach_tier1_foundations.md#26-css-specificity)                                                                    | 🟢   |
| 27  | [Breakpoints & Responsive](coach_tier1_foundations.md#27-breakpoints--responsive)                                                   | 🟢   |
| 28  | [HTML Basic Terminology](coach_tier1_foundations.md#28-html-basic-terminology)                                                      | 🟢   |
| 29  | [Object Manipulation & Methods](coach_tier1_foundations.md#29-object-manipulation--methods)                                         | 🟢   |
| 30  | [Types & TypeScript Basics](coach_tier1_foundations.md#30-types--typescript-basics)                                                 | 🟢   |
| 31  | [TypeScript Compilation in Angular](coach_tier5_ecosystem.md#31-typescript-compilation-in-angular)                                  | 🔴   |
| 32  | [Closures & Hoisting](coach_tier1_foundations.md#32-closures--hoisting)                                                             | 🟢   |
| 33  | [Pure Functions & Memoization](coach_tier1_foundations.md#33-pure-functions--memoization)                                           | 🟢   |
| 34  | [TypeScript Generics](coach_tier5_ecosystem.md#34-typescript-generics)                                                              | 🔴   |
| 35  | [Zone.js & Zoneless](coach_tier4_advanced.md#35-zonejs--zoneless)                                                                   | 🟠   |
| 36  | [Change Detection — OnPush](coach_tier4_advanced.md#36-change-detection--onpush)                                                    | 🟠   |
| 37  | [Signals](coach_tier4_advanced.md#37-signals)                                                                                       | 🟠   |
| 38  | [computed() & linkedSignal()](coach_tier4_advanced.md#38-computed--linkedsignal)                                                    | 🟠   |
| 39  | [effect()](coach_tier4_advanced.md#39-effect)                                                                                       | 🟠   |
| 40  | [PWAs](coach_tier5_ecosystem.md#40-pwas)                                                                                            | 🔴   |
| 41  | [Eager vs Lazy Loading](coach_tier4_advanced.md#41-eager-vs-lazy-loading)                                                           | 🟠   |
| 42  | [@defer](coach_tier4_advanced.md#42-defer)                                                                                          | 🟠   |
| 43  | [@for Cycle Syntax](coach_tier4_advanced.md#43-for-cycle-syntax)                                                                    | 🟠   |
| 44  | [tsconfig](coach_tier5_ecosystem.md#44-tsconfig)                                                                                    | 🔴   |
| 45  | [angular.json / project.json](coach_tier5_ecosystem.md#45-angularjson--projectjson)                                                 | 🔴   |
| 46  | [Interceptors](coach_tier4_advanced.md#46-interceptors)                                                                             | 🟠   |
| 47  | [Lifecycle Hooks](coach_tier2_angular_core.md#47-lifecycle-hooks)                                                                   | 🔵   |
| 48  | [DOM Basics & Terminology](coach_tier2_angular_core.md#48-dom-basics--terminology)                                                  | 🔵   |
| 49  | [Shadow DOM](coach_tier4_advanced.md#49-shadow-dom)                                                                                 | 🟠   |
| 50  | [Runtime vs Build-Time](coach_tier5_ecosystem.md#50-runtime-vs-build-time)                                                          | 🔴   |
| 51  | [Error Handling](coach_tier4_advanced.md#51-error-handling)                                                                         | 🟠   |
| 52  | [npm vs pnpm](coach_tier2_angular_core.md#52-npm-vs-pnpm)                                                                           | 🔵   |
| 53  | [Browser & Server Basics](coach_tier5_ecosystem.md#53-browser--server-basics)                                                       | 🔴   |
| 54  | [ViewChild & Content Projection](coach_tier2_angular_core.md#54-viewchild--content-projection)                                      | 🔵   |
| 55  | [async Pipe](coach_tier3_reactive.md#55-async-pipe)                                                                                 | 🟡   |
| 56  | [JSON](coach_tier1_foundations.md#56-json)                                                                                          | 🟢   |
| 57  | [REST, REST APIs & SOAP](coach_tier1_foundations.md#57-rest-rest-apis--soap)                                                        | 🟢   |
| 58  | [ES Modules vs CommonJS & ECMAScript](coach_tier1_foundations.md#58-es-modules-vs-commonjs--ecmascript)                             | 🟢   |
| 59  | [main.ts, index.html & app.config.ts](coach_tier2_angular_core.md#59-maints-indexhtml--appconfigts)                                 | 🔵   |
| 60  | [Mutability vs Immutability](coach_tier3_reactive.md#60-mutability-vs-immutability)                                                 | 🟡   |
| 61  | [Order of "Times" — compile-time, build-time, runtime](coach_tier5_ecosystem.md#61-order-of-times--compile-time-build-time-runtime) | 🔴   |
| 62  | [The Event Loop](coach_tier1_foundations.md#62-the-event-loop)                                                                      | 🟢   |
| 63  | [Temporal Dead Zone (TDZ)](coach_tier1_foundations.md#63-temporal-dead-zone-tdz)                                                    | 🟢   |
| 64  | [Writable vs Read-only Signals](coach_tier4_advanced.md#64-writable-vs-read-only-signals)                                           | 🟠   |
| 65  | [Service Worker](coach_tier5_ecosystem.md#65-service-worker)                                                                        | 🔴   |
| 66  | [HTTP Protocol Basics](coach_tier1_foundations.md#66-http-protocol-basics)                                                          | 🟢   |
| 67  | [constructor vs ngOnInit](coach_tier2_angular_core.md#67-constructor-vs-ngoninit)                                                   | 🔵   |
| 68  | [Event Bubbling & Document Root](coach_tier2_angular_core.md#68-event-bubbling--document-root)                                      | 🔵   |
| 69  | [View Encapsulation — Plain English](coach_tier4_advanced.md#69-view-encapsulation--plain-english)                                  | 🟠   |
| 70  | [Runtime Error Examples](coach_tier4_advanced.md#70-runtime-error-examples)                                                         | 🟠   |
| 71  | [Why Node.js is Relevant to Angular & npm](coach_tier2_angular_core.md#71-why-nodejs-is-relevant-to-angular--npm)                   | 🔵   |
| 72  | [Browser Basics — Simplified](coach_tier1_foundations.md#72-browser-basics--simplified)                                             | 🟢   |
| 73  | [ViewChild — Concrete Use Cases](coach_tier2_angular_core.md#73-viewchild--concrete-use-cases)                                      | 🔵   |
| 74  | [OOP Basics](coach_tier1_foundations.md#74-oop-basics)                                                                              | 🟢   |

---

## 🏁 Quick-fire Cheatsheet — one-liners for non-technical interviewers

| Q                             | A                                                                                     |
| ----------------------------- | ------------------------------------------------------------------------------------- |
| What is Angular?              | Component-based framework for building web apps, maintained by Google                 |
| What is a component?          | A reusable UI block with its own HTML template, styles, and logic                     |
| What is a module?             | (Legacy) A grouping of related components/services. Modern Angular is module-free     |
| What is dependency injection? | A pattern where Angular provides class instances ("services") to components on demand |
| What is a service?            | A singleton class for business logic and HTTP calls, shared across components         |
| What is a guard?              | A function that decides if a route can be activated or deactivated                    |
| What is a pipe?               | A template function that transforms a displayed value (`date`, `currency`, `async`)   |
| What is SSR?                  | Server-Side Rendering — Angular runs on the server and sends pre-rendered HTML        |
| What is a monorepo?           | A single repository containing multiple projects sharing code under `libs/`           |
| What is Nx?                   | A smart monorepo build system with caching, affected commands, and code generators    |
