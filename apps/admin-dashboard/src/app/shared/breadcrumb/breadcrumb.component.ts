import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-breadcrumb',
  imports: [RouterLink],
  templateUrl: './breadcrumb.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BreadcrumbComponent {
  router = inject(Router);
  //To make breadcrumb keep track of the state of the route, we need to inject ActivatedRoute
  route = inject(ActivatedRoute);
  items = input.required<
    {
      label: string;
      route?: string;
      routeState?: { [k: string]: unknown };
    }[]
  >();

  navigateTo(item: { route?: string; routeState?: { [k: string]: unknown } }) {
    if (item.route) {
      this.router.navigate([item.route], { state: item.routeState });
    }
  }
}
