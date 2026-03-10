# 🚨 Standardized Error Handling (Level 3 Deep Dive)

In a professional API, you never want to return "Empty" errors or generic HTML pages when something goes wrong. We've upgraded your Quarkus backend to use **RFC 7807 (Problem Details)**.

## 🏛️ The Architecture

### 1. `BadRequestAlertException.java`

- **Purpose**: Your main tool for "Business Logic" errors.
- **Workflow**: Instead of checking an `if` and returning a `Response`, you simply `throw new BadRequestAlertException(...)`.
- **Structured Data**: It automatically adds the `entityName` and a `message` key that the frontend can use for translations.

### 2. `ConstraintViolationExceptionMapper.java`

- **Purpose**: The "Magic Mirror" for validation.
- **How it works**: When you use `@Valid` in your Resource and a user sends bad data (like an empty email), Jakarta Validation throws a `ConstraintViolationException`.
- **The Result**: Our mapper catches that hidden error and transforms it into a clean JSON list of `fieldErrors` so the user knows exactly which input to fix.

## 🛠️ The "Pro" Workflow

### How to use it in your Code:

```java
// Inside a Controller/Resource
if (userService.findByLogin(login).isPresent()) {
    throw new BadRequestAlertException("Login already in use", "user", "userexists");
}
```

### What the Frontend sees:

```json
{
  "type": "https://www.jhipster.tech/problem/problem-with-message",
  "title": "Login already in use",
  "status": 400,
  "detail": "Login already in use",
  "entityName": "user",
  "errorKey": "userexists",
  "message": "error.userexists",
  "params": "user"
}
```

## 🔍 Why this is Better?

- **Machine Readable**: Your Angular frontend can easily parse this JSON to show a "Toast" or a red error message under a specific field.
- **Secure**: It hides internal Java stack traces and only shows what you WANT the user to see.
- **Standardized**: It follows an official Internet Standard (RFC 7807) used by modern APIs worldwide.

## 🌐 Frontend Integration (Level 4)

We've bridged the gap with the Angular frontend:

- **`ErrorHandlerInterceptor`**: Automatically catches these RFC 7807 JSON responses.
- **Type Safety**: The [base-response.ts](file:///home/alessandro-incantalupo/Projects/angular/admin-dashboard-nx-monorepo/libs/models/src/lib/base-response.ts) includes the `ProblemDetails` interface, ensuring that accessing `fieldErrors` or `detail` is fully typed and safe.
