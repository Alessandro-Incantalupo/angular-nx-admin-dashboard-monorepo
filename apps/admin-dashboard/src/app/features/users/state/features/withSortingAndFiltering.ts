import { computed, Signal } from '@angular/core';
import { signalStoreFeature, withComputed, withState } from '@ngrx/signals';

/**
 * =============================================================================
 * SORTING AND FILTERING FEATURE FOR NGRX SIGNAL STORE
 * =============================================================================
 *
 * This feature implements server-side sorting and filtering state management.
 * It works alongside withPagination() to provide complete table functionality.
 *
 * IMPORTANT: This is a "state-only" feature - it manages sorting/filtering STATE.
 * Your store methods must handle the actual API calls using these state values.
 */

/**
 * =============================================================================
 * TYPE DEFINITIONS
 * =============================================================================
 */

/**
 * Configuration for sorting a specific field.
 */
export type SortConfig = {
  /**
   * The field name to sort by (e.g., "name", "email", "createdAt")
   */
  field: string;

  /**
   * Sort direction
   * - 'asc': Ascending (A-Z, 0-9, oldest-newest)
   * - 'desc': Descending (Z-A, 9-0, newest-oldest)
   */
  order: 'asc' | 'desc';
};

/**
 * A single filter configuration.
 */
export type FilterConfig = {
  /**
   * The field name to filter (e.g., "role", "status", "name")
   */
  field: string;

  /**
   * The value to filter by (e.g., "admin", "active", "john")
   */
  value: string;

  /**
   * Optional: Filter match mode
   * - 'equals': Exact match (default)
   * - 'contains': Partial match (case-insensitive)
   * - 'startsWith': Prefix match
   */
  matchMode?: 'equals' | 'contains' | 'startsWith';
};

/**
 * Initial configuration for the sorting/filtering feature.
 */
export type SortingFilteringConfig = {
  /**
   * Optional initial sort configuration
   */
  initialSort?: SortConfig;

  /**
   * Optional initial filters
   */
  initialFilters?: FilterConfig[];
};

/**
 * The state added to your SignalStore.
 */
export type SortingFilteringState = {
  /**
   * Current sort configuration (null if no sorting applied)
   */
  sort: SortConfig | null;

  /**
   * Active filters as a key-value map
   * Key: field name, Value: filter value
   *
   * Example: { role: 'admin', status: 'active' }
   */
  filters: Record<string, string>;
};

/**
 * Computed signals for sorting/filtering state.
 */
export type SortingFilteringComputed = {
  /**
   * Whether any sort is currently applied
   */
  isSorted: Signal<boolean>;

  /**
   * Whether any filters are currently applied
   */
  isFiltered: Signal<boolean>;

  /**
   * Number of active filters
   */
  activeFilterCount: Signal<number>;

  /**
   * Whether table data has any modifications (sort or filter)
   */
  hasModifications: Signal<boolean>;
};

/**
 * =============================================================================
 * FEATURE FACTORY
 * =============================================================================
 */

export function withSortingAndFiltering(config?: SortingFilteringConfig) {
  const initialSort = config?.initialSort ?? null;
  const initialFilters = config?.initialFilters ?? [];

  // Convert initial filters array to record
  const filtersRecord = initialFilters.reduce(
    (acc, filter) => {
      acc[filter.field] = filter.value;
      return acc;
    },
    {} as Record<string, string>
  );

  return signalStoreFeature(
    withState<SortingFilteringState>({
      sort: initialSort,
      filters: filtersRecord,
    }),

    withComputed(({ sort, filters }) => ({
      /**
       * Check if any sorting is applied
       */
      isSorted: computed(() => sort() !== null),

      /**
       * Check if any filters are applied
       */
      isFiltered: computed(() => Object.keys(filters()).length > 0),

      /**
       * Count of active filters
       */
      activeFilterCount: computed(() => Object.keys(filters()).length),

      /**
       * Check if table has any modifications
       */
      hasModifications: computed(() => {
        return sort() !== null || Object.keys(filters()).length > 0;
      }),
    }))
  );
}

/**
 * =============================================================================
 * UTILITY FUNCTIONS
 * =============================================================================
 */

export const sortingFilteringUpdaters = {
  /**
   * Set or update the sort configuration.
   */
  setSort: (
    field: string,
    order: 'asc' | 'desc'
  ): Partial<SortingFilteringState> => ({
    sort: { field, order },
  }),

  /**
   * Clear the current sort.
   */
  clearSort: (): Partial<SortingFilteringState> => ({
    sort: null,
  }),

  /**
   * Toggle sort order for a field.
   * If not currently sorted by this field, sort ascending.
   * If currently ascending, switch to descending.
   * If currently descending, clear sort.
   */
  toggleSort: (
    currentSort: SortConfig | null,
    field: string
  ): Partial<SortingFilteringState> => {
    if (!currentSort || currentSort.field !== field) {
      return { sort: { field, order: 'asc' } };
    }

    if (currentSort.order === 'asc') {
      return { sort: { field, order: 'desc' } };
    }

    return { sort: null };
  },

  /**
   * Add or update a single filter.
   */
  setFilter: (
    currentFilters: Record<string, string>,
    field: string,
    value: string
  ): Partial<SortingFilteringState> => ({
    filters: {
      ...currentFilters,
      [field]: value,
    },
  }),

  /**
   * Remove a specific filter.
   */
  removeFilter: (
    currentFilters: Record<string, string>,
    field: string
  ): Partial<SortingFilteringState> => {
    const newFilters = { ...currentFilters };
    delete newFilters[field];
    return { filters: newFilters };
  },

  /**
   * Replace all filters at once.
   */
  setFilters: (
    filters: Record<string, string>
  ): Partial<SortingFilteringState> => ({
    filters,
  }),

  /**
   * Clear all filters.
   */
  clearFilters: (): Partial<SortingFilteringState> => ({
    filters: {},
  }),

  /**
   * Clear both sorting and filtering.
   */
  clearAll: (): Partial<SortingFilteringState> => ({
    sort: null,
    filters: {},
  }),
};

/**
 * =============================================================================
 * INTEGRATION EXAMPLE
 * =============================================================================
 *
 * export const UsersStore = signalStore(
 *   withState({ users: [] }),
 *   withPagination({ initialPage: 1, initialPageSize: 10 }),
 *   withSortingAndFiltering({
 *     initialSort: { field: 'name', order: 'asc' }
 *   }),
 *   withMethods((store, service = inject(UsersService)) => ({
 *     loadUsers: rxMethod<void>(
 *       pipe(
 *         switchMap(() => {
 *           const { currentPage, pageSize, sort, filters } = store;
 *           return service.getUsersWithFilters(
 *             currentPage(),
 *             pageSize(),
 *             sort()?.field,
 *             sort()?.order,
 *             filters()
 *           ).pipe(
 *             tapResponse({
 *               next: (response) => {
 *                 updateState(store, 'Users loaded', {
 *                   users: response.data,
 *                   totalItems: response.meta.totalItems
 *                 });
 *               }
 *             })
 *           );
 *         })
 *       )
 *     ),
 *     sortBy: (field: string) => {
 *       updateState(
 *         store,
 *         'Toggle sort',
 *         sortingFilteringUpdaters.toggleSort(store.sort(), field)
 *       );
 *       store.loadUsers();
 *     },
 *     filterBy: (field: string, value: string) => {
 *       updateState(
 *         store,
 *         'Apply filter',
 *         sortingFilteringUpdaters.setFilter(store.filters(), field, value)
 *       );
 *       // Reset to first page when filtering
 *       updateState(store, 'Reset page', { currentPage: 1 });
 *       store.loadUsers();
 *     }
 *   }))
 * );
 */
