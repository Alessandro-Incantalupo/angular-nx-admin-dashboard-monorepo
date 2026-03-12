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
  host: {
    class: 'border-primary bg-background mb-6 block rounded border-l-4 p-4',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideTranslocoScope('general')],
})
export class UserAbilitiesComponent {
  readonly isAuthenticated = input<boolean>(false);
  readonly roleDescription = input<string>('You have no abilities assigned.');
  readonly whatIsMyRole = output<'admin' | 'user'>();
}
