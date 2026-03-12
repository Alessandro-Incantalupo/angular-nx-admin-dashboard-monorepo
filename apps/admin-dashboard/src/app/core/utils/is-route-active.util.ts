import { IsActiveMatchOptions, Router } from '@angular/router';

export const ACTIVE_MATCH: IsActiveMatchOptions = {
  paths: 'subset',
  queryParams: 'subset',
  fragment: 'ignored',
  matrixParams: 'ignored',
};

export function isRouteActive(
  router: Router,
  route: string | null | undefined
): boolean {
  if (!route) return false;
  return router.isActive(router.createUrlTree([route]), ACTIVE_MATCH);
}
