import type {
  PaginatedResponse,
  TableRequest,
  User,
} from '@admin-dashboard-nx-monorepo/models';
import type { Context } from 'hono';
import { userService } from '../../services/user.service';
import { processTableRequest } from '../../utils/process-table-request.util';

/**
 * POST /users/search
 * Search users with complex filters, sorting, and pagination via request body
 */
export async function searchUsersHandler(c: Context) {
  try {
    const tableRequest: TableRequest<User> = await c.req.json();

    // Process request
    const allUsers = userService.getAll();
    const { items, total } = processTableRequest<User>(allUsers, tableRequest);
    const { currentPage = 1, pageSize = 5 } = tableRequest.pagination;
    const totalPages = Math.ceil(total / pageSize);

    const response: PaginatedResponse<User> = {
      data: items as User[],
      meta: {
        totalItems: total,
        totalPages,
        currentPage,
        pageSize,
        appliedSort: tableRequest.filter?.sort,
        appliedFilters: tableRequest.filter?.input,
      },
      message: null,
      code: null,
    };

    return c.json(response);
  } catch {
    return c.json(
      {
        data: null,
        message: 'Failed to search users',
        code: 500,
      },
      500
    );
  }
}
