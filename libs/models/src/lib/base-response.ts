import type { InputFilters } from './tables/filters.model';
import type { SortFilters } from './tables/sorting.model';

// BaseResponse is a generic type that represents a standard API response structure.
export type BaseResponse<T = unknown> = {
  data: T;
  message: string | null;
  code: number | null;
};

// PaginatedResponse extends BaseResponse to include pagination metadata.
// Generic type T represents the item type (not the array)
export type PaginatedResponse<T> = BaseResponse<T[]> & {
  meta: {
    // Pagination metadata
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;

    // Optional: Echo back applied filters/sorting for client state sync
    appliedSort?: SortFilters<T>;
    appliedFilters?: InputFilters<T>;
  };
};
