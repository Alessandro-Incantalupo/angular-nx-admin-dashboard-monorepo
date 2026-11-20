import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SvgIconComponent } from 'angular-svg-icon';
import { SubMenuItem } from '../../../../../../core/models/menu.model';
import { MenuService } from '../../../../services/menu.service';

@Component({
  selector: 'app-sidebar-submenu',
  imports: [SvgIconComponent, RouterLinkActive, RouterLink, NgTemplateOutlet],
  templateUrl: './sidebar-submenu.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarSubmenuComponent {
  menuService = inject(MenuService);
  submenu = input<SubMenuItem>();

  public toggleMenu(menu: any) {
    this.menuService.toggleSubMenu(menu);
  }
}
