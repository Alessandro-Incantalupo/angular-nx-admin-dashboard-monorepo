// Type-safe input filters - only allows keys from type T
// Supports single values, arrays (for OR conditions), or numbers
export type InputFilters<T> = Partial<
  Record<keyof T, string | string[] | number | boolean>
>;

// More advanced filter operators (optional - use if needed)
export type FilterOperator =
  | 'eq'
  | 'ne'
  | 'gt'
  | 'lt'
  | 'gte'
  | 'lte'
  | 'contains'
  | 'in';

export type AdvancedFilter<T> = {
  field: keyof T;
  operator: FilterOperator;
  value: unknown;
};
