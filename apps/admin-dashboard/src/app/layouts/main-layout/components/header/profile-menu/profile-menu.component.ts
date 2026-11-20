import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { PATHS } from '@core/constants/routes';
import { AuthStore } from '@core/state/auth.store';
import { ThemeStore } from '@core/state/theme.store';
import { ClickOutsideRxjsDirective } from '@shared/directives/click-outside-rxjs.directive';
import { SvgIconComponent } from 'angular-svg-icon';
@Component({
  selector: 'app-profile-menu',
  imports: [SvgIconComponent, ClickOutsideRxjsDirective],
  templateUrl: './profile-menu.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileMenuComponent {
  themeStore = inject(ThemeStore);
  authStore = inject(AuthStore);
  router = inject(Router);

  public isOpen = signal(false);

  public profileMenu = [
    {
      title: 'Your Profile',
      icon: './assets/icons/heroicons/outline/user-circle.svg',
      link: PATHS.PROFILE,
    },
    // {
    //   title: 'Settings',
    //   icon: './assets/icons/heroicons/outline/cog-6-tooth.svg',
    //   link: PATHS.SETTINGS,
    //   disabled: true,
    // },
    // {
    //   title: 'Log out',
    //   icon: './assets/icons/heroicons/outline/logout.svg',
    //   link: PATHS.AUTH,
    // },
  ];

  public toggleMenu(): void {
    this.isOpen.set(!this.isOpen());
  }

  logout() {
    this.isOpen.set(false);
    this.authStore.logout();
  }

  // signIn() {
  //   this.router.navigate([PATHS.AUTH, PATHS.SIGN_IN]);
  // }

  toProfile(link: string) {
    const userData = this.authStore.userData(); // Get the user object
    if (!userData) return;
    this.router.navigate([PATHS.PROFILE, userData.id], {
      state: { userData: this.authStore.userData() },
    });
  }

  quickLogin(userType: 'admin' | 'user') {
    const demoCredentials = [
      { role: 'admin', email: 'admin@example.com', password: 'admin123' },
      { role: 'user', email: 'user@example.com', password: 'user123' },
    ];

    const credentials = demoCredentials.find(cred => cred.role === userType);

    if (credentials) {
      this.authStore.login({
        email: credentials.email,
        password: credentials.password,
      });
    }
  }
}
