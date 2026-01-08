import type { User } from '@admin-dashboard-nx-monorepo/models';
import type { Context } from 'hono';
import { userService } from '../../services/user.service';

/**
 * POST /users
 * Create a new user
 */
export async function createUserHandler(c: Context) {
  try {
    const body = await c.req.json();
    const newUser: User = userService.create(body);
    return c.json(newUser, 201);
  } catch {
    return c.json({ error: 'Failed to add user' }, 500);
  }
}
