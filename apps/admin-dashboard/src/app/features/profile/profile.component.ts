import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { AuthStore } from '@core/state/auth.store';
import { ThemeStore } from '@core/state/theme.store';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { LangSwitcherComponent } from '../../layouts/main-layout/components/header/lang-switcher/lang-switcher.component';
import { BreadcrumbComponent } from '../../shared/breadcrumb/breadcrumb.component';
import { ButtonComponent } from '../../shared/button/button.component';
import { ProfileInfoComponent } from './profile-info/profile-info.component';
import { ThemeSelectorComponent } from './theme-selector/theme-selector.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styles: [],
  host: { class: 'flex flex-col' },
  imports: [
    ButtonComponent,
    RouterLink,
    BreadcrumbComponent,
    ThemeSelectorComponent,
    ProfileInfoComponent,
    LangSwitcherComponent,
    TranslocoDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ProfileComponent {
  readonly router = inject(Router);
  readonly themeStore = inject(ThemeStore);
  readonly authStore = inject(AuthStore);
  private readonly transloco = inject(TranslocoService);

  // auto-bound from :id route param via withComponentInputBinding()
  readonly id = input.required<string>();

  readonly userData = computed(() => this.authStore.userData());

  private readonly activeLang = toSignal(this.transloco.langChanges$, {
    initialValue: this.transloco.getActiveLang(),
  });

  readonly breadcrumbItems = computed(() => {
    this.activeLang(); // track lang changes
    return [
      {
        label: this.transloco.translate('profile.breadcrumb'),
        route: `/profile/${this.userData()?.name ?? this.id()}`,
      },
    ];
  });

  logout() {
    this.authStore.logout();
    this.router.navigate(['/']);
  }
}
