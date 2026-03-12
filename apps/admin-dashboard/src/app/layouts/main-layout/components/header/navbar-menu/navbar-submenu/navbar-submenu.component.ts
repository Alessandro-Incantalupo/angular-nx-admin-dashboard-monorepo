import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';
import { Router, RouterLinkActive } from '@angular/router';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { SvgIconComponent } from 'angular-svg-icon';
import { toast } from 'ngx-sonner';
import { ChipModule } from 'primeng/chip';
import { SubMenuItem } from '../../../../../../core/models/menu.model';

@Component({
  selector: 'app-navbar-submenu',
  imports: [
    NgTemplateOutlet,
    RouterLinkActive,
    SvgIconComponent,
    ChipModule,
    TranslocoDirective,
  ],
  templateUrl: './navbar-submenu.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarSubmenuComponent {
  submenu = input<SubMenuItem[]>();
  router = inject(Router);
  private readonly transloco = inject(TranslocoService);

  toggleMenu(item: SubMenuItem): void {
    if (item.disabled) {
      toast.info(this.transloco.translate('toast.featureUnderDevelopment'));
      return;
    }
    if (item.route) {
      this.router.navigate([item.route]);
    }
  }
}
