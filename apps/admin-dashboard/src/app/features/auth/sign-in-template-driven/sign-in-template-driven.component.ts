import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../shared/button/button.component';

@Component({
  selector: 'app-sign-in-template-driven',
  imports: [FormsModule, ButtonComponent],
  templateUrl: './sign-in-template-driven.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SignInTemplateDrivenComponent {
  onSubmit() {
    // A demo of the template-driven form: nothing is sent.
  }
}
