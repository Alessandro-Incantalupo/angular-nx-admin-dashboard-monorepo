import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { SubMenuItem } from '@core/models/menu.model';
import { MenuStore } from '@core/state/menu.store';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
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
    TranslocoDirective,
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarMobileMenuComponent {
  readonly menuStore = inject(MenuStore);
  readonly router = inject(Router);
  private readonly transloco = inject(TranslocoService);

  public toggleMenu(item: SubMenuItem): void {
    if (item.disabled) {
      toast.info(this.transloco.translate('toast.featureUnderDevelopment'), {
        position: 'top-center',
      });
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

  public closeMenu(item?: SubMenuItem): void {
    if (item?.disabled) {
      return;
    }
    this.menuStore.setMobileMenu(false);
  }
}
