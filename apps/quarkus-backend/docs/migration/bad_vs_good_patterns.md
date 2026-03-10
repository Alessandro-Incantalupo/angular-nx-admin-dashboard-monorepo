# ⚖️ Bad vs. Good Patterns: The "Why" Guide

This guide compares common "beginner" habits with the "professional" standards we are implementing in your Quarkus backend.

---

## 1. Database Management

### ❌ Bad: Manual SQL or `hibernate.hbm2ddl.auto=update`

- **Why it's bad**:
  - You forget what you changed 2 weeks ago.
  - Your teammate's local database is different from yours.
  - Production deployments are a nightmare (running SQL scripts by hand).
  - **Risky**: `update` can sometimes delete data if it misinterprets a rename.

### ✅ Good: Liquibase (Database Versioning)

- **Why it's good**:
  - Every change is a "Migration File" (Git tracked).
  - The database is rebuilt exactly the same way on every machine.
  - **Safe**: Changes are applied in a strict, ordered sequence. It's the "Git for your Data."

---

## 2. API Responses (Error Handling)

### ❌ Bad: Generic or Inconsistent Errors

- **Example**: returning `Response.serverError().entity("User not found").build()` manually.
- **Why it's bad**:
  - The frontend has to guess the format for every single endpoint.
  - No clear "Type" or "Code" for the frontend to translate.
  - Sometimes returns a full HTML error page which breaks your JS/AJAX logic.

### ✅ Good: RFC 7807 (Standardized Problem Details)

- **Why it's good**:
  - **Predictable**: Every error follows the same schema (`type`, `title`, `status`).
  - **Machine-Friendly**: Your Angular frontend can look for the `fieldErrors` list and automatically highlight the wrong input box.
  - **Human-Friendly**: Includes a `message` key that looks like `error.userexists`, which you can use for multi-language support.

---

## 3. Architecture Layering

### ❌ Bad: Entities in the Controller

- **Example**: `public List<User> getAll() { return User.listAll(); }`
- **Why it's bad**:
  - You expose your internal database structure (and secrets like passwords!) directly to the web.
  - If you change a column name, your API breaks immediately.
  - Difficult to test logic without a database connected.

### ✅ Good: Service + DTO + Mapper

- **Why it's good**:
  - **Security**: `UserDTO` only contains fields intended for the public.
  - **Flexibility**: You can rename a database field without changing the API (just update the Mapper).
  - **Service Layer**: Your "Business Rules" (like "New users get a 'PENDING' status") live in a clean Java class, not mixed with HTTP code.

---

## 4. Build Management

### ❌ Bad: Blind Coding & Waiting for the App to Start

- **Why it's bad**:
  - You waste 30 seconds starting the Quarkus dev mode just to find out you missed a semicolon.
  - You only find errors on pages you manually visit.

### ✅ Good: `./gradlew classes` (Incremental Compilation)

- **Why it's good**:
  - **Lightning Fast**: It only checks if the code _compiles_.
  - **Comprehensive**: It checks _every_ file in the project at once.
  - **Focused**: It doesn't run tests or start the server, so it's the perfect "Check Pulse" command after editing.
