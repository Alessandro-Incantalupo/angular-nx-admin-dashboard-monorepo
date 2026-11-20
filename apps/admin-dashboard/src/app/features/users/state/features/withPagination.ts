import { computed, Signal } from '@angular/core';
import { signalStoreFeature, withComputed, withState } from '@ngrx/signals';

/**
 * =============================================================================
 * CUSTOM SERVER-SIDE PAGINATION FEATURE FOR NGRX SIGNAL STORE
 * =============================================================================
 *
 * This feature implements server-side pagination management for SignalStore.
 * Unlike in-memory pagination where all data is loaded at once, this feature
 * is designed for scenarios where:
 *
 * 1. Data is fetched from the server in chunks (pages)
 * 2. Only the current page's data is stored in memory
 * 3. Total item count is provided by the server
 * 4. Page changes trigger new server requests
 *
 * ARCHITECTURE DECISION:
 * This is a "dumb" pagination feature - it only manages pagination STATE.
 * It does NOT handle data fetching. Your store methods (like loadUsers)
 * should handle the actual API calls and update both the data AND pagination
 * state using updateState().
 *
 * WHY THIS APPROACH?
 * - Separation of concerns: pagination logic vs data fetching logic
 * - Flexibility: works with any HTTP service or data source
 * - Testability: pagination logic can be tested independently
 * - Reusability: same feature works for users, products, orders, etc.
 */

/**
 * =============================================================================
 * TYPE DEFINITIONS
 * =============================================================================
 */

/**
 * Configuration options for initializing the pagination feature.
 *
 * @example
 * withPagination({ initialPage: 1, initialPageSize: 20 })
 */
export type PaginationConfig = {
  /**
   * The page to start on when the store initializes.
   * Default: 1 (first page)
   *
   * Note: Using 1-based indexing (page 1, 2, 3...) as it's more intuitive
   * for users and matches most UI libraries like PrimeNG.
   */
  initialPage?: number;

  /**
   * Number of items to display per page.
   * Default: 10
   *
   * Common values: 5, 10, 20, 25, 50, 100
   * Should match your backend's page size parameter.
   */
  initialPageSize?: number;
};

/**
 * The pagination state that will be added to your SignalStore.
 *
 * These are the "source of truth" values that get updated when:
 * - User navigates to a different page
 * - User changes page size
 * - Server responds with total item count
 *
 * IMPORTANT: When you fetch data from your API, you should update ALL THREE
 * of these values to keep the pagination in sync with the server state.
 */
export type PaginationState = {
  /**
   * The current page number (1-based index).
   *
   * WHEN TO UPDATE:
   * - User clicks on a page number
   * - User clicks next/previous buttons
   * - After successful API response (to confirm the page change)
   *
   * @example
   * updateState(state, 'Navigate to page', { currentPage: 3 })
   */
  currentPage: number;

  /**
   * Number of items per page.
   *
   * WHEN TO UPDATE:
   * - User changes the page size dropdown (e.g., from 10 to 25)
   * - When changing page size, typically reset currentPage to 1
   *
   * @example
   * updateState(state, 'Change page size', {
   *   pageSize: 25,
   *   currentPage: 1
   * })
   */
  pageSize: number;

  /**
   * Total number of items across all pages (from server).
   *
   * This is provided by your backend in the API response, usually in
   * a meta object like: { data: [...], meta: { totalItems: 150 } }
   *
   * CRITICAL: This must be updated with EVERY API response because:
   * - Items may be added/deleted between requests
   * - Filters may change the total count
   * - Ensures computed values (totalPages, hasNextPage) are accurate
   *
   * @example
   * updateState(state, 'Users loaded', {
   *   users: response.data,
   *   totalItems: response.meta.totalItems
   * })
   */
  totalItems: number;
};

/**
 * Computed signals derived from the pagination state.
 *
 * These are READ-ONLY reactive values that automatically recalculate
 * whenever the underlying state (currentPage, pageSize, totalItems) changes.
 *
 * WHY COMPUTED SIGNALS?
 * - Automatic updates: change currentPage, and hasNextPage updates instantly
 * - Performance: only recalculate when dependencies change
 * - No manual synchronization: impossible to have stale derived values
 * - Type-safe: TypeScript knows these are Signals
 */
export type PaginationComputed = {
  /**
   * Total number of pages based on totalItems and pageSize.
   *
   * FORMULA: Math.ceil(totalItems / pageSize)
   *
   * EXAMPLES:
   * - 100 items, 10 per page = 10 pages
   * - 95 items, 10 per page = 10 pages (last page has 5 items)
   * - 0 items = 0 pages
   *
   * USE CASES:
   * - Display "Page X of Y" in UI
   * - Disable/enable last page button
   * - Validate page navigation bounds
   *
   * @example
   * <span>Page {{ currentPage() }} of {{ totalPages() }}</span>
   */
  totalPages: Signal<number>;

  /**
   * Whether there's a next page available for navigation.
   *
   * LOGIC: currentPage < totalPages
   *
   * USE CASES:
   * - Disable "Next" button when false
   * - Show/hide "Load More" button
   * - Prevent unnecessary API calls to non-existent pages
   *
   * @example
   * <button [disabled]="!hasNextPage()">Next</button>
   */
  hasNextPage: Signal<boolean>;

  /**
   * Whether there's a previous page available for navigation.
   *
   * LOGIC: currentPage > 1
   *
   * USE CASES:
   * - Disable "Previous" button on first page
   * - Disable "First" button on first page
   *
   * @example
   * <button [disabled]="!hasPreviousPage()">Previous</button>
   */
  hasPreviousPage: Signal<boolean>;

  /**
   * The index of the first item on the current page (1-based).
   *
   * FORMULA: (currentPage - 1) * pageSize + 1
   *
   * EXAMPLES:
   * - Page 1, pageSize 10: startIndex = 1
   * - Page 2, pageSize 10: startIndex = 11
   * - Page 3, pageSize 25: startIndex = 51
   *
   * USE CASES:
   * - Display "Showing 1-10 of 100 items"
   * - Table row numbering in paginated tables
   *
   * @example
   * <span>Showing {{ startIndex() }}-{{ endIndex() }} of {{ totalItems() }}</span>
   */
  startIndex: Signal<number>;

  /**
   * The index of the last item on the current page (1-based).
   *
   * FORMULA: Math.min(currentPage * pageSize, totalItems)
   *
   * The Math.min ensures we don't exceed totalItems on the last page.
   *
   * EXAMPLES:
   * - Page 1, pageSize 10, total 100: endIndex = 10
   * - Page 10, pageSize 10, total 95: endIndex = 95 (not 100)
   *
   * USE CASES:
   * - Display "Showing 1-10 of 100 items"
   * - Calculate items remaining
   *
   * @example
   * <span>Showing {{ startIndex() }}-{{ endIndex() }} of {{ totalItems() }}</span>
   */
  endIndex: Signal<number>;
};

/**
 * =============================================================================
 * PAGINATION FEATURE FACTORY
 * =============================================================================
 */

/**
 * Creates a SignalStore feature that adds server-side pagination capabilities.
 *
 * This function uses the SignalStore composition pattern to add:
 * 1. Pagination state (currentPage, pageSize, totalItems)
 * 2. Computed pagination values (totalPages, hasNextPage, etc.)
 *
 * USAGE PATTERN:
 *
 * export const MyStore = signalStore(
 *   withState({ items: [] }),
 *   withPagination({ initialPage: 1, initialPageSize: 20 }),
 *   withMethods((store) => ({
 *     loadItems: rxMethod<void>(
 *       pipe(
 *         switchMap(() =>
 *           service.getItems(store.currentPage(), store.pageSize()).pipe(
 *             tapResponse({
 *               next: (response) => {
 *                 updateState(store, 'Items loaded', {
 *                   items: response.data,
 *                   currentPage: response.page,
 *                   pageSize: response.pageSize,
 *                   totalItems: response.meta.total
 *                 });
 *               }
 *             })
 *           )
 *         )
 *       )
 *     )
 *   }))
 * );
 *
 * @param config - Optional configuration for initial page and page size
 * @returns A SignalStore feature that can be composed with other features
 */
export function withPagination(config?: PaginationConfig) {
  // Extract config values with defaults
  // Using nullish coalescing (??) to allow 0 as a valid value if needed
  const initialPage = config?.initialPage ?? 1;
  const initialPageSize = config?.initialPageSize ?? 10;

  /**
   * signalStoreFeature is the composition primitive for SignalStore.
   * It allows us to create reusable, composable pieces of state and logic.
   *
   * Think of it as a "plugin" or "mixin" for your store.
   */
  return signalStoreFeature(
    /**
     * withState adds the raw pagination state to the store.
     * These become writable signals that can be updated via updateState().
     */
    withState<PaginationState>({
      currentPage: initialPage,
      pageSize: initialPageSize,
      totalItems: 0, // Start at 0; will be updated after first API response
    }),

    /**
     * withComputed adds derived/computed signals to the store.
     * These automatically recalculate when their dependencies change.
     *
     * IMPORTANT: The function receives the store's state as an argument,
     * giving us access to currentPage, pageSize, and totalItems signals.
     */
    withComputed(({ currentPage, pageSize, totalItems }) => ({
      /**
       * Calculate total number of pages.
       *
       * EDGE CASE HANDLING:
       * - If pageSize is 0, return 0 to avoid division by zero
       * - Math.ceil ensures partial pages count as a full page
       *   (e.g., 95 items / 10 per page = 9.5 → rounds up to 10 pages)
       */
      totalPages: computed(() => {
        const total = totalItems();
        const size = pageSize();
        return size > 0 ? Math.ceil(total / size) : 0;
      }),

      /**
       * Check if next page exists.
       *
       * REACTIVE BEHAVIOR:
       * - Automatically updates when currentPage changes
       * - Automatically updates when totalItems changes (e.g., after delete)
       * - Automatically updates when pageSize changes
       */
      hasNextPage: computed(() => {
        const current = currentPage();
        const total = totalItems();
        const size = pageSize();
        // Recalculate totalPages inline to avoid accessing another computed
        const totalPgs = size > 0 ? Math.ceil(total / size) : 0;
        return current < totalPgs;
      }),

      /**
       * Check if previous page exists.
       *
       * SIMPLE LOGIC: We're using 1-based indexing, so page 1 is the first.
       * If currentPage > 1, there must be a previous page.
       */
      hasPreviousPage: computed(() => currentPage() > 1),

      /**
       * Calculate the 1-based index of the first item on current page.
       *
       * MATH BREAKDOWN:
       * - (currentPage - 1) * pageSize gives us the number of items BEFORE this page
       * - Add 1 to convert from 0-based offset to 1-based index
       *
       * EXAMPLES:
       * - Page 1, size 10: (1-1)*10 + 1 = 1
       * - Page 2, size 10: (2-1)*10 + 1 = 11
       * - Page 5, size 20: (5-1)*20 + 1 = 81
       */
      startIndex: computed(() => {
        const current = currentPage();
        const size = pageSize();
        return (current - 1) * size + 1;
      }),

      /**
       * Calculate the 1-based index of the last item on current page.
       *
       * MATH BREAKDOWN:
       * - current * size gives us the theoretical end index
       * - Math.min ensures we don't exceed totalItems (important for last page)
       *
       * EXAMPLES:
       * - Page 1, size 10, total 100: min(1*10, 100) = 10 ✓
       * - Page 10, size 10, total 95: min(10*10, 95) = 95 ✓
       * - Page 1, size 10, total 7: min(1*10, 7) = 7 ✓ (partial page)
       *
       * EDGE CASE: If there are 0 items, this returns 0, which is correct
       * because startIndex would be 1 and endIndex would be 0, indicating
       * an empty range.
       */
      endIndex: computed(() => {
        const current = currentPage();
        const size = pageSize();
        const total = totalItems();
        const end = current * size;
        return Math.min(end, total);
      }),
    }))
  );
}

/**
 * =============================================================================
 * HELPER TYPE FOR TYPE-SAFE STATE UPDATES
 * =============================================================================
 */

/**
 * Type helper for partial pagination state updates.
 *
 * Use this with updateState() to ensure type safety when updating pagination.
 *
 * @example
 * const update: PaginationUpdate = { currentPage: 2 }; // ✓ Type-safe
 * updateState(store, 'Navigate', update);
 */
export type PaginationUpdate = Partial<PaginationState>;

/**
 * =============================================================================
 * PAGINATION UPDATE UTILITIES
 * =============================================================================
 *
 * These are pure functions that return state update objects.
 * They make your store methods more readable and reduce boilerplate.
 *
 * WHY UTILITY FUNCTIONS?
 * - Encapsulate common pagination logic
 * - Prevent bugs (e.g., forgetting to reset to page 1 when changing page size)
 * - Make code more readable: paginationUpdaters.nextPage(current) vs { currentPage: current + 1 }
 * - Easy to test independently
 * - Consistent behavior across your application
 *
 * USAGE PATTERN:
 *
 * const goToNextPage = () => {
 *   updateState(
 *     state,
 *     'Go to next page',
 *     paginationUpdaters.nextPage(state.currentPage())
 *   );
 *   loadUsers(); // Trigger API call
 * };
 */
export const paginationUpdaters = {
  /**
   * Navigate to a specific page.
   *
   * USE CASES:
   * - User clicks on a page number in pagination controls
   * - Programmatic navigation (e.g., after deleting items)
   *
   * VALIDATION NOTE: This function does NOT validate the page number.
   * Your API will typically handle invalid pages by returning an error
   * or empty results. If you need client-side validation, check against
   * totalPages() before calling this.
   *
   * @param page - The page number to navigate to (1-based)
   * @returns Partial state update object
   *
   * @example
   * // User clicks on page 3
   * updateState(store, 'Navigate', paginationUpdaters.setPage(3));
   * loadUsers(); // Fetch page 3 data
   */
  setPage: (page: number): PaginationUpdate => ({
    currentPage: page,
  }),

  /**
   * Change the page size (items per page).
   *
   * IMPORTANT: This ALWAYS resets to page 1.
   *
   * WHY RESET TO PAGE 1?
   * Imagine you're on page 5 with 10 items per page (showing items 41-50).
   * If you change to 50 items per page, page 5 would show items 201-250,
   * which might not exist. Resetting to page 1 ensures a valid state.
   *
   * USE CASES:
   * - User selects different page size from dropdown
   * - Responsive design: switch to smaller pages on mobile
   *
   * @param pageSize - New number of items per page
   * @returns Partial state update object with page reset
   *
   * @example
   * // User changes from 10 to 25 items per page
   * updateState(store, 'Change page size', paginationUpdaters.setPageSize(25));
   * loadUsers(); // Fetch page 1 with new page size
   */
  setPageSize: (pageSize: number): PaginationUpdate => ({
    pageSize,
    currentPage: 1, // CRITICAL: Always reset to first page
  }),

  /**
   * Update the total item count (typically from server response).
   *
   * WHEN TO USE:
   * This should be called with EVERY API response that returns paginated data.
   *
   * WHY EVERY TIME?
   * - Items may have been added/deleted by other users
   * - Filters may have changed the result set
   * - Ensures hasNextPage and totalPages are accurate
   *
   * @param totalItems - Total number of items across all pages
   * @returns Partial state update object
   *
   * @example
   * tapResponse({
   *   next: (response) => {
   *     updateState(store, 'Users loaded', {
   *       users: response.data,
   *       ...paginationUpdaters.setTotalItems(response.meta.total)
   *     });
   *   }
   * })
   */
  setTotalItems: (totalItems: number): PaginationUpdate => ({
    totalItems,
  }),

  /**
   * Navigate to the next page.
   *
   * SAFETY: This function does NOT check if a next page exists.
   * You should check hasNextPage() before calling this, or let your
   * API return an empty result set.
   *
   * @param currentPage - The current page number
   * @returns Partial state update object with incremented page
   *
   * @example
   * const goNext = () => {
   *   if (store.hasNextPage()) {
   *     updateState(
   *       store,
   *       'Next page',
   *       paginationUpdaters.nextPage(store.currentPage())
   *     );
   *     loadUsers();
   *   }
   * };
   */
  nextPage: (currentPage: number): PaginationUpdate => ({
    currentPage: currentPage + 1,
  }),

  /**
   * Navigate to the previous page.
   *
   * SAFETY: Uses Math.max to prevent going below page 1.
   * Even if called when currentPage is 1, it stays at 1.
   *
   * @param currentPage - The current page number
   * @returns Partial state update object with decremented page (minimum 1)
   *
   * @example
   * const goPrevious = () => {
   *   updateState(
   *     store,
   *     'Previous page',
   *     paginationUpdaters.previousPage(store.currentPage())
   *   );
   *   loadUsers();
   * };
   */
  previousPage: (currentPage: number): PaginationUpdate => ({
    currentPage: Math.max(1, currentPage - 1),
  }),

  /**
   * Navigate to the first page.
   *
   * USE CASES:
   * - "First" button in pagination controls
   * - Reset pagination after applying filters
   * - Reset after clearing search
   *
   * @returns Partial state update object set to page 1
   *
   * @example
   * const applyFilters = (filters: Filters) => {
   *   updateState(store, 'Apply filters', {
   *     filters,
   *     ...paginationUpdaters.firstPage()
   *   });
   *   loadUsers();
   * };
   */
  firstPage: (): PaginationUpdate => ({
    currentPage: 1,
  }),

  /**
   * Navigate to the last page.
   *
   * IMPORTANT: This requires knowing totalPages, which is a computed value.
   * You must pass it as an argument.
   *
   * USE CASES:
   * - "Last" button in pagination controls
   * - Navigate to newly added item on last page
   *
   * @param totalPages - The total number of pages (from store.totalPages())
   * @returns Partial state update object set to last page
   *
   * @example
   * const goToLast = () => {
   *   updateState(
   *     store,
   *     'Last page',
   *     paginationUpdaters.lastPage(store.totalPages())
   *   );
   *   loadUsers();
   * };
   */
  lastPage: (totalPages: number): PaginationUpdate => ({
    currentPage: totalPages,
  }),
};

/**
 * =============================================================================
 * INTEGRATION EXAMPLES
 * =============================================================================
 *
 * Example 1: Basic Store Setup
 * -----------------------------
 *
 * export const UsersStore = signalStore(
 *   withState({ users: [] }),
 *   withPagination({ initialPage: 1, initialPageSize: 10 }),
 *   withMethods((store, service = inject(UsersService)) => ({
 *     loadUsers: rxMethod<void>(
 *       pipe(
 *         switchMap(() =>
 *           service.getUsers(store.currentPage(), store.pageSize()).pipe(
 *             tapResponse({
 *               next: (response) => {
 *                 updateState(store, 'Users loaded', {
 *                   users: response.data,
 *                   totalItems: response.meta.total
 *                 });
 *               }
 *             })
 *           )
 *         )
 *       )
 *     ),
 *     nextPage: () => {
 *       if (store.hasNextPage()) {
 *         updateState(
 *           store,
 *           'Next page',
 *           paginationUpdaters.nextPage(store.currentPage())
 *         );
 *         store.loadUsers();
 *       }
 *     }
 *   }))
 * );
 *
 * Example 2: PrimeNG Paginator Integration
 * -----------------------------------------
 *
 * // In your component:
 * <p-paginator
 *   [rows]="store.pageSize()"
 *   [totalRecords]="store.totalItems()"
 *   [first]="(store.currentPage() - 1) * store.pageSize()"
 *   (onPageChange)="onPageChange($event)"
 * />
 *
 * // In component class:
 * onPageChange(event: PageEvent) {
 *   updateState(this.store, 'Paginate', {
 *     currentPage: event.page + 1, // PrimeNG uses 0-based
 *     pageSize: event.rows
 *   });
 *   this.store.loadUsers();
 * }
 *
 * Example 3: Display Pagination Info
 * -----------------------------------
 *
 * <div>
 *   Showing {{ store.startIndex() }} - {{ store.endIndex() }}
 *   of {{ store.totalItems() }} items
 * </div>
 *
 * Example 4: Navigation Buttons
 * ------------------------------
 *
 * <button
 *   [disabled]="!store.hasPreviousPage()"
 *   (click)="previousPage()"
 * >
 *   Previous
 * </button>
 *
 * <span>Page {{ store.currentPage() }} of {{ store.totalPages() }}</span>
 *
 * <button
 *   [disabled]="!store.hasNextPage()"
 *   (click)="nextPage()"
 * >
 *   Next
 * </button>
 */
