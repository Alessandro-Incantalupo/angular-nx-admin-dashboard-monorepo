import { CanDeactivateFn } from '@angular/router';
import SignUpComponent from '../../features/auth/sign-up/sign-up.component';

export const UnsavedChangesGuard: CanDeactivateFn<
  SignUpComponent
> = component => {
  if (component.form.dirty) {
    return confirm('You have unsaved changes! Do you really want to leave?');
  }
  return true;
};
