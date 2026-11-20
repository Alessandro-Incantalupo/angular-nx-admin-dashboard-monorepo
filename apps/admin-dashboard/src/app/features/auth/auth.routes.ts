import { Routes } from '@angular/router';
import { PATHS } from '../../core/constants/routes';
import { UnsavedChangesGuard } from '../../core/guards';

/**
 * Auth Routes Configuration
 *
 * IMPORTANT ROUTING FIX:
 * - Previously had redirectTo and children in same route object (❌ WRONG)
 * - This caused 404 errors because child routes became unreachable
 * - Fixed by flattening routes at the same level (✅ CORRECT)
 *
 * Route Flow:
 * - /auth → redirects to /auth/sign-in
 * - /auth/sign-in → loads SignInComponent
 * - /auth/sign-up → loads SignUpComponent (with unsaved changes protection)
 * - /auth/sign-in-template-driven → loads alternative login form
 *
 * Key Learning: Never mix redirectTo with children in the same route object
 */
export default [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: PATHS.SIGN_IN, // Redirect to sign-in by default
  },
  {
    path: PATHS.SIGN_IN,
    loadComponent: () => import('./sign-in/sign-in.component'),
    // data: { returnUrl: window.location.pathname },
  },
  {
    path: PATHS.SIGN_UP,
    loadComponent: () => import('./sign-up/sign-up.component'),
    canDeactivate: [UnsavedChangesGuard], // Prevents form loss on navigation
  },
  {
    path: PATHS.SIGN_IN_TEMPLATE_DRIVEN,
    loadComponent: () =>
      import('./sign-in-template-driven/sign-in-template-driven.component'),
  },
] satisfies Routes;
