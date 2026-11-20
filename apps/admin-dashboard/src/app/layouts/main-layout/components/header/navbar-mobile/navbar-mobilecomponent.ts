import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { MenuService } from '../../../services/menu.service';
import { NavbarMobileMenuComponent } from './navbar-mobile-menu/navbar-mobile-menu.component';

@Component({
  selector: 'app-navbar-mobile',
  templateUrl: './navbar-mobile.component.html',
  imports: [AngularSvgIconModule, NavbarMobileMenuComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarMobileComponent {
  public menuService = inject(MenuService);

  public toggleMobileMenu(): void {
    this.menuService.showMobileMenu = false;
  }
}
