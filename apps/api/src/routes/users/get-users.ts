import type {
  PaginatedResponse,
  TableRequest,
  User,
} from '@admin-dashboard-nx-monorepo/models';
import type { Context } from 'hono';
import { userService } from '../../services/user.service';
import { processTableRequest } from '../../utils/process-table-request.util';

/**
 * GET /users
 * Retrieve paginated users with optional sorting and filtering via query params
 */
export function getUsersHandler(c: Context) {
  try {
    const page = parseInt(c.req.query('page') || '1', 10);
    const size = parseInt(c.req.query('size') || '5', 10);
    const sortBy = c.req.query('sortBy'); // e.g., "name"
    const sortOrder = c.req.query('sortOrder'); // e.g., "asc" or "desc"
    const filterField = c.req.query('filterField'); // e.g., "role"
    const filterValue = c.req.query('filterValue'); // e.g., "admin"

    // Validation
    if (page < 1 || size < 1) {
      return c.json({ error: 'Invalid pagination parameters' }, 400);
    }

    // Build TableRequest from query params
    const tableRequest: Partial<TableRequest<User>> = {
      pagination: { currentPage: page, pageSize: size },
      filter: {},
    };

    // Add sorting if provided
    if (sortBy && sortOrder) {
      const direction = sortOrder === 'asc' ? 1 : 0;
      tableRequest.filter = {
        ...tableRequest.filter,
        sort: { [sortBy]: direction } as Record<string, 0 | 1>,
      };
    }

    // Add filtering if provided
    if (filterField && filterValue) {
      tableRequest.filter = {
        ...tableRequest.filter,
        input: { [filterField]: filterValue } as Record<string, string>,
      };
    }

    // Process request
    const allUsers = userService.getAll();
    const { items, total } = processTableRequest<User>(allUsers, tableRequest);
    const totalPages = Math.ceil(total / size);

    const response: PaginatedResponse<User> = {
      data: items as User[],
      meta: {
        totalItems: total,
        totalPages,
        currentPage: page,
        pageSize: size,
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
        message: 'Failed to fetch users',
        code: 500,
      },
      500
    );
  }
}
