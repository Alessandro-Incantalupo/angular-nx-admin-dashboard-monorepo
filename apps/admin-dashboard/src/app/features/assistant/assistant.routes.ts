import { Routes } from '@angular/router';
import { environment } from '@environments/environment';
import { provideHashbrown } from '@hashbrownai/angular';
import { AssistantModeService } from './services/assistant-mode.service';
import { AssistantUsersService } from './services/assistant-users.service';

// Hashbrown is provided on this lazy route only, so the main bundle doesn't grow.
export default [
  {
    path: '',
    loadComponent: () => import('./assistant-page.component'),
    providers: [
      provideHashbrown({
        baseUrl: `${environment.baseUrl}/ai/run`,
        // Hashbrown 0.8 reports milestones from dev builds; this demo sends none.
        telemetry: false,
      }),
      AssistantModeService,
      AssistantUsersService,
    ],
  },
] satisfies Routes;
