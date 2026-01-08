# 📁 Users API - Modular Structure

## 🎯 Overview

The users API has been refactored into a **clean, modular architecture** where each endpoint has its own file. This makes the code easier to understand, test, and maintain.

---

## 📂 File Structure

```
apps/api/src/
├── services/
│   └── user.service.ts          # Business logic & data management
├── utils/
│   └── process-table-request.util.ts  # Reusable filtering/sorting/pagination
└── routes/
    └── users/
        ├── index.ts             # Main router (combines all handlers)
        ├── get-users.ts         # GET /users
        ├── search-users.ts      # POST /users/search
        ├── create-user.ts       # POST /users
        ├── update-user.ts       # PUT /users/:id
        ├── delete-user.ts       # DELETE /users/:id
        └── reset-users.ts       # POST /users/reset
```

---

## 🔧 **Layer Responsibilities**

### **1. Service Layer** (`services/user.service.ts`)

**Purpose:** Business logic and data management

```typescript
class UserService {
  getAll(); // Get all users
  getById(id); // Get user by ID
  create(userData); // Create new user
  update(id, userData); // Update existing user
  delete(id); // Delete user
  reset(); // Reset to initial data
}
```

**Why?**

- ✅ Single source of truth for data operations
- ✅ Easy to swap in-memory data with a real database later
- ✅ Testable in isolation
- ✅ Reusable across different routes

---

### **2. Utility Layer** (`utils/process-table-request.util.ts`)

**Purpose:** Generic helpers for common tasks

```typescript
processTableRequest<T>(data, request);
```

**Features:**

- ✅ Type-safe filtering, sorting, pagination
- ✅ Works with ANY entity type (not just User)
- ✅ Reusable across all table endpoints
- ✅ Pure function (no side effects)

---

### **3. Route Handlers** (`routes/users/*.ts`)

**Purpose:** HTTP request/response handling

Each file exports **ONE handler function**:

| File              | Handler              | Method | Route           | Purpose                      |
| ----------------- | -------------------- | ------ | --------------- | ---------------------------- |
| `get-users.ts`    | `getUsersHandler`    | GET    | `/users`        | List users with query params |
| `search-users.ts` | `searchUsersHandler` | POST   | `/users/search` | Search with request body     |
| `create-user.ts`  | `createUserHandler`  | POST   | `/users`        | Create new user              |
| `update-user.ts`  | `updateUserHandler`  | PUT    | `/users/:id`    | Update existing user         |
| `delete-user.ts`  | `deleteUserHandler`  | DELETE | `/users/:id`    | Delete user                  |
| `reset-users.ts`  | `resetUsersHandler`  | POST   | `/users/reset`  | Reset demo data              |

**Why separate files?**

- ✅ **Single Responsibility** - Each file does ONE thing
- ✅ **Easy to find** - Clear naming convention
- ✅ **Easy to test** - Import and test individual handlers
- ✅ **Git friendly** - Smaller diffs, fewer merge conflicts
- ✅ **Scalable** - Add new endpoints without bloating existing files

---

### **4. Router** (`routes/users/index.ts`)

**Purpose:** Combine all handlers into a Hono router

```typescript
const usersRoute = new Hono();

usersRoute.get('/', getUsersHandler);
usersRoute.post('/search', searchUsersHandler);
usersRoute.post('/', createUserHandler);
usersRoute.put('/:id', updateUserHandler);
usersRoute.delete('/:id', deleteUserHandler);
usersRoute.post('/reset', resetUsersHandler);

export default usersRoute;
```

**Why?**

- ✅ Clean overview of all routes in one place
- ✅ Easy to see HTTP methods and paths
- ✅ Handlers are imported, not defined inline

---

## 🔄 Request Flow

```
Client Request
    ↓
Main App (index.ts)
    ↓
Rate Limiter (if POST/PUT/DELETE)
    ↓
Users Router (routes/users/index.ts)
    ↓
Handler (e.g., get-users.ts)
    ↓
Service (services/user.service.ts)
    ↓
Utils (if needed, e.g., processTableRequest)
    ↓
Response to Client
```

---

## 📖 Example: Adding a New Endpoint

Want to add `GET /users/:id` to get a single user?

### **Step 1:** Create handler file

```typescript
// routes/users/get-user-by-id.ts
import type { Context } from 'hono';
import { userService } from '../../services/user.service';

export function getUserByIdHandler(c: Context) {
  try {
    const id = c.req.param('id');
    const user = userService.getById(id);

    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    return c.json(user);
  } catch {
    return c.json({ error: 'Failed to get user' }, 500);
  }
}
```

### **Step 2:** Add to router

```typescript
// routes/users/index.ts
import { getUserByIdHandler } from './get-user-by-id';

usersRoute.get('/:id', getUserByIdHandler);
```

Done! ✅

---

## 🧪 Testing Strategy

### **Unit Tests**

```typescript
// Test service independently
import { userService } from './user.service';

test('should create user', () => {
  const user = userService.create({ name: 'Test', email: 'test@test.com' });
  expect(user).toHaveProperty('id');
});
```

### **Integration Tests**

```typescript
// Test handler with mocked service
import { getUsersHandler } from './get-users';

test('should return paginated users', async () => {
  const mockContext = createMockContext();
  const response = await getUsersHandler(mockContext);
  expect(response.status).toBe(200);
});
```

---

## 🎓 Benefits of This Architecture

| Before (Monolithic)                     | After (Modular)               |
| --------------------------------------- | ----------------------------- |
| ❌ 200+ line single file                | ✅ Files ~20-40 lines each    |
| ❌ Hard to find specific logic          | ✅ Clear file names           |
| ❌ Testing requires mocking entire file | ✅ Test individual pieces     |
| ❌ Merge conflicts on same file         | ✅ Work on separate files     |
| ❌ Mixed concerns                       | ✅ Separation of concerns     |
| ❌ Hard to onboard new devs             | ✅ Self-documenting structure |

---

## 🚀 Future Enhancements

This structure makes it easy to add:

1. **Database integration** - Just update `user.service.ts`
2. **Validation** - Add middleware in `routes/users/index.ts`
3. **Authentication** - Add auth middleware per route
4. **Caching** - Add caching layer in service
5. **Rate limiting per endpoint** - Easy to apply selectively
6. **API versioning** - Create `v2/` folder with same structure

---

## 📝 Summary

**File Responsibilities:**

- `index.ts` - Route registration
- `*-handler.ts` - HTTP layer (request/response)
- `user.service.ts` - Business logic
- `process-table-request.util.ts` - Reusable helpers

**Key Principles:**

- ✅ Single Responsibility
- ✅ Separation of Concerns
- ✅ DRY (Don't Repeat Yourself)
- ✅ Easy to Test
- ✅ Easy to Scale

---

Enjoy your clean, maintainable API! 🎉
