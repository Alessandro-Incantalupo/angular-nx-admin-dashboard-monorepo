import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MenuStore } from '@core/state/menu.store';
import { ThemeStore } from '@core/state/theme.store';
import { SvgIconComponent } from 'angular-svg-icon';
import { NavbarMenuComponent } from './navbar-menu/navbar-menu.component';
import { NavbarMobileComponent } from './navbar-mobile/navbar-mobilecomponent';
import { ProfileMenuComponent } from './profile-menu/profile-menu.component';

@Component({
  selector: 'app-header',
  imports: [
    SvgIconComponent,
    NavbarMenuComponent,
    ProfileMenuComponent,
    NavbarMobileComponent,
  ],
  templateUrl: './header.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  readonly menuStore = inject(MenuStore);
  readonly themeStore = inject(ThemeStore);
  public toggleMobileMenu(): void {
    this.menuStore.setMobileMenu(true);
  }
}
