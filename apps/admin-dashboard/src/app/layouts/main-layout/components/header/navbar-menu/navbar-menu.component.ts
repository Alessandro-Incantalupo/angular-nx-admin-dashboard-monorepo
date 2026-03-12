import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { MenuStore } from '@core/state/menu.store';
import { TranslocoDirective } from '@jsverse/transloco';
import { ChipModule } from 'primeng/chip';
import { NavbarSubmenuComponent } from './navbar-submenu/navbar-submenu.component';

@Component({
  selector: 'app-navbar-menu',
  imports: [NavbarSubmenuComponent, ChipModule, TranslocoDirective],
  templateUrl: './navbar-menu.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarMenuComponent {
  readonly menuStore = inject(MenuStore);
  readonly openIndex = signal<number | null>(null);

  open(i: number) {
    this.openIndex.set(i);
  }

  close() {
    this.openIndex.set(null);
  }
}
