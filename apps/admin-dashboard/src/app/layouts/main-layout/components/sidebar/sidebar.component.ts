import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { APP_INFO } from '@app-info';
import { provideTranslocoScope, TranslocoDirective } from '@jsverse/transloco';
import { SvgIconComponent } from 'angular-svg-icon';
import { MenuService } from '../../services/menu.service';
import { SidebarMenuComponent } from './sidebar-menu/sidebar-menu.component';

@Component({
  selector: 'app-sidebar',
  imports: [SvgIconComponent, SidebarMenuComponent, TranslocoDirective],
  templateUrl: './sidebar.component.html',
  styles: ``,
  providers: [provideTranslocoScope('general')],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  menuService = inject(MenuService);
  appJson = APP_INFO;

  public toggleSidebar() {
    this.menuService.toggleSidebar();
  }
}
