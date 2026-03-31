# 🟢 Tier 1 — Foundations

> Language & Web — no framework needed. Get these cold first.
> ← Back to [main index](interview_coach_2026.md)

---

## 📋 Contents

1. [HTML Basic Terminology](#1-html-basic-terminology)
2. [JSON](#2-json)
3. [HTTP Protocol Basics](#3-http-protocol-basics)
4. [REST, REST APIs & SOAP](#4-rest-rest-apis-soap)
5. [Browser Basics — Simplified](#5-browser-basics-simplified)
6. [Flexbox](#6-flexbox)
7. [CSS Specificity](#7-css-specificity)
8. [Breakpoints & Responsive](#8-breakpoints-responsive)
9. [Object Manipulation & Methods](#9-object-manipulation-methods)
10. [Types & TypeScript Basics](#10-types-typescript-basics)
11. [The Event Loop](#11-the-event-loop)
12. [Closures & Hoisting](#12-closures-hoisting)
13. [Temporal Dead Zone (TDZ)](#13-temporal-dead-zone-tdz)
14. [ES Modules vs CommonJS & ECMAScript](#14-es-modules-vs-commonjs-ecmascript)
15. [Pure Functions & Memoization](#15-pure-functions-memoization)
16. [OOP Basics](#16-oop-basics)

---

## 1. HTML Basic Terminology

### 🗣️ Spoken answer fast-reference

| Term               | Definition                                                            |
| ------------------ | --------------------------------------------------------------------- |
| **Element**        | An HTML structure: opening tag + content + closing tag                |
| **Tag**            | The opening `<div>` or closing `</div>` marker                        |
| **Attribute**      | Key-value pair on an opening tag: `class="btn"`                       |
| **DOM**            | Document Object Model — the browser's tree representation of the HTML |
| **Void element**   | Self-closing, no children: `<img>`, `<input>`, `<br>`                 |
| **Block element**  | Takes full width: `<div>`, `<p>`, `<h1>`                              |
| **Inline element** | Only as wide as content: `<span>`, `<a>`, `<strong>`                  |
| **metadata**       | `<meta>`, `<link>`, `<title>` in `<head>` — not rendered              |
| **DOCTYPE**        | `<!DOCTYPE html>` — tells browser to use HTML5 mode                   |

### 🎤 Practice question

> _"What is the difference between an element and a tag in HTML?"_

---

## 2. JSON

### 🗣️ Spoken answer

> "JSON — JavaScript Object Notation — is a text format for representing structured data as key-value pairs. Despite the name, it's language-independent and used everywhere for APIs. In JavaScript you parse a JSON string into an object with `JSON.parse()` and convert an object back to a JSON string with `JSON.stringify()`. Key rules for valid JSON: keys must be double-quoted strings, no trailing commas, no `undefined` or functions as values — they're silently dropped by `stringify`. Angular's `HttpClient` automatically parses JSON responses — you don't call `JSON.parse` yourself."

```ts
// Parse string → object
const user = JSON.parse('{"id":1,"name":"Alice"}'); // { id: 1, name: 'Alice' }

// Serialize object → string
const json = JSON.stringify({ id: 1, name: 'Alice' }); // '{"id":1,"name":"Alice"}'

// Pretty-print for debugging
JSON.stringify(data, null, 2);
```

### 🎤 Practice question

> _"What is JSON and how do you use it in JavaScript?"_

---

## 3. HTTP Protocol Basics

### 🗣️ Spoken answer

> "HTTP — HyperText Transfer Protocol — is the request/response protocol browsers and servers use to communicate. A request has: a **verb** (GET, POST…), a **URL**, **headers** (metadata like `Content-Type`, `Authorization`), and an optional **body** for POST/PUT. A response has: a **status code**, headers, and a body. Status code families: 2xx success, 3xx redirect, 4xx client error (400 bad request, 401 unauthorised, 403 forbidden, 404 not found), 5xx server error. HTTPS is HTTP over TLS — the content is encrypted. HTTP/2 added multiplexing — multiple requests over one connection simultaneously."

### Key status codes

| Code | Meaning                                   |
| ---- | ----------------------------------------- |
| 200  | OK                                        |
| 201  | Created (after POST)                      |
| 204  | No Content (after DELETE)                 |
| 400  | Bad Request — your payload is malformed   |
| 401  | Unauthorised — token missing or invalid   |
| 403  | Forbidden — authenticated but not allowed |
| 404  | Not Found                                 |
| 409  | Conflict — e.g. duplicate                 |
| 422  | Unprocessable Entity — validation failed  |
| 500  | Internal Server Error — server crashed    |

### 🎤 Practice question

> _"What is HTTP? What does a 401 mean vs a 403?"_

---

## 4. REST, REST APIs & SOAP

### 🗣️ Spoken answer

> "REST — Representational State Transfer — is an architectural style for APIs that uses standard HTTP methods and URLs to represent resources. The rules: stateless (server doesn't remember the client between requests), resources identified by URLs, actions expressed via HTTP verbs. A **REST API** follows these conventions: `GET /users` lists users, `POST /users` creates one, `PUT /users/1` replaces one, `PATCH /users/1` partially updates, `DELETE /users/1` removes it. The response is typically JSON. SOAP is an older protocol that wraps operations in XML envelopes — it's verbose, strictly typed via WSDL schemas, and was common in enterprise Java/.NET systems. REST is simpler and has completely replaced SOAP in new web development."

### HTTP verb → CRUD map

| Verb   | Action         | Example                              |
| ------ | -------------- | ------------------------------------ |
| GET    | Read           | `GET /users` or `GET /users/1`       |
| POST   | Create         | `POST /users` with body              |
| PUT    | Full replace   | `PUT /users/1` with full body        |
| PATCH  | Partial update | `PATCH /users/1` with changed fields |
| DELETE | Remove         | `DELETE /users/1`                    |

### 🎤 Practice question

> _"What is a REST API? How is it different from SOAP?"_

---

## 5. Browser Basics — Simplified

### 🗣️ Spoken answer

> "Think of loading a website in three acts. **Act 1 — Find the server:** your browser translates the domain name into an IP address using DNS — like a phone book for the internet. **Act 2 — Connect:** browser knocks on the server's door (TCP handshake), and if HTTPS, they agree on encryption (TLS). **Act 3 — Get the app:** browser asks for `index.html`, server sends it. Browser reads the HTML, sees a `<script>` tag pointing to the Angular bundle, downloads it, runs it — Angular boots up and renders the UI. After that, page navigations don't reload from the server — Angular's router handles them in the browser (Single Page Application). HTTP calls to the API go back to the server but never reload the whole page."

### 🎤 Practice question

> _"In simple terms, how does the browser get an Angular app from the internet?"_

---

## 6. Flexbox

### 🗣️ Spoken answer

> "Flexbox is a one-dimensional CSS layout model — it arranges items along a single axis, either row or column. You enable it with `display: flex` on the container. The two axes: the **main axis** (direction of flex, set by `flex-direction`) and the **cross axis** (perpendicular). Key properties: `justify-content` aligns items on the main axis; `align-items` aligns on the cross axis; `flex-grow` lets an item expand to fill space; `gap` adds spacing between items. The mental model: the container controls alignment, the children control their own sizing with `flex`."

### Cheatsheet

```css
.container {
  display: flex;
  flex-direction: row; /* main axis: horizontal */
  justify-content: space-between; /* main axis alignment */
  align-items: center; /* cross axis alignment */
  flex-wrap: wrap; /* allow items to wrap */
  gap: 16px;
}

.item {
  flex: 1; /* grow: 1, shrink: 1, basis: 0 */
  flex-shrink: 0; /* never shrink */
  align-self: flex-start; /* override container's align-items */
}
```

### 🎤 Practice question

> _"How would you center an element both horizontally and vertically using flexbox?"_

---

## 7. CSS Specificity

### 🗣️ Spoken answer

> "Specificity is the algorithm browsers use to decide which CSS rule wins when multiple rules target the same element. It's calculated as a three-part score: ID selectors score the highest; class, attribute, and pseudo-class selectors score in the middle; element and pseudo-element selectors score the lowest. Inline styles beat all of them. `!important` overrides everything — avoid it. The rule with the higher score wins regardless of source order. If scores are tied, the rule that appears later in the stylesheet wins."

### Specificity score

| Selector                     | Score     |
| ---------------------------- | --------- |
| `*` (universal)              | 0-0-0     |
| `div`, `p` (element)         | 0-0-1     |
| `.class`, `[attr]`, `:hover` | 0-1-0     |
| `#id`                        | 1-0-0     |
| Inline `style=""`            | 1-0-0-0   |
| `!important`                 | Beats all |

### 🎤 Practice question

> _"If two CSS rules target the same element, how does the browser decide which one to apply?"_

---

## 8. Breakpoints & Responsive

### 🗣️ Spoken answer

> "Responsive design means the layout adapts to different screen sizes. The tool is CSS media queries — `@media (min-width: 768px)` — or in Tailwind, utility class prefixes like `md:flex`. The mobile-first approach: write base styles for small screens first, then use `min-width` queries to add complexity for larger screens. This is better than the opposite because mobile-first CSS is the default and you layer up rather than override down. Breakpoints are typically: mobile ~375px, tablet ~768px, desktop ~1024px, wide ~1280px."

### 🎤 Practice question

> _"What is mobile-first CSS and why is it preferred?"_

---

## 9. Object Manipulation & Methods

### 🗣️ Spoken answer

> "The most important array methods an interviewer will ask about: `map` — transforms each element, returns a new array; `filter` — keeps elements that pass a test; `reduce` — folds the array into a single value; `find` — returns the first match; `some` / `every` — boolean checks. For objects: `Object.keys()`, `Object.values()`, `Object.entries()` for iteration; spread `{ ...obj }` for shallow copy; destructuring for extraction. One rule: prefer **immutable** operations — never mutate the original array or object, return new ones from `map` and `filter`."

### Key patterns

```ts
// Immutable object update
const updated = { ...user, name: 'Alice' };

// Destructuring with rename
const { id: userId, name } = user;

// Array to object (reduce)
const byId = users.reduce((acc, u) => ({ ...acc, [u.id]: u }), {});

// Optional chaining + nullish coalescing
const city = user?.address?.city ?? 'Unknown';
```

### 🎤 Practice question

> _"How do you immutably update a property in an object in JavaScript?"_

---

## 10. Types & TypeScript Basics

### 🗣️ Spoken answer

> "TypeScript adds static types to JavaScript — the type system is erased at compile time, it doesn't exist at runtime. Key concepts: **type** vs **interface** — both describe the shape of an object; interfaces are extendable with `extends`, types support union and intersection with `|` and `&`; I use `type` for aliases and unions, `interface` for extendable object shapes. **Union types** `string | null` say a value can be one of several types. **Intersection types** `A & B` say a value must satisfy both. **Type guards** like `typeof`, `instanceof`, or a custom `is` function narrow the type at runtime."

### Utility types

```ts
Partial<User>; // all fields optional
Required<User>; // all fields required
Readonly<User>; // all fields readonly
Pick<User, 'id' | 'name'>; // subset of fields
Omit<User, 'password'>; // all except listed fields
Record<string, User>; // object with string keys and User values
NonNullable<T>; // removes null and undefined
```

### 🎤 Practice question

> _"What's the difference between `type` and `interface` in TypeScript?"_

---

## 11. The Event Loop

### 🗣️ Spoken answer

> "JavaScript is single-threaded — it can only do one thing at a time. The event loop is the mechanism that handles async operations without blocking. There are three queues: the **call stack** for synchronous code running right now; the **microtask queue** for resolved Promises and `queueMicrotask` — processed completely between each task; and the **macrotask queue** (or task queue) for setTimeout, setInterval, DOM events — one is processed per loop turn. Order: run the current call stack to empty → drain all microtasks → run one macrotask → repeat. This is why a resolved Promise callback runs before a setTimeout(0) callback."

```ts
console.log('1 — sync');

setTimeout(() => console.log('4 — macrotask'), 0);

Promise.resolve().then(() => console.log('2 — microtask'));

console.log('3 — sync');

// Output: 1, 3, 2, 4
```

### Key mental model

- Call stack: runs now
- Microtasks (Promises): run between every task — cannot be delayed
- Macrotasks (setTimeout, events): one at a time, after microtasks drain

### 🎤 Practice question

> _"What is the JavaScript event loop? What runs first — a resolved Promise or a setTimeout(0)?"_

---

## 12. Closures & Hoisting

### 🗣️ Spoken answer

> "A **closure** is a function that remembers the variables from its outer scope even after that outer function has returned — the inner function carries a 'backpack' of the surrounding environment. This is how callbacks and event handlers in JavaScript always have access to their surrounding data. **Hoisting** is JavaScript's behaviour of moving declarations to the top of their scope at parse time — `var` declarations and `function` declarations are hoisted. `let` and `const` are hoisted too but not initialised (the Temporal Dead Zone), so accessing them before their declaration throws a `ReferenceError`. In modern code you avoid hoisting issues by always using `const` and `let`."

### Closure example

```ts
function makeCounter() {
  let count = 0;
  return () => {
    count++;
    return count;
  }; // closes over count
}
const counter = makeCounter();
counter(); // 1
counter(); // 2 — count persists in the closure
```

### 🎤 Practice question

> _"What is a closure? Give me a practical example."_

---

## 13. Temporal Dead Zone (TDZ)

### 🗣️ Spoken answer

> "The Temporal Dead Zone is the period between when `let` or `const` is hoisted (the JS engine knows it exists) and when the declaration is actually executed (when it gets its value). Accessing the variable during this window throws a `ReferenceError` — not `undefined` like with `var`. This is intentional: it forces you to declare before you use. `var` doesn't have a TDZ — it's hoisted and initialised to `undefined` immediately, which is why you can read a `var` variable before the line that declares it and get `undefined` instead of an error. Always use `const` and `let` — the TDZ is a feature, not a bug."

```ts
console.log(a); // undefined — var is hoisted + initialised
var a = 1;

console.log(b); // ReferenceError — TDZ
let b = 2;

// In a function — same rules
function foo() {
  return x; // ReferenceError if x is let/const below
  let x = 5;
}
```

### 🎤 Practice question

> _"What is the Temporal Dead Zone? How is `let` different from `var` in terms of hoisting?"_

---

## 14. ES Modules vs CommonJS & ECMAScript

### 🗣️ Spoken answer

> "**ECMAScript** is the official standard specification for JavaScript — ES2015 (ES6), ES2022, etc. are versions of the spec that add new language features. A browser's JavaScript engine implements ECMAScript. **ES Modules** — `import`/`export` — is the modern, browser-native module system standardised in ES2015. `import { Component } from '@angular/core'` is an ES module import. **CommonJS** is Node.js's original module system — `require()` / `module.exports`. Angular and modern tooling use ES modules. The important difference: ES module imports are statically analysable at build time — that's what makes tree-shaking possible. CommonJS `require()` can be dynamic, so bundlers can't safely remove unused code."

```ts
// ES Module (Angular, browser)
import { signal } from '@angular/core';
export const myFn = () => {};

// CommonJS (Node.js legacy)
const express = require('express');
module.exports = { myFn };
```

### Practical point

- Your `tsconfig.json` `"module": "ES2022"` means TypeScript outputs ES modules
- `"moduleResolution": "bundler"` tells TypeScript that esbuild/Vite handles resolution

### 🎤 Practice question

> _"What is the difference between ES Modules and CommonJS? Why does it matter for bundling?"_

---

## 15. Pure Functions & Memoization

### 🗣️ Spoken answer

> "A **pure function**: given the same inputs always returns the same output, and has no side effects — doesn't mutate external state, doesn't make API calls, doesn't log. This makes it predictable, testable, and safe to run multiple times. **Memoization** is caching the result of a pure function call so that repeated calls with the same arguments don't re-compute — they return the cached result. In Angular, `computed()` is a built-in memoized reactive computation: it re-evaluates only when its signal dependencies change. NgRx `createSelector` applies the same concept for store selectors."

```ts
// Manual memoization
function memoize<T>(fn: (arg: T) => unknown) {
  const cache = new Map<T, unknown>();
  return (arg: T) => {
    if (cache.has(arg)) return cache.get(arg);
    const result = fn(arg);
    cache.set(arg, result);
    return result;
  };
}

// Angular signal memoization
readonly total = computed(() => this.items().reduce((s, i) => s + i.price, 0));
```

### 🎤 Practice question

> _"What is a pure function and why does it matter for performance?"_

---

## 16. OOP Basics

### 🗣️ Spoken answer

> "Object-Oriented Programming organises code around objects — data + behaviour together. The four pillars: **Encapsulation** — hiding internal state, exposing only what's needed (private fields, public methods). **Inheritance** — a class extends another, reusing its properties and methods (`class AdminUser extends User`). **Polymorphism** — different classes implementing the same interface or method, used interchangeably. **Abstraction** — hiding complexity behind a simple interface. In Angular, services are classes; dependency injection is built on OOP; `@Injectable` classes are instantiated by the DI container. TypeScript adds `private`, `protected`, `public`, `abstract`, and `implements` which map directly to these concepts."

```ts
// Encapsulation + abstraction
abstract class BaseService {
  protected abstract readonly baseUrl: string;

  getAll<T>(): Observable<T[]> {
    return this.http.get<T[]>(this.baseUrl);
  }
}

// Inheritance
class UserService extends BaseService {
  protected override readonly baseUrl = '/api/users';
}

// Interface (polymorphism contract)
interface Serialisable {
  toJSON(): string;
}
```

### Four pillars fast recall

| Pillar        | One-liner                                 | Angular example                              |
| ------------- | ----------------------------------------- | -------------------------------------------- |
| Encapsulation | Hide internals, expose interface          | `private _count = signal(0)`                 |
| Inheritance   | `extends` reuses parent logic             | `UserService extends BaseApiService`         |
| Polymorphism  | Same interface, different implementations | `ErrorHandler` — you replace it via DI       |
| Abstraction   | Hide complexity behind simple API         | `HttpClient.get<T>()` hides TCP/HTTP details |

### 🎤 Practice question

> _"What are the four pillars of OOP? Give me an Angular example of encapsulation."_

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
