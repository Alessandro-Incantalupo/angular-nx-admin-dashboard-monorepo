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
import { TranslocoDirective } from '@jsverse/transloco';
import { ClickOutsideRxjsDirective } from '@shared/directives/click-outside-rxjs.directive';
import { SvgIconComponent } from 'angular-svg-icon';
@Component({
  selector: 'app-profile-menu',
  imports: [SvgIconComponent, TranslocoDirective, ClickOutsideRxjsDirective],
  templateUrl: './profile-menu.component.html',
  host: {
    class: 'relative ml-3',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileMenuComponent {
  themeStore = inject(ThemeStore);
  authStore = inject(AuthStore);
  router = inject(Router);

  readonly isOpen = signal(false);

  public profileMenu = [
    {
      titleKey: 'profileMenu.yourProfile',
      icon: './assets/icons/heroicons/outline/user-circle.svg',
      link: PATHS.PROFILE,
    },
    // {
    //   titleKey: 'profileMenu.settings',
    //   icon: './assets/icons/heroicons/outline/cog-6-tooth.svg',
    //   link: PATHS.SETTINGS,
    //   disabled: true,
    // },
  ];

  public toggleMenu(): void {
    this.isOpen.set(!this.isOpen());
  }

  login() {
    this.authStore.login();
  }

  logout() {
    this.isOpen.set(false);
    this.authStore.logout();
  }

  // signIn() {
  //   this.router.navigate([PATHS.AUTH, PATHS.SIGN_IN]);
  // }

  toProfile(_link: string) {
    const userData = this.authStore.userData();
    if (!userData) return;
    this.isOpen.set(false);
    this.router.navigate([PATHS.PROFILE, userData.id]);
  }

  // Quick login removed because OIDC requires redirect to Keycloak
}
