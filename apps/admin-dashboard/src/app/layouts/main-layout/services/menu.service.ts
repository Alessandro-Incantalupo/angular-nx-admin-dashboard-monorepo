import { effect, inject, Injectable, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { pages } from '@core/constants/menu';
import { CustomMenuItem, SubMenuItem } from '@core/models/menu.model';
import { filter } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  private readonly router = inject(Router);
  private _showSidebar = signal(true);
  private _showMobileMenu = signal(false);
  private _pagesMenu = signal<CustomMenuItem[]>(pages);

  // The last finished navigation. toSignal subscribes once and unsubscribes
  // when the service is destroyed, so no Subscription or ngOnDestroy is needed.
  private readonly navigationEnd = toSignal(
    this.router.events.pipe(filter(event => event instanceof NavigationEnd))
  );

  constructor() {
    /** Expand the menu entry of the active route after each navigation */
    effect(() => {
      if (!this.navigationEnd()) return;
      this._pagesMenu().forEach(menu => {
        let activeGroup = false;
        menu.items.forEach(subMenu => {
          const active = this.isActive(subMenu.route);
          subMenu.expanded = active;
          subMenu.active = active;
          if (active) activeGroup = true;
          if (subMenu.children) {
            this.expand(subMenu.children);
          }
        });
        menu.active = activeGroup;
      });
    });
  }

  get showSideBar() {
    return this._showSidebar();
  }
  get showMobileMenu() {
    return this._showMobileMenu();
  }
  get pagesMenu() {
    return this._pagesMenu();
  }

  set showSideBar(value: boolean) {
    this._showSidebar.set(value);
  }
  set showMobileMenu(value: boolean) {
    this._showMobileMenu.set(value);
  }

  public toggleSidebar() {
    this._showSidebar.set(!this._showSidebar());
  }

  public toggleMenu(menu: any) {
    this.showSideBar = true;
    menu.expanded = !menu.expanded;
  }

  public toggleSubMenu(submenu: SubMenuItem) {
    submenu.expanded = !submenu.expanded;
  }

  private expand(items: Array<any>) {
    items.forEach(item => {
      item.expanded = this.isActive(item.route);
      if (item.children) this.expand(item.children);
    });
  }

  public isActive(instruction: any): boolean {
    return this.router.isActive(this.router.createUrlTree([instruction]), {
      paths: 'subset',
      queryParams: 'subset',
      fragment: 'ignored',
      matrixParams: 'ignored',
    });
  }
}
