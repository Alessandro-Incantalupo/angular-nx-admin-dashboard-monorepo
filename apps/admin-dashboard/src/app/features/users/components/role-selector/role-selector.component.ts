import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';

@Component({
  selector: 'app-role-selector',
  imports: [TranslocoDirective],
  templateUrl: './role-selector.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoleSelectorComponent {
  readonly isAuthenticated = input<boolean>(false);
  readonly isGuest = input<boolean>(true);
  readonly isUser = input<boolean>(false);
  readonly isAdmin = input<boolean>(false);
  readonly whatIsMyRole = output<'admin' | 'user' | 'guest'>();

  readonly roles: ['guest', 'user', 'admin'] = ['guest', 'user', 'admin'];
}
