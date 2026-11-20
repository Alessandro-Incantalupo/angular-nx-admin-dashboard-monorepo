import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found-page',
  imports: [RouterLink],
  template: `
    <main class="mx-auto max-w-xl px-4 py-16">
      <h1 class="text-2xl font-semibold">This page doesn't exist</h1>
      <p class="text-muted mt-2">
        The address may be mistyped, or the page has moved.
      </p>
      <p class="mt-6"><a routerLink="/dashboard">Go to the dashboard</a></p>
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class NotFoundPage {}
