import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { SubMenuItem } from '@core/models/menu.model';
import { MenuService } from '@layouts/main-layout/services/menu.service';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { toast } from 'ngx-sonner';
import { ChipModule } from 'primeng/chip';
import { NavbarMobileSubmenuComponent } from '../navbar-mobile-submenu/navbar-mobile-submenu.component';

@Component({
  selector: 'app-navbar-mobile-menu',
  templateUrl: './navbar-mobile-menu.component.html',
  imports: [
    AngularSvgIconModule,
    NgTemplateOutlet,
    NavbarMobileSubmenuComponent,
    ChipModule,
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarMobileMenuComponent {
  public menuService = inject(MenuService);
  router = inject(Router);

  public toggleMenu(item: SubMenuItem): void {
    if (item.disabled) {
      toast.info('Feature under development', {
        position: 'top-center',
      });
      return;
    }
    if (item.children && item.children.length > 0) {
      item.expanded = !item.expanded;
      return;
    }
    if (item.route) {
      this.router.navigate([item.route]);
    }
  }

  public closeMenu(item?: SubMenuItem): void {
    if (item?.disabled) {
      return;
    }
    this.menuService.showMobileMenu = false;
  }
}
