---
name: Angular Modern Guide
description: Best practices and modern syntax for Angular development within this Nx workspace.
---

# ✅ Modern Angular Quick Reference (No Comments)

## Preferred Syntax

- `@if()`
- `@for()`
- `@defer()`
- `inject(SomeService)`
- `provideX()` in `app.config.ts`
- `inject(Router)`
- `readonly mySignal = signal<Type>(initialValue)`
- `readonly myInput = input<Type>()`
- `readonly myOutput = output<Type>()`
- `readonly myTable = viewChild<Table>(Table)`
- Use SignalStore

## Replace `switch` with Map or Object Map

```ts
const statusMessages = {
  success: 'Operation successful',
  error: 'Something went wrong',
} as const;

const message = statusMessages[status] ?? 'Unknown status';
```

```ts
const statusMap = new Map([
  ['success', 'Operation successful'],
  ['error', 'Something went wrong'],
]);

const message = statusMap.get(status) ?? 'Unknown status';
```

## Prefer Object Destructuring

Instead of:

```ts
const obj = { a: 1, b: 2 };
delete obj.a;
```

Use:

```ts
const obj = { a: 1, b: 2 };
const { a, ...rest } = obj;
// rest = { b: 2 }
```

## Prefer `as const` over `enum`

```ts
const STATUS = {
  success: 'success',
  error: 'error',
} as const;

export type Status = (typeof STATUS)[keyof typeof STATUS];
```
