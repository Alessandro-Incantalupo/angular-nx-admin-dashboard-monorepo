import type { InputFilters } from './tables/filters.model';
import { SortFilters } from './tables/sorting.model';

// BaseRequest is a generic type that represents a standard API request structure.
export type BaseRequest<T = unknown> = {
  data: T;
  location?: string;
};

// TableRequest for paginated, filtered, sorted table data requests
export type TableRequest<T> = {
  filter?: {
    sort?: SortFilters<T>;
    input?: InputFilters<T>;
  };
  pagination: {
    currentPage: number;
    pageSize: number;
    totalItems?: number;
  };
};
