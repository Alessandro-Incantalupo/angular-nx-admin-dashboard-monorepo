import type { TableRequest } from '@admin-dashboard-nx-monorepo/models';

/**
 * Generic helper function to apply filters, sorting, and pagination to any dataset
 * @param data - Array of items to process
 * @param request - Table request with optional filters, sorting, and pagination
 * @returns Processed items and total count
 */
export function processTableRequest<T>(
  data: T[],
  request: Partial<TableRequest<T>>
): { items: T[]; total: number } {
  let filtered = [...data];

  // Apply input filters
  const inputFilters = request.filter?.input;
  if (inputFilters) {
    filtered = filtered.filter(item => {
      return Object.entries(inputFilters).every(([key, value]) => {
        const itemValue = item[key as keyof T];

        // Handle array values (OR condition)
        if (Array.isArray(value)) {
          return value.some(v =>
            String(itemValue).toLowerCase().includes(String(v).toLowerCase())
          );
        }

        // Handle single value (contains)
        return String(itemValue)
          .toLowerCase()
          .includes(String(value).toLowerCase());
      });
    });
  }

  // Apply sorting
  const sortFilters = request.filter?.sort;
  if (sortFilters) {
    filtered.sort((a, b) => {
      for (const [key, direction] of Object.entries(sortFilters)) {
        const aVal = a[key as keyof T];
        const bVal = b[key as keyof T];

        if (aVal < bVal) return direction === 1 ? -1 : 1;
        if (aVal > bVal) return direction === 1 ? 1 : -1;
      }
      return 0;
    });
  }

  const total = filtered.length;

  // Apply pagination
  if (request.pagination) {
    const { currentPage = 1, pageSize = 5 } = request.pagination;
    const offset = (currentPage - 1) * pageSize;
    filtered = filtered.slice(offset, offset + pageSize);
  }

  return { items: filtered, total };
}
