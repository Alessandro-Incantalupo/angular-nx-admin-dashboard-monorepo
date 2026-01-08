import type { Context } from 'hono';
import { userService } from '../../services/user.service';

/**
 * DELETE /users/:id
 * Delete a user by ID
 */
export function deleteUserHandler(c: Context) {
  try {
    const id = c.req.param('id');
    const deleted = userService.delete(id);

    if (!deleted) {
      return c.json({ error: 'User not found' }, 404);
    }

    return c.json({ deleted: true });
  } catch {
    return c.json({ error: 'Failed to delete user' }, 500);
  }
}
