import type { Context } from 'hono';
import { userService } from '../../services/user.service';

/**
 * POST /users/reset
 * Reset users to initial demo data
 */
export function resetUsersHandler(c: Context) {
  try {
    const users = userService.reset();
    return c.json({ reset: true, users });
  } catch {
    return c.json({ error: 'Failed to reset users' }, 500);
  }
}
