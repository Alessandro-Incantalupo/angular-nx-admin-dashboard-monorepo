import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLinkActive } from '@angular/router';
import { MenuStore } from '@core/state/menu.store';
import { SvgIconComponent } from 'angular-svg-icon';
import { toast } from 'ngx-sonner';
import { ChipModule } from 'primeng/chip';
import { SubMenuItem } from '../../../../../core/models/menu.model';
import { SidebarSubmenuComponent } from './sidebar-submenu/sidebar-submenu.component';
@Component({
  selector: 'app-sidebar-menu',
  imports: [
    SvgIconComponent,
    RouterLinkActive,
    NgTemplateOutlet,
    SidebarSubmenuComponent,
    ChipModule,
  ],
  templateUrl: './sidebar-menu.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarMenuComponent {
  readonly menuStore = inject(MenuStore);
  readonly router = inject(Router);

  toggleMenu(item: SubMenuItem) {
    if (item.disabled) {
      toast.info('Feature under development');
      return;
    }
    if (item.children && item.children.length > 0) {
      this.menuStore.toggleMenu(item);
      return;
    }
    if (item.route) {
      this.router.navigate([item.route]);
    }
  }
}
