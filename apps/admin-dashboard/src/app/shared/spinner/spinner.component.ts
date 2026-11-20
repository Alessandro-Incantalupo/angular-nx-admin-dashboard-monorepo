import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SpinnerService } from '@core/services/spinner.service';

@Component({
  standalone: true,
  selector: 'app-spinner',
  templateUrl: './spinner.component.html',
  styles: `
    .loader {
      color: #1d4ed8;
      border: 4px solid #ccc;
      border-top: 4px solid #1d4ed8;
      border-radius: 50%;
      width: 48px;
      height: 48px;
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpinnerComponent {
  readonly spinner = inject(SpinnerService);
}
