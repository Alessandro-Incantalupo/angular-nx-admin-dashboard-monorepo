import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { User } from '@models';

@Component({
  selector: 'app-user-table',
  imports: [TranslocoDirective],
  templateUrl: './user-table.component.html',
  host: {
    class: 'block',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserTableComponent {
  readonly users = input.required<User[]>();
  readonly readOnly = input<boolean>(false);
  readonly editAction = output<User>();
  readonly deleteAction = output<User>();
}
