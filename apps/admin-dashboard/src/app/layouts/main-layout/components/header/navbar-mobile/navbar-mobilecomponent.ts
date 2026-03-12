import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MenuStore } from '@core/state/menu.store';
import { provideTranslocoScope, TranslocoDirective } from '@jsverse/transloco';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { NavbarMobileMenuComponent } from './navbar-mobile-menu/navbar-mobile-menu.component';

@Component({
  selector: 'app-navbar-mobile',
  templateUrl: './navbar-mobile.component.html',
  imports: [
    AngularSvgIconModule,
    NavbarMobileMenuComponent,
    TranslocoDirective,
  ],
  providers: [provideTranslocoScope('general')],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarMobileComponent {
  readonly menuStore = inject(MenuStore);

  public toggleMobileMenu(): void {
    this.menuStore.setMobileMenu(false);
  }
}
