// Importing the Routes type from Angular's Router module to define the structure of route configurations.
import { Routes } from '@angular/router';

// Importing the UsersStore, which is likely a state management store for handling user-related data.
import { UsersStore } from '@features/users/state/user.store';

// Importing provideTranslocoScope, which is used to provide a specific translation scope for the Transloco library.
// This ensures that translations for the 'users' scope are available in this feature module.
import { provideTranslocoScope } from '@jsverse/transloco';

// Exporting the routes array as the default export of this file.
// The `export default` syntax allows this array to be imported without curly braces in other files.
// This is useful when the file has a single primary purpose (defining routes in this case).
export default [
  {
    // The path for this route is an empty string, meaning it will match the base URL of this feature module.
    path: '',

    // The loadComponent function is used for lazy loading the UserListComponent.
    // This improves performance by loading the component only when the route is accessed.
    loadComponent: () => import('./pages/user-list/user-list.component'),

    // The providers array allows us to provide services specific to this route.
    // Here, we are providing the UsersStore for state management and the Transloco scope for translations.
    providers: [UsersStore, provideTranslocoScope('users')],
  },
  {
    // Route for Function 1 - sottopagina di users
    path: 'function1',
    loadComponent: () => import('./pages/function1/function1.component'),
  },
  // The `satisfies` keyword ensures that this array conforms to the Angular `Routes` type.
  // It validates the structure of the array while preserving the specific inferred types of the objects.
] satisfies Routes;

/**
 * Detailed Explanation:
 *
 * 1. `export default`:
 *    - This syntax is used to export the routes array as the default export of this file.
 *    - Advantages:
 *      - Simplifies imports: The routes can be imported without curly braces, making the code cleaner.
 *        Example: `import userRoutes from './users.routes';`
 *      - Indicates that this file has a single primary purpose (defining routes).
 *      - Useful for consistency in files where only one export is expected.
 *
 * 2. `satisfies Routes`:
 *    - The `satisfies` keyword ensures that the array conforms to the `Routes` type defined by Angular.
 *    - Advantages:
 *      - Type Validation: Ensures that the array matches the structure required by Angular's routing system.
 *        For example, it checks that each object has a `path` and a `loadComponent` or `component` property.
 *      - Preserves Specific Types: Unlike `export const routes: Routes`, it doesn't force the array to be strictly typed as `Routes`.
 *        This means you can add custom properties to the route objects without losing type safety.
 *        Example:
 *        ```typescript
 *        const routes = [
 *          {
 *            path: '',
 *            loadComponent: () => import('./pages/user-list/user-list.component'),
 *            customProperty: 'customValue', // Allowed with `satisfies`
 *          },
 *        ] satisfies Routes;
 *        ```
 *      - Cleaner Code: Avoids the need to explicitly extend the `Route` type if custom properties are required.
 *
 * 3. Why Combine `export default` and `satisfies`?
 *    - Combining these two features makes the code both clean and type-safe:
 *      - `export default` simplifies importing the routes in other files.
 *      - `satisfies Routes` ensures the routes are valid while allowing flexibility for custom properties.
 */
