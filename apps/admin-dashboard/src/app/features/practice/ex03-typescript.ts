/**
 * ============================================================
 * EXERCISE 03 — TypeScript: Types, Interfaces, Utility Types
 * ============================================================
 *
 * Fill in every /* TODO  with the correct TypeScript.
 * Hover over types in VS Code to verify your answers —
 * TypeScript will show you the expanded type.
 */

// ─────────────────────────────────────────────────────────────
// SECTION A — interface vs type
// ─────────────────────────────────────────────────────────────

// Base model (already done — this is what your project uses)
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
  status: 'active' | 'inactive';
}

// TODO A1: Define a Role type using a union of the allowed role strings
export type Role = 'admin' | 'user' | 'guest';

// TODO A2: Extend User to create an AdminUser that also has 'permissions: string[]'
export interface AdminUser extends User {
  permissions: string[];
}

// TODO A3: Create a generic ApiResponse<T> type:
//   { data: T; statusCode: number; message: string }
export type ApiResponse<T> = {
  data: T;
  statusCode: number;
  message: string;
};

// Check: ApiResponse<User> should have data:User, statusCode:number, message:string
// Check: ApiResponse<User[]> should have data:User[]

// ─────────────────────────────────────────────────────────────
// SECTION B — Utility Types
// ─────────────────────────────────────────────────────────────

// TODO B1: CreateUserPayload — same as User but WITHOUT the 'id' field
//   (because the server generates the id)
//   Use Omit<>
export type CreateUserPayload = Omit<User, 'id'>;

// TODO B2: UpdateUserPayload — all fields of User are optional
//   (PATCH endpoint — only send changed fields)
//   Use Partial<>
export type UpdateUserPayload = Partial<User>;

// TODO B3: UserSummary — only keep 'id', 'name', and 'email' from User
//   Use Pick<>
export type UserSummary = Pick<User, 'id' | 'name' | 'email'>;

// TODO B4: UserStats — a dictionary where each key is a role string and value is a count number
//   Use Record<>
//   The result should be like: { admin: 3, user: 45, guest: 12 }
export type UserStats = Record<Role, number>;

// Let's verify our types by writing a few values (TypeScript will error if wrong):
const newUser: CreateUserPayload = {
  name: 'Alice',
  email: 'alice@test.com',
  role: 'user',
  status: 'active',
  // id: 'x',   ← uncomment this to see the TypeScript error!
};

const patch: UpdateUserPayload = {
  name: 'Alice Updated', // all other fields are optional — this is valid!
};

const summary: UserSummary = {
  id: '1',
  name: 'Alice',
  email: 'alice@test.com',
  // role: 'user', ← uncomment to see the error! Pick removes it.
};

const stats: UserStats = {
  admin: 3,
  user: 45,
  guest: 12,
};

// ─────────────────────────────────────────────────────────────
// SECTION C — TypeScript Map
// ─────────────────────────────────────────────────────────────

// TODO C1: Create a Map that stores users by their id
//   Key: string (the user id)
//   Value: User
export const userCache: /* TODO: Map type */ any = new Map<string, User>();

// TODO C2: Add a user to the map
//   User: { id: 'u1', name: 'Bob', email: 'bob@test.com', role: 'user', status: 'active' }
userCache.set('u1', {
  id: 'u1',
  name: 'Bob',
  email: 'bob@test.com',
  role: 'user',
  status: 'active',
});

// TODO C3: Retrieve the user with id 'u1' from the cache
const cachedUser = userCache.get('u1');

// TODO C4: Check if id 'u2' exists in the cache — assign true/false to hasU2
const hasU2 = userCache.has('u2');

// TODO C5: Convert all cached users to an array
const allCachedUsers: User[] = [...userCache.values()];

/*
 * ✅ ANSWERS — Section B:
 * B1: type CreateUserPayload = Omit<User, 'id'>;
 * B2: type UpdateUserPayload = Partial<User>;
 * B3: type UserSummary = Pick<User, 'id' | 'name' | 'email'>;
 * B4: type UserStats = Record<string, number>;
 *     (or more strict: Record<Role, number> if you want to enforce valid keys)
 *
 * ✅ ANSWERS — Section C:
 * C1: Map<string, User>
 * C2: userCache.set('u1', { id: 'u1', name: 'Bob', email: 'bob@test.com', role: 'user', status: 'active' })
 * C3: const cachedUser = userCache.get('u1')
 * C4: const hasU2 = userCache.has('u2')
 * C5: const allCachedUsers: User[] = [...userCache.values()]
 */

// ─────────────────────────────────────────────────────────────
// SECTION D — Type narrowing
// ─────────────────────────────────────────────────────────────

// TODO D1: Complete this type guard function
//   It should return true if the user is an AdminUser (has permissions array)
export function isAdmin(user: User | AdminUser): user is AdminUser {
  // TODO: check that 'permissions' exists on user
  return 'permissions' in user;
}

// TODO D2: Complete this function that formats a value
//   If it's a string → return it uppercase
//   If it's a number → return it with 2 decimal places (toFixed(2))
export function format(value: string | number): string {
  if (typeof value === 'string') {
    return value.toUpperCase();
  }
  return value.toFixed(2);
}

/*
 * ✅ ANSWERS — Section D:
 * D1: return 'permissions' in user;
 * D2:
 *   if (typeof value === 'string') {
 *     return value.toUpperCase();
 *   }
 *   return value.toFixed(2);
 */
