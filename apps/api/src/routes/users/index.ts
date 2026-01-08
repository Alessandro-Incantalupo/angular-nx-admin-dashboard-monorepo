import { Hono } from 'hono';
import { createUserHandler } from './create-user';
import { deleteUserHandler } from './delete-user';
import { getUsersHandler } from './get-users';
import { resetUsersHandler } from './reset-users';
import { searchUsersHandler } from './search-users';
import { updateUserHandler } from './update-user';

/**
 * Users Router
 * Combines all user-related endpoints
 */
const usersRoute = new Hono();

// ========== READ OPERATIONS ==========
usersRoute.get('/', getUsersHandler);
usersRoute.post('/search', searchUsersHandler);

// ========== WRITE OPERATIONS ==========
usersRoute.post('/', createUserHandler);
usersRoute.put('/:id', updateUserHandler);
usersRoute.delete('/:id', deleteUserHandler);

// ========== UTILITY OPERATIONS ==========
usersRoute.post('/reset', resetUsersHandler);

export default usersRoute;
