import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthStore } from '@core/state/auth.store';
import { ThemeStore } from '@core/state/theme.store';
import { BreadcrumbComponent } from '../../shared/breadcrumb/breadcrumb.component';
import { ButtonComponent } from '../../shared/button/button.component';
import { ProfileInfoComponent } from './profile-info/profile-info.component';
import { ThemeSelectorComponent } from './theme-selector/theme-selector.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styles: [],
  imports: [
    ButtonComponent,
    RouterLink,
    BreadcrumbComponent,
    ThemeSelectorComponent,
    ProfileInfoComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ProfileComponent {
  readonly router = inject(Router);
  readonly themeStore = inject(ThemeStore);
  readonly authStore = inject(AuthStore);

  // auto-bound from :id route param via withComponentInputBinding()
  readonly id = input.required<string>();

  readonly userData = computed(() => this.authStore.userData());

  readonly breadcrumbItems = computed(() => [
    {
      label: 'Profile',
      route: `/profile/${this.userData()?.name ?? this.id()}`,
    },
  ]);

  logout() {
    this.authStore.logout();
    this.router.navigate(['/']);
  }
}
