import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';
import { Router } from '@angular/router';
import { SubMenuItem } from '@core/models/menu.model';
import { MenuStore } from '@core/state/menu.store';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { toast } from 'ngx-sonner';
import { ChipModule } from 'primeng/chip';

@Component({
  selector: 'app-navbar-mobile-submenu',
  templateUrl: './navbar-mobile-submenu.component.html',
  imports: [NgTemplateOutlet, AngularSvgIconModule, ChipModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarMobileSubmenuComponent {
  router = inject(Router);
  readonly menuStore = inject(MenuStore);

  public submenu = input<SubMenuItem>();

  public toggleMenu(item: SubMenuItem): void {
    if (item.disabled) {
      toast.info('Feature under development', {
        position: 'top-center',
      });
      return;
    }
    if (item.children && item.children.length > 0) {
      this.menuStore.toggleSubMenu(item);
      return;
    }
    if (item.route) {
      this.router.navigate([item.route]);
    }
  }

  public closeMobileMenu(item?: SubMenuItem): void {
    if (item?.disabled) {
      return;
    }
    this.menuStore.setMobileMenu(false);
  }
}
