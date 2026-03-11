import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoDirective } from '@jsverse/transloco';
import { SimulationService } from '../../services/simulation.service';
import { TooltipModule } from 'primeng/tooltip';
import { ButtonComponent } from '../../../../shared/button/button.component';

@Component({
  selector: 'app-error-rfc7807',
  standalone: true,
  imports: [CommonModule, TranslocoDirective, TooltipModule, ButtonComponent],
  templateUrl: './rfc-7807.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Rfc7807Component {
  simulationService = inject(SimulationService);

  runValidationTest() {
    this.simulationService.testValidationError();
  }

  runBadRequestTest() {
    this.simulationService.testBadRequest();
  }

  runServerErrorTest() {
    this.simulationService.testServerError();
  }

  runEnvelopeTest() {
    this.simulationService.testEnvelopeUnwrapping();
  }
}
