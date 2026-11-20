import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { SvgIconComponent } from 'angular-svg-icon';
import { ButtonComponent } from '../../shared/button/button.component';

@Component({
  selector: 'app-error-page',
  imports: [SvgIconComponent, ButtonComponent],
  templateUrl: './error-page.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ErrorPageComponent {
  router = inject(Router);
  // location = inject(Location);
  // navigation = inject(NgxNavigateBackService);

  // goBack() {
  //   this.location.back();
  // }

  goToHomePage() {
    this.router.navigate(['/']);
  }
}
