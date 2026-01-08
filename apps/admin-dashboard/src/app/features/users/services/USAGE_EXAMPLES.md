# 🎯 Table Request/Response Usage Examples

## Overview

This project supports **TWO approaches** for filtering, sorting, and pagination:

1. **GET with Query Parameters** - Simple, RESTful, bookmarkable
2. **POST with Request Body** - Complex filters, more flexible

---

## 🔹 APPROACH 1: GET with Query Parameters

### When to Use
- ✅ Simple filters (1-2 fields)
- ✅ Bookmarkable URLs needed
- ✅ RESTful API conventions
- ✅ Browser caching desired
- ❌ Complex nested filters
- ❌ Many filter criteria

### API Endpoint
```
GET /users?page=1&size=10&sortBy=name&sortOrder=asc&filterField=role&filterValue=admin
```

### Angular Service Usage

```typescript
// Simple pagination only
usersService.getUsers(1, 10).subscribe(response => {
  console.log(response.data); // User[]
  console.log(response.meta.totalItems);
});

// With sorting and filtering
usersService.getUsersWithFilters(
  1,      // page
  10,     // size
  'name', // sortBy
  'asc',  // sortOrder
  'role', // filterField
  'admin' // filterValue
).subscribe(response => {
  console.log(response.data);
  console.log(response.meta.appliedSort);    // { name: 1 }
  console.log(response.meta.appliedFilters); // { role: 'admin' }
});
```

### Example Response
```json
{
  "data": [
    { "id": "1", "name": "Alice", "role": "admin" },
    { "id": "2", "name": "Bob", "role": "admin" }
  ],
  "meta": {
    "totalItems": 42,
    "totalPages": 5,
    "currentPage": 1,
    "pageSize": 10,
    "appliedSort": { "name": 1 },
    "appliedFilters": { "role": "admin" }
  },
  "message": null,
  "code": null
}
```

---

## 🔹 APPROACH 2: POST with Request Body

### When to Use
- ✅ Complex filters (multiple fields)
- ✅ Advanced operators (contains, in, gt, lt)
- ✅ Multi-column sorting
- ✅ Large filter payloads
- ❌ Need bookmarkable URLs
- ❌ Need browser caching

### API Endpoint
```
POST /users/search
Content-Type: application/json
```

### Angular Service Usage

```typescript
import { TableRequest } from '@admin-dashboard-nx-monorepo/models';

// Complex filter + sort request
const request: TableRequest<User> = {
  filter: {
    sort: {
      name: 1,      // Sort by name ascending (1 = asc, 0 = desc)
      createdAt: 0  // Then by createdAt descending
    },
    input: {
      role: ['admin', 'moderator'],  // Array = OR condition
      status: 'active',              // String = contains
      department: 'engineering'
    }
  },
  pagination: {
    currentPage: 1,
    pageSize: 20
  }
};

usersService.searchUsers(request).subscribe(response => {
  console.log(response.data); // Filtered, sorted, paginated users
  console.log(response.meta.appliedSort);
  console.log(response.meta.appliedFilters);
});
```

### Example Request Body
```json
{
  "filter": {
    "sort": {
      "name": 1,
      "createdAt": 0
    },
    "input": {
      "role": ["admin", "moderator"],
      "status": "active"
    }
  },
  "pagination": {
    "currentPage": 1,
    "pageSize": 20
  }
}
```

### Example Response
```json
{
  "data": [
    { "id": "1", "name": "Alice", "role": "admin", "status": "active" },
    { "id": "5", "name": "Eve", "role": "moderator", "status": "active" }
  ],
  "meta": {
    "totalItems": 15,
    "totalPages": 1,
    "currentPage": 1,
    "pageSize": 20,
    "appliedSort": {
      "name": 1,
      "createdAt": 0
    },
    "appliedFilters": {
      "role": ["admin", "moderator"],
      "status": "active"
    }
  },
  "message": null,
  "code": null
}
```

---

## 📊 Comparison Table

| Feature | GET (Query Params) | POST (Request Body) |
|---------|-------------------|---------------------|
| **Simplicity** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Complex Filters** | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Bookmarkable** | ✅ Yes | ❌ No |
| **Browser Cache** | ✅ Yes | ❌ No |
| **RESTful** | ✅ Yes | ⚠️ Less so |
| **URL Length Limit** | ❌ ~2000 chars | ✅ Unlimited |
| **Multi-field Sort** | ⚠️ Messy | ✅ Clean |
| **Type Safety** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

---

## 🎓 Tutorial: When to Use Each

### Use GET for:
```typescript
// ✅ Simple list pages
usersService.getUsers(page, size);

// ✅ Single-field search
usersService.getUsersWithFilters(1, 10, 'name', 'asc', 'status', 'active');

// ✅ Shareable filtered views
// URL: /users?page=1&size=10&filterField=role&filterValue=admin
```

### Use POST for:
```typescript
// ✅ Advanced filter UI (multiple dropdowns, checkboxes)
const request: TableRequest<User> = {
  filter: {
    input: {
      role: selectedRoles,        // ['admin', 'user', 'moderator']
      department: selectedDepts,  // ['engineering', 'sales']
      status: 'active',
      minAge: 18
    },
    sort: { lastName: 1, firstName: 1 }
  },
  pagination: { currentPage: 1, pageSize: 50 }
};

usersService.searchUsers(request);

// ✅ Saved filter presets
// ✅ Complex business logic filters
```

---

## 🔧 Integration with NgRx SignalStore

### Update your store to support both approaches:

```typescript
// In user.store.ts
const loadUsersSimple = rxMethod<PaginatorState | void>(
  pipe(
    tap(() => setUsersLoading()),
    debounceTime(300),
    switchMap(({ page = 1, rows = 5 }: Partial<PaginatorState> = {}) => {
      return userService.getUsers(page, rows).pipe(
        tapResponse({
          next: response => {
            updateState(state, 'Users: Load Success', {
              users: response.data,
              currentPage: page,
              pageSize: rows,
              totalItems: response.meta.totalItems,
            });
            setUsersLoaded();
          },
          error: err => {
            const message = getHttpErrorMessage(err, 'Failed to load users');
            toast.error(message);
            setUsersError(message);
          },
        })
      );
    })
  )
);

const searchUsers = rxMethod<TableRequest<User>>(
  pipe(
    tap(() => setUsersLoading()),
    debounceTime(300),
    switchMap(request =>
      userService.searchUsers(request).pipe(
        tapResponse({
          next: response => {
            updateState(state, 'Users: Search Success', {
              users: response.data,
              currentPage: request.pagination.currentPage,
              pageSize: request.pagination.pageSize,
              totalItems: response.meta.totalItems,
            });
            setUsersLoaded();
          },
          error: err => {
            const message = getHttpErrorMessage(err, 'Failed to search users');
            toast.error(message);
            setUsersError(message);
          },
        })
      )
    )
  )
);
```

---

## 🚀 Next Steps

1. **Start with GET** - Use `getUsers()` for your current simple pagination
2. **Add POST later** - When you need complex filters, implement `searchUsers()`
3. **Keep both** - Different use cases, both valuable!
4. **Consider caching** - GET is easier to cache (HTTP caching, service worker)
5. **User experience** - GET = shareable links, POST = better for complex UIs

---

## 💡 Pro Tips

1. **Echo back filters** - `appliedSort` and `appliedFilters` help sync UI state
2. **Type safety** - `TableRequest<User>` ensures you only filter valid fields
3. **Reusable** - Same `processTableRequest` function works for any entity
4. **Debugging** - Response includes what was actually applied by the server
5. **Testing** - Both approaches are easy to mock and test

---

Happy filtering! 🎉
