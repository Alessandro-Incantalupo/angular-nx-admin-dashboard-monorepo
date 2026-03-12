import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MenuStore } from '@core/state/menu.store';
import { TranslocoDirective } from '@jsverse/transloco';
import { SvgIconComponent } from 'angular-svg-icon';
import { SubMenuItem } from '../../../../../../core/models/menu.model';

@Component({
  selector: 'app-sidebar-submenu',
  imports: [
    SvgIconComponent,
    RouterLinkActive,
    RouterLink,
    NgTemplateOutlet,
    TranslocoDirective,
  ],
  templateUrl: './sidebar-submenu.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarSubmenuComponent {
  readonly menuStore = inject(MenuStore);
  readonly submenu = input<SubMenuItem>();

  public toggleMenu(menu: SubMenuItem) {
    this.menuStore.toggleSubMenu(menu);
  }
}
