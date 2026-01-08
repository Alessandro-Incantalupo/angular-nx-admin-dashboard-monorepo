import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-function1',
  standalone: true,
  template: `
    <div class="p-6">
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-blue-600">Function 1 Page</h1>
        <p class="text-gray-600 mt-2">Questa è una sottopagina di Users</p>
      </div>

      <div class="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
        <h2 class="text-xl font-semibold mb-2">Navigation Flow:</h2>
        <ol class="list-decimal list-inside space-y-1 text-sm">
          <li>App Component → redirect to <code class="bg-blue-100 dark:bg-blue-900 px-1 rounded">/users</code> (home)</li>
          <li>Users Page → click button → <code class="bg-blue-100 dark:bg-blue-900 px-1 rounded">/users/function1</code></li>
        </ol>
      </div>

      <div class="flex gap-3">
        <button
          (click)="goBack()"
          class="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded font-medium shadow-md transition-transform hover:scale-105"
        >
          ← Back to Users
        </button>
        
        <button
          (click)="navigateToUserDetail(123)"
          class="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded font-medium shadow-md transition-transform hover:scale-105"
        >
          Go to User Detail (123)
        </button>
      </div>

      <div class="mt-6 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
        <h3 class="font-semibold mb-2">✅ Funzionalità implementate:</h3>
        <ul class="list-disc list-inside space-y-1 text-sm">
          <li>Navigazione da Users a Function1 tramite button</li>
          <li>Router injection con <code class="bg-green-100 dark:bg-green-900 px-1 rounded">inject(Router)</code></li>
          <li>Metodo <code class="bg-green-100 dark:bg-green-900 px-1 rounded">navigate()</code> per navigazione programmatica</li>
          <li>Route annidata in users.routes.ts</li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    
    code {
      font-family: 'Courier New', monospace;
      font-size: 0.875rem;
    }
  `]
})
export default class Function1Component {
  private readonly router = inject(Router);

  goBack() {
    this.router.navigate(['/users']);
  }

  navigateToUserDetail(userId: number) {
    this.router.navigate(['/users/detail', userId]);
  }
}
