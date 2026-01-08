// Sort direction: 0 = descending, 1 = ascending (MongoDB-style)
export type SortDirection = 0 | 1;

// Type-safe sorting filters - only allows keys from type T
export type SortFilters<T> = Partial<Record<keyof T, SortDirection>>;
