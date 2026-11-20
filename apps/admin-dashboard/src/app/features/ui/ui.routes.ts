import { Routes } from '@angular/router';
import TableComponent from './table/table.component';

// Exporting the default array of routes for the MainLayoutComponent
// This array includes a route with an empty path that uses MainLayoutComponent
// and allows for potential child routes to be added under 'children'.
// Using `export default` ensures that `loadChildren` can dynamically import this module correctly.
export default [
  {
    path: '',
    component: TableComponent,
    children: [
      {
        path: 'table',
        component: TableComponent,
      },
    ],
  },
] satisfies Routes;
