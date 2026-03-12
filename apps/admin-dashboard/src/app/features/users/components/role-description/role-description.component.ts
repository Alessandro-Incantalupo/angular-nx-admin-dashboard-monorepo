import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-role-description',
  imports: [],
  templateUrl: './role-description.component.html',
  host: {
    role: 'alert',
    class:
      'bg-background text-primary mb-4 flex items-center rounded p-4 shadow-md',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoleDescriptionComponent {
  hasError = input<boolean>(false);
}
