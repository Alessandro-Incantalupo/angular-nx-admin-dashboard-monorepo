# 🟤 Tier 7 — Interview Prep (02/04/26)

> Ad-hoc tier for today's interview. All code examples in TypeScript/Angular. Concepts are language-agnostic — Java parallels noted where relevant.
> ← Back to [main index](interview_coach_2026.md)

---

## ⏱️ STUDY PLAN — a few hours

| Block | Time   | What                                                                                                                      |
| ----- | ------ | ------------------------------------------------------------------------------------------------------------------------- |
| 1     | 20 min | [JWT](#1-jwt--authentication--authorization) + [SOLID](#2-solid-principles)                                               |
| 2     | 20 min | [Design Patterns](#3-design-patterns-singleton--prototype) + [Big O](#4-computational-complexity-big-o-expanded)          |
| 3     | 30 min | [Live coding: Palindrome + Ristorante](#5-live-coding-palindrome)                                                         |
| 4     | 20 min | [Array exercises](#7-live-coding-array-exercises) + [DB: Relational vs NoSQL](#11-relational-vs-non-relational-databases) |
| 5     | 20 min | [Junior/Senior TS questions](#12-juniorsenior-questions-in-typescriptangular) + [Agile/Scrum one-liners](#9-agile--scrum) |

---

## 📋 Contents

1. [JWT — Authentication & Authorization](#1-jwt--authentication--authorization)
2. [SOLID Principles](#2-solid-principles)
3. [Design Patterns: Singleton & Prototype](#3-design-patterns-singleton--prototype)
4. [Computational Complexity / Big O (expanded)](#4-computational-complexity-big-o-expanded)
5. [Live Coding: Palindrome](#5-live-coding-palindrome)
6. [Live Coding: Ristorante (OOP)](#6-live-coding-ristorante-oop)
7. [Live Coding: Array Exercises](#7-live-coding-array-exercises)
8. [Kafka & ORM Quick Ref](#8-kafka--orm-quick-ref)
9. [Agile & Scrum](#9-agile--scrum)
10. [Overlaps with Angular prep](#10-overlaps-with-angular-prep)
11. [Relational vs Non-relational Databases](#11-relational-vs-non-relational-databases)
12. [Junior/Senior Questions in TypeScript/Angular](#12-juniorsenior-questions-in-typescriptangular)

---

## 1. JWT — Authentication & Authorization

### 🗣️ Spoken answer

> "JWT — JSON Web Token — is a compact, self-contained token for transmitting identity. It has three parts separated by dots: **Header** (algorithm), **Payload** (claims — who you are, your role, expiry), **Signature** (cryptographic proof it wasn't tampered with). The server signs the token on login using a secret key. On every subsequent request, the client sends the token in the `Authorization: Bearer <token>` header. The server verifies the signature — it doesn't need a database lookup, the token proves itself. That's what makes JWT stateless."

### Authentication vs Authorization

> "**Authentication** = who are you? You log in with credentials, server validates them, issues a JWT. Every subsequent call presents the JWT to prove identity.
> **Authorization** = what are you allowed to do? The JWT payload contains a `role` claim — `admin`, `user`, `guest`. The server (or a guard/interceptor) reads the role and decides what you can access."

```
Header.Payload.Signature

Payload example:
{
  "sub": "user123",      ← subject (user ID)
  "role": "admin",       ← authorization claim
  "exp": 1712345678      ← expiry timestamp
}
```

### Key points to say

- JWT is **stateless** — server doesn't store sessions
- Signature uses HMAC-SHA256 or RSA — tampering the payload invalidates the signature
- Token is **not encrypted by default** — don't put secrets in the payload (it's base64, readable by anyone)
- **Expiry** (`exp`) is critical — short-lived + refresh token pattern
- In your Angular project: `authInterceptor` attaches `Authorization: Bearer <token>` to every request; `AuthStore` holds the current user's role and drives component visibility

### 🎤 Practice question

> _"How does JWT work? What's the difference between authentication and authorization?"_

---

## 2. SOLID Principles

### 🗣️ One-liner per principle (say these cold)

| Letter | Principle             | One-liner                                                                                               |
| ------ | --------------------- | ------------------------------------------------------------------------------------------------------- |
| **S**  | Single Responsibility | A class does one thing. If it changes for two different reasons, split it.                              |
| **O**  | Open/Closed           | Open for extension, closed for modification. Add behavior by extending, not editing existing code.      |
| **L**  | Liskov Substitution   | A subclass must be usable wherever the parent class is expected, without breaking the program.          |
| **I**  | Interface Segregation | Don't force a class to implement methods it doesn't need. Small focused interfaces > one fat interface. |
| **D**  | Dependency Inversion  | Depend on abstractions, not concrete implementations. Inject dependencies, don't hardcode them.         |

### Concrete examples they'll want

**S — Single Responsibility:**

```
Bad:  class UserService { login(), saveUser(), sendEmail() }
Good: UserService handles users; EmailService handles email
```

**O — Open/Closed:**

```
Bad:  if (type == "pdf") ... else if (type == "csv") ...  ← edit every time
Good: interface Exporter { export() }  ← add new type = new class, no edits
```

**D — Dependency Inversion (= what DI in Angular/Spring does):**

```
Bad:  class OrderService { db = new MySQLDatabase() }
Good: class OrderService { constructor(Database db) }  ← inject it
```

### 🎤 Practice question

> _"Explain the SOLID principles. Give me an example of one."_

---

## 3. Design Patterns: Singleton & Prototype

### Singleton

> "Ensures only **one instance** of a class exists in the entire application. Useful for shared resources: database connections, config, logging, caches."

```ts
// TypeScript — module-level variable (JS modules are singletons by nature)
class DatabaseConnection {
  private static instance: DatabaseConnection;
  private constructor() {}

  static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }
}
```

**In Angular:** `providedIn: 'root'` services are singletons — Angular's DI creates one instance and shares it app-wide. This is the pattern you use every day.

```ts
// Angular singleton service
@Injectable({ providedIn: 'root' })
export class AuthService { ... }  // one instance, everywhere
```

### Prototype

> "Creates a **new object by cloning** an existing one instead of constructing from scratch. Used when object creation is expensive and you want a copy with some changes."

```ts
// TypeScript — clone with spread or structuredClone
const original: User = { id: 1, name: 'Alice', role: 'user' };

// Shallow clone (spread)
const copy = { ...original, role: 'admin' };

// Deep clone — what you use in the SignalStore
const deepCopy = structuredClone(original);
```

**In your codebase:** `structuredClone(user)` in the SignalStore when entering edit mode is exactly the Prototype pattern — clone the current state so Cancel can restore it.

```ts
// user.store.ts — Prototype pattern in action
const startEditing = (user: User) => {
  updateState(state, 'User: Start Editing', {
    clonedUsers: { ...state.clonedUsers(), [user.id]: structuredClone(user) },
  });
};
```

### Singleton vs Prototype at a glance

| Pattern   | When                          | Angular equivalent                                   |
| --------- | ----------------------------- | ---------------------------------------------------- |
| Singleton | Shared resource, one instance | `providedIn: 'root'` service                         |
| Prototype | You need independent copies   | `structuredClone()`, component-level `providers: []` |

### 🎤 Practice question

> _"What's the difference between Singleton and Prototype patterns? Where would you use each?"_

---

## 4. Computational Complexity / Big O (expanded)

### 🗣️ Spoken answer

> "Big O describes how an algorithm scales as input grows — worst case. The key ones: O(1) is constant — HashMap lookup, array access by index. O(log n) is logarithmic — binary search, balanced tree. O(n) is linear — one loop. O(n log n) is most sorting algorithms — merge sort, quicksort average case. O(n²) is nested loops — bubble sort, checking all pairs. The rule: given a choice, always prefer the lower complexity. In live coding, the interviewer wants O(n) where possible — if you write a nested loop, flag it and explain why."

### The table they want to see

| Notation   | Name         | Example                     |
| ---------- | ------------ | --------------------------- |
| O(1)       | Constant     | HashMap.get(), array[i]     |
| O(log n)   | Logarithmic  | Binary search, BST lookup   |
| O(n)       | Linear       | Single loop, linear search  |
| O(n log n) | Linearithmic | Merge sort, Arrays.sort()   |
| O(n²)      | Quadratic    | Nested loops, bubble sort   |
| O(2ⁿ)      | Exponential  | Recursive fibonacci (naive) |

### Finance angle (from their slides)

- **Array** access → O(1), search → O(n)
- **Hash Table** lookup → O(1) average — that's why ticker → price caches use them
- **Balanced BST / Red-Black Tree** → O(log n) — Order Book (bid/ask sorted by price)
- **Heap** → O(1) peek min/max, O(log n) insert — priority queue for order execution

### The "always optimize" rule for live coding

```
1 loop → O(n)        ✅ target
2 nested loops → O(n²)  ⚠️ explain and optimize if asked
HashMap to avoid 2nd loop → bring O(n²) down to O(n)  ✅ gold standard move
```

### 🎤 Practice question

> _"What is O(n²) and how would you reduce it to O(n)?"_

---

## 5. Live Coding: Palindrome

### What it is

A palindrome reads the same forwards and backwards: `"racecar"`, `"level"`, `"madam"`.

### Solution — O(n), two-pointer (O(1) space)

```ts
function isPalindrome(s: string): boolean {
  let left = 0,
    right = s.length - 1;
  while (left < right) {
    if (s[left] !== s[right]) return false;
    left++;
    right--;
  }
  return true;
}
// isPalindrome('racecar') → true
// isPalindrome('hello')   → false
```

### Alternative — reverse and compare (simpler, O(n) space)

```ts
function isPalindrome(s: string): boolean {
  return s === s.split('').reverse().join('');
}
```

### What to say out loud

> "I'll use two pointers starting from both ends, moving inward. If any pair doesn't match, it's not a palindrome. This is O(n) time and O(1) space. The reverse-and-compare approach is simpler code but uses O(n) extra space — I'll mention the tradeoff."

---

## 6. Live Coding: Ristorante (OOP)

### What it likely is

Model a restaurant system with classes. Typically: `Restaurant`, `Table`, `Order`, `MenuItem`. Tests OOP concepts: encapsulation, relationships between classes.

### Minimal working model

```ts
class MenuItem {
  constructor(
    public name: string,
    public price: number
  ) {}
}

class Order {
  private items: MenuItem[] = [];

  addItem(item: MenuItem): void {
    this.items.push(item);
  }

  getTotal(): number {
    return this.items.reduce((sum, item) => sum + item.price, 0);
  }
}

class Table {
  private currentOrder: Order | null = null;

  constructor(public number: number) {}

  startOrder(): void {
    this.currentOrder = new Order();
  }
  getOrder(): Order | null {
    return this.currentOrder;
  }
}

class Restaurant {
  private tables: Table[] = [];

  addTable(table: Table): void {
    this.tables.push(table);
  }

  getTable(number: number): Table | undefined {
    return this.tables.find(t => t.number === number);
  }

  getTablesWithOrders(): Table[] {
    return this.tables.filter(t => t.getOrder() !== null);
  }
}
```

### What to say out loud

> "I'll start with the data model — what are the entities and their relationships. MenuItem is a value object — just data. Order aggregates MenuItems. Table owns an Order. Restaurant owns Tables. Each class has one responsibility — that's the S in SOLID."

### Likely follow-up questions

- "Add a discount" → `applyDiscount(percent: number): void { this.discount = percent; }` on Order, adjust `getTotal()`
- "Show all tables with active orders" → `getTablesWithOrders()` already above — `filter(t => t.getOrder() !== null)`
- "What if two tables share an order?" → explain composition vs shared reference

---

## 7. Live Coding: Array Exercises

### Exercise 1 — Count occurrences (`"dog cat cat cow cow cow"`)

```ts
// O(n) — Map gives O(1) lookup per word
function countOccurrences(words: string[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const word of words) {
    map.set(word, (map.get(word) ?? 0) + 1);
  }
  return map;
}
// countOccurrences(['dog','cat','cat','cow','cow','cow'])
// → Map { dog→1, cat→2, cow→3 }
```

> "Map gives O(1) lookup per word so the whole thing is O(n) — one pass."

### Exercise 2 — Check if array is sorted

```ts
// O(n) — single pass
function isSorted(arr: number[]): boolean {
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] > arr[i + 1]) return false;
  }
  return true;
}
```

### Exercise 3 — Anagram check (use Map/HashMap)

```ts
// O(n) — Map for character frequency
function isAnagram(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  const map = new Map<string, number>();
  for (const c of a) map.set(c, (map.get(c) ?? 0) + 1);
  for (const c of b) {
    const count = (map.get(c) ?? 0) - 1;
    if (count < 0) return false;
    map.set(c, count);
  }
  return true;
}
// isAnagram('listen', 'silent') → true
```

### Exercise 4 — Words with no repeated letters (`"la casa è bella"`)

```ts
// O(n * k) where k = avg word length
function wordsWithUniqueLetters(sentence: string): string[] {
  return sentence.split(' ').filter(word => {
    const seen = new Set<string>();
    for (const c of word) {
      if (seen.has(c)) return false;
      seen.add(c);
    }
    return true;
  });
}
// 'la' → ✅  'casa' → ❌ (repeated 'a')  'bella' → ❌ (repeated 'l')
```

### Identity matrix check

```ts
// O(n²) — must visit every cell, unavoidable
function isIdentityMatrix(matrix: number[][]): boolean {
  const n = matrix.length;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const expected = i === j ? 1 : 0;
      if (matrix[i][j] !== expected) return false;
    }
  }
  return true;
}
```

---

## 8. Kafka & ORM Quick Ref

### Kafka (say this if asked)

> "Kafka is a distributed message streaming platform. Producers publish messages to **topics**. Consumers subscribe to topics and read messages. **Consumer Groups** are the key concept: multiple consumers in the same group share a topic's partitions — each partition is consumed by exactly one member at a time, allowing horizontal scaling. If a consumer in the group fails, Kafka rebalances the partitions to the others."

| Concept        | One-liner                                                        |
| -------------- | ---------------------------------------------------------------- |
| Topic          | Named stream of messages                                         |
| Producer       | Writes messages to a topic                                       |
| Consumer       | Reads messages from a topic                                      |
| Consumer Group | Group that shares partition load — each partition → one consumer |
| Partition      | Ordered log within a topic — enables parallelism                 |
| Offset         | Position of a message — consumers track their own offset         |

### ORM (Object-Relational Mapping)

> "ORM maps Java objects to database tables so you don't write raw SQL. A class becomes a table, fields become columns, objects become rows. JPA is Java's ORM standard; Hibernate is the most popular implementation. You annotate your class with `@Entity`, `@Table`, `@Column`, and Spring Data handles the rest. In your Quarkus backend, Panache is the ORM layer — simplified Hibernate."

```java
@Entity
@Table(name = "users")
public class User {
    @Id @GeneratedValue
    private Long id;

    @Column(nullable = false)
    private String email;
}
```

---

## 9. Agile & Scrum

### Agile (the philosophy)

> "Agile is an iterative approach to software development — deliver working software in short cycles, adapt based on feedback, prioritise collaboration over rigid plans. The opposite of waterfall where you spec everything upfront and deliver at the end."

### Scrum (the framework)

| Term                 | What it is                                                 |
| -------------------- | ---------------------------------------------------------- |
| Sprint               | Fixed time-box (1–4 weeks) to deliver working software     |
| Sprint Planning      | Team decides what to pull from the backlog into the sprint |
| Daily Standup        | 15-min sync: done yesterday / doing today / blockers       |
| Sprint Review        | Demo what was built to stakeholders                        |
| Sprint Retrospective | Team reflects on process, not product                      |
| Product Owner        | Owns the backlog, prioritises by business value            |
| Scrum Master         | Facilitates, removes blockers, protects the team           |
| Backlog              | Ordered list of everything the product needs               |
| Velocity             | How much work the team completes per sprint (story points) |

### 🎤 Practice question

> _"Explain Agile and Scrum. What's the difference?"_
> "Agile is the mindset — iterative, collaborative, adaptive. Scrum is a specific Agile framework with defined roles, events, and artifacts. Not all Agile teams use Scrum — Kanban is also Agile, for example."

---

## 10. Overlaps with Angular Prep

Things you already know that directly apply:

| Java/Backend concept            | Your Angular equivalent                                                        |
| ------------------------------- | ------------------------------------------------------------------------------ |
| JWT auth + Bearer token         | `authInterceptor` attaches `Authorization: Bearer` to every request            |
| JWT role claim → authorization  | `AuthStore` holds role, `canView`/`isAdmin` computed signals drive visibility  |
| Singleton pattern               | `providedIn: 'root'` services — Angular DI creates one instance                |
| Prototype pattern               | `structuredClone(user)` in SignalStore edit flow                               |
| Dependency Inversion (SOLID D)  | `inject(SomeService)` — you depend on the abstraction, not `new SomeService()` |
| HashMap O(1) lookup             | `Map<string, User>` for pagination cache in ex06                               |
| Single Responsibility (SOLID S) | One store per feature, one service per concern                                 |
| ORM / Panache                   | Your Quarkus backend already uses it                                           |
| Consumer Group (Kafka)          | Like multiple `subscribers` sharing work — one message processed once          |
| Big O nested loop → HashMap     | Same pattern in your array exercises and JS exercises                          |

---

## ⚡ Last-minute cheatsheet

**Live coding rules (from their doc):**

1. Always reason out loud — say the complexity before you code
2. Single loop where possible — O(n) is the target
3. HashMap is the magic weapon — brings O(n²) → O(n)
4. Eyes on the monitor — no looking away

**If you blank:** say _"Let me think through the data structure first"_ then name the inputs, outputs, and complexity you're aiming for. That buys time and shows process.

---

## 11. Relational vs Non-relational Databases

### 🗣️ Spoken answer

> "Relational databases store data in **tables with rows and columns**, with strictly defined schemas. Relationships between tables are expressed via foreign keys and joined with SQL. They guarantee **ACID** properties — Atomicity, Consistency, Isolation, Durability — which makes them the standard for financial and transactional data. Examples: PostgreSQL, Oracle, SQL Server — exactly what this project uses.
>
> Non-relational (NoSQL) databases trade strict schema and relations for flexibility and horizontal scale. Data is stored as documents, key-value pairs, graphs, or wide columns depending on the type. They scale out across many machines more easily and handle high write throughput better. The tradeoff: eventual consistency instead of ACID, no joins, schema is your problem not the database's."

### The comparison table

|                | Relational (SQL)                        | Non-relational (NoSQL)                   |
| -------------- | --------------------------------------- | ---------------------------------------- |
| Structure      | Tables, rows, columns                   | Documents, key-value, graph              |
| Schema         | Fixed, enforced                         | Flexible / schemaless                    |
| Relationships  | Foreign keys + JOINs                    | Embedded or application-level            |
| Consistency    | ACID guaranteed                         | Often eventual consistency               |
| Scaling        | Vertical (bigger machine)               | Horizontal (more machines)               |
| Query language | SQL (standard)                          | Varies per DB                            |
| Examples       | PostgreSQL, Oracle, MySQL               | MongoDB, Redis, Cassandra, DynamoDB      |
| Best for       | Transactions, financial data, reporting | High volume, flexible structure, caching |

### Types of NoSQL

| Type        | How data is stored        | Example   | Use case                         |
| ----------- | ------------------------- | --------- | -------------------------------- |
| Document    | JSON-like objects         | MongoDB   | User profiles, CMS               |
| Key-Value   | Plain key → value         | Redis     | Caching, sessions, rate limiting |
| Wide Column | Rows with dynamic columns | Cassandra | Time-series, IoT                 |
| Graph       | Nodes + edges             | Neo4j     | Social networks, fraud detection |

### ACID explained simply

> "ACID is the set of guarantees that make a database safe for transactions:"

- **Atomicity** — a transaction is all-or-nothing. If step 3 of 5 fails, everything rolls back.
- **Consistency** — data always moves from one valid state to another. Constraints are never violated.
- **Isolation** — concurrent transactions don't see each other's intermediate states.
- **Durability** — once committed, it survives crashes.

> "This is why financial systems use relational DBs — you can't have a bank transfer that debits one account but doesn't credit the other."

### In your project context

- **Quarkus backend** uses PostgreSQL → relational, ACID, Panache ORM
- **Redis** would be used alongside for caching API responses (key-value NoSQL)
- Your **pagination HashMap cache** in ex06 is the in-memory equivalent of a Redis cache

### 🎤 Practice question

> _"What's the difference between a relational and a non-relational database? When would you use each?"_

---

## 12. Junior/Senior Questions in TypeScript/Angular

> These are the Angular/TypeScript equivalents of the Java junior/senior question list. Answer these as naturally as the Java ones.

### Junior-level questions

**1. Differenza tra libreria e framework**

> "A library is code you call — you're in control. A framework calls you — it controls the flow and you fill in the blanks. Angular is a full framework: it controls bootstrapping, lifecycle, DI, routing. RxJS is a library — you call it when you need it."

**2. Cos'è il Garbage Collector in JavaScript**

> "JavaScript automatically frees memory that's no longer reachable. You don't `free()` things manually. The engine uses mark-and-sweep — it marks everything reachable from the root (window, global), then sweeps the rest. The common Angular mistake: subscriptions that keep a reference alive so the GC can't free the component — that's why `takeUntilDestroyed()` exists."

**3. Primitivi vs oggetti in TypeScript**

> "Primitives: `string`, `number`, `boolean`, `null`, `undefined`, `symbol`, `bigint` — stored by value, immutable. Objects (arrays, functions, class instances): stored by reference — a variable holds a pointer to the object, not the object itself. This is why `===` on two objects with the same content returns `false` — they're different references. OnPush change detection relies on reference equality — if you mutate an object instead of replacing it, Angular won't detect the change."

**4. Cos'è un'interfaccia**

> "An interface in TypeScript defines the shape of an object — the contract it must satisfy. It's purely compile-time, zero runtime cost. A class `implements` an interface. It's how you enforce that a service or model has the expected properties and methods. In Angular, interfaces define Models (`User`, `Product`) and service contracts."

**5. Iniezione delle dipendenze**

> "DI is a pattern where a class declares what it needs and something else provides it — you don't call `new SomeService()` yourself. In Angular, `inject(AuthService)` asks the DI container for the instance. The benefit: you can swap implementations in tests, and Angular manages lifecycle. It's the D in SOLID — Dependency Inversion."

**6. Cos'è l'incapsulamento**

> "Encapsulation means a class owns its state and controls access to it. In TypeScript: `private` fields can't be touched from outside. In Angular's SignalStore: the writable signal is private inside the store, exposed as read-only to consumers — components can read state but can't bypass the store's update logic."

**7. Overload e override**

> "Override: a subclass redefines a method from the parent — same name, same signature, different implementation. TypeScript uses `override` keyword. Overload: multiple signatures for the same function that accept different parameter types — TypeScript resolves at compile time which signature to use. In Angular you rarely write class inheritance, but you override lifecycle hooks like `ngOnInit` from a base class."

**8. Come si testa il codice**

> "Three levels. Unit tests: test a single function or class in isolation — Jest in this project, you mock dependencies. Integration tests: test how pieces work together — e.g. a component + its service. E2E tests: test the full app in a real browser — Playwright. The testing pyramid says: many unit tests, fewer integration, few E2E. Coverage is measured by Istanbul — `nx run admin-dashboard:test --coverage` generates an HTML report."

**9. Modificatore `readonly` / `const`**

> "`const` at the variable level — can't reassign the binding, but can mutate the object. `readonly` on a class property — can only be set in the constructor. `as const` on an object literal — makes every nested property readonly at the type level. For signals: you expose `signal.asReadonly()` so consumers can't call `.set()` on it."

**10. Come funziona il metodo Sort**

> "`Array.sort()` sorts in-place. By default it converts elements to strings and sorts lexicographically — `[10, 9, 2].sort()` gives `[10, 2, 9]` which is wrong for numbers. Always pass a comparator for numbers: `arr.sort((a, b) => a - b)`. Complexity: O(n log n) — V8 uses TimSort. Gotcha: it mutates the original array — use `[...arr].sort()` to keep the original."

```ts
// Wrong (default — lexicographic)
[10, 9, 2]
  .sort() // [10, 2, 9] ❌

  [
    // Correct (numeric comparator)
    (10, 9, 2)
  ].sort((a, b) => a - b); // [2, 9, 10] ✅

// Immutable sort (don't mutate original)
const sorted = [...original].sort((a, b) => a - b);
```

---

### Senior-level questions

**1. Cosa significa "senior" per te**

> Already in Tier 6 — Section 9. Own outcomes, not tasks. Make people around you faster.

**2. Come gestisci le risorse junior**

> Already in Tier 6 — Section 12. Guide them to the answer, don't give it. Set a time-box before asking for help.

**3. Change Detection — come funziona in Angular**

> "Default strategy checks every component on every async event. OnPush only checks when a signal changes, an input reference changes, or an async pipe emits. Zoneless (what this project uses) removes Zone.js entirely — only signal reads drive updates. No polling, no full-tree checks."

**4. Dependency Injection tree — scope avanzato**

> "Angular has a hierarchy of injectors: root → platform → component. `providedIn: 'root'` = one instance for the whole app. Adding a service to a component's `providers: []` creates a new isolated instance for that component subtree. This is the Prototype scope equivalent — and the bug we have in `profile.component.ts` with `AuthStore`."

**5. Come gestiresti un bug in produzione**

> "First: assess impact and stop the bleeding — revert or feature-flag if possible. Second: reproduce locally with the exact data. Third: Network tab + Redux DevTools to find the state at the moment of failure. Fourth: write a failing test before fixing, so it never regresses."

**6. RxJS memory leaks**

> "Any subscription to an Observable that never completes will keep firing after the component is destroyed, and the component can't be garbage collected. Fix: `takeUntilDestroyed()` which auto-unsubscribes on component destroy. HTTP observables complete after one emission so they're safe. Form `valueChanges` and Subjects — always clean up."

### 🎤 Practice question

> _"Walk me through how Angular's DI container decides which instance of a service to provide to a component."_

---
