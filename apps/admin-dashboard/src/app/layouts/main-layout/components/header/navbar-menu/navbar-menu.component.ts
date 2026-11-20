import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { CustomMenuItem } from '@core/models/menu.model';
import { ChipModule } from 'primeng/chip';
import { MenuService } from '../../../services/menu.service';
import { NavbarSubmenuComponent } from './navbar-submenu/navbar-submenu.component';

@Component({
  selector: 'app-navbar-menu',
  imports: [NavbarSubmenuComponent, ChipModule],
  templateUrl: './navbar-menu.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarMenuComponent {
  menuService = inject(MenuService);
  readonly router = inject(Router);
  readonly openIndex = signal<number | null>(null);

  private showMenuClass = [
    'scale-100',
    'animate-fade-in-up',
    'opacity-100',
    'pointer-events-auto',
  ];
  private hideMenuClass = [
    'scale-95',
    'animate-fade-out-down',
    'opacity-0',
    'pointer-events-none',
  ];

  open(i: number) {
    this.openIndex.set(i);
  }
  close() {
    this.openIndex.set(null);
  }

  public toggleMenu(menu: CustomMenuItem): void {
    menu.selected = !menu.selected;
  }
}
