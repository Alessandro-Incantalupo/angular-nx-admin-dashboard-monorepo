import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal,
} from '@angular/core';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthStore } from '@core/state/auth.store';
import { SvgIconComponent } from 'angular-svg-icon';
import { PATHS } from '../../../core/constants/routes';
import { AuthService } from '../../../core/services/auth.service';
import { ButtonComponent } from '../../../shared/button/button.component';

@Component({
  selector: 'app-sign-in',
  imports: [SvgIconComponent, RouterLink, ButtonComponent, ReactiveFormsModule],
  templateUrl: './sign-in.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SignInComponent {
  nnfb = inject(NonNullableFormBuilder);
  router = inject(Router);
  authService = inject(AuthService);
  protected authStore = inject(AuthStore);

  isLoading = signal(false);
  submitted = false;
  passwordTextType!: boolean;
  loginError = signal<string | null>(null); // Store login error
  protected PATHS = PATHS;

  form = this.nnfb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  readonly handleRedirect = effect(() => {
    const user = this.authStore.userData();

    if (user) {
      // Redirect to dashboard instead of profile
      this.router.navigate(['/']);
    }
  });

  onSubmit() {
    this.submitted = true;
    if (this.form.invalid) return;

    const { email, password } = this.form.value;
    this.authStore.login({ email, password });
  }

  // Helper function to check form field validity
  hasError(controlName: string, errorType: string): boolean | undefined {
    const control = this.form.get(controlName);
    return control?.hasError(errorType) && control.touched;
  }

  togglePasswordTextType() {
    this.passwordTextType = !this.passwordTextType;
  }
}
