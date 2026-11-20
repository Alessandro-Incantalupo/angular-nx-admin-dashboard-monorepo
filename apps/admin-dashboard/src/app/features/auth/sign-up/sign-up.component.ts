import {
  ChangeDetectionStrategy,
  Component,
  computed,
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
import { ButtonComponent } from '../../../shared/button/button.component';

@Component({
  selector: 'app-sign-up',
  imports: [SvgIconComponent, RouterLink, ButtonComponent, ReactiveFormsModule],
  templateUrl: './sign-up.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SignUpComponent {
  nnfb = inject(NonNullableFormBuilder);
  router = inject(Router);
  authStore = inject(AuthStore);

  isLoading = signal(false);

  // Reactive Form
  form = this.nnfb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]],
  });

  passwordsMatch = computed(
    () => this.form.value.password === this.form.value.confirmPassword
  );

  register() {
    if (this.form.invalid) return; // Stop if invalid form

    if (this.form.value.password !== this.form.value.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    this.isLoading.set(true);
    localStorage.setItem('token', 'fake-jwt-token'); // Simulate authentication
    setTimeout(() => {
      this.form.markAsPristine(); // ✅ Mark form as clean to prevent `canDeactivate`
      this.router.navigate(['/profile']);
    }, 1000);
  }

  // Helper function to check form field validity
  hasError(controlName: string, errorType: string): boolean | undefined {
    const control = this.form.get(controlName);
    return control?.hasError(errorType) && control.touched;
  }

  logout() {
    this.authStore.logout();
    this.router.navigate(['/auth/sign-up']); // Redirect to login after logout
  }
}
