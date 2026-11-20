import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { User } from '@models';

@Component({
  selector: 'app-user-table',
  imports: [],
  templateUrl: './user-table.component.html',
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserTableComponent {
  readonly users = input.required<User[]>();
  readonly readOnly = input<boolean>(false);
  readonly editAction = output<User>();
  readonly deleteAction = output<User>();
}
