import { User } from '@admin-dashboard-nx-monorepo/models';
import { getNextResetMs } from '@app-info';
import { Hono } from 'hono';
import { users as usersData } from '../data/users';

const usersRoute = new Hono();

let users: User[] = [...usersData];
const initialUsers: User[] = JSON.parse(JSON.stringify(usersData));

usersRoute.get('/', c => {
  try {
    const page = parseInt(c.req.query('page') || '1', 10); // Default to page 1
    const size = parseInt(c.req.query('size') || '5', 10); // Default to 5 items per page

    if (page < 1 || size < 1) {
      return c.json({ error: 'Invalid pagination parameters' }, 400);
    }

    const totalUsers = users.length;
    const totalPages = Math.ceil(totalUsers / size);

    if (page > totalPages) {
      return c.json({ error: 'Page out of range' }, 404);
    }

    const offset = (page - 1) * size;
    const paginatedUsers = users.slice(offset, offset + size);

    return c.json({
      data: paginatedUsers,
      meta: {
        totalItems: totalUsers,
        totalPages,
        currentPage: page,
        pageSize: size,
      },
      message: null,
      code: null,
    });
  } catch (err) {
    return c.json(
      {
        data: null,
        message: 'Failed to fetch users',
        code: 500,
      },
      500
    );
  }
});

usersRoute.get('/stats', c => {
  try {
    const stats = users.reduce(
      (acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      },
      {} as { [key: string]: number }
    );

    return c.json(stats);
  } catch (err) {
    return c.json({ error: 'Failed to fetch user stats' }, 500);
  }
});

usersRoute.post('/', async c => {
  try {
    const body = await c.req.json();
    const newUser = { id: crypto.randomUUID(), ...body };
    users.unshift(newUser);
    return c.json(newUser, 201);
  } catch (err) {
    return c.json({ error: 'Failed to add user' }, 500);
  }
});

usersRoute.put('/:id', async c => {
  try {
    const id = c.req.param('id');
    const updatedUser = await c.req.json();
    const index = users.findIndex(u => u.id === id);
    if (index === -1) {
      return c.json({ error: 'User not found' }, 404);
    }
    users[index] = { ...users[index], ...updatedUser };
    return c.json(users[index]);
  } catch (err) {
    return c.json({ error: 'Failed to update user' }, 500);
  }
});

usersRoute.delete('/:id', c => {
  try {
    const id = c.req.param('id');
    const index = users.findIndex(u => u.id === id);
    if (index === -1) {
      return c.json({ error: 'User not found' }, 404);
    }
    users.splice(index, 1);
    return c.json({ deleted: true });
  } catch (err) {
    return c.json({ error: 'Failed to delete user' }, 500);
  }
});

usersRoute.post('/reset', c => {
  try {
    users = JSON.parse(JSON.stringify(initialUsers));
    return c.json({ reset: true, users });
  } catch (err) {
    return c.json({ error: 'Failed to reset users' }, 500);
  }
});
// Optional: auto-reset every hour
const intervalMs = 1000 * 60 * 60;

setTimeout(function scheduleReset() {
  users = JSON.parse(JSON.stringify(initialUsers));
  setTimeout(scheduleReset, intervalMs);
}, getNextResetMs());

export default usersRoute;
