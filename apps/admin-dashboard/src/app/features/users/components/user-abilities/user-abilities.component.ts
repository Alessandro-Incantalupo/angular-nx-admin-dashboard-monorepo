import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { provideTranslocoScope, TranslocoDirective } from '@jsverse/transloco';

@Component({
  selector: 'app-user-abilities',
  imports: [TranslocoDirective],
  templateUrl: './user-abilities.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideTranslocoScope('general')],
})
export class UserAbilitiesComponent {
  readonly isAuthenticated = input<boolean>(false);
  readonly roleDescription = input<string>('You have no abilities assigned.');
  readonly whatIsMyRole = output<'admin' | 'user'>();
}
