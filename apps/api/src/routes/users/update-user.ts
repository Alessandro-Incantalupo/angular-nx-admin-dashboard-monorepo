import type { Context } from 'hono';
import { userService } from '../../services/user.service';

/**
 * PUT /users/:id
 * Update an existing user
 */
export async function updateUserHandler(c: Context) {
  try {
    const id = c.req.param('id');
    const userData = await c.req.json();

    const updatedUser = userService.update(id, userData);

    if (!updatedUser) {
      return c.json({ error: 'User not found' }, 404);
    }

    return c.json(updatedUser);
  } catch {
    return c.json({ error: 'Failed to update user' }, 500);
  }
}
