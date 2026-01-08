import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navigation-example',
  standalone: true,
  template: `
    <div class="navigation-example">
      <h2>Navigation Example</h2>
      
      <!-- Navigazione semplice -->
      <button (click)="navigateToUsers()">
        Go to Users
      </button>
      
      <!-- Navigazione con parametro -->
      <button (click)="navigateToUserDetail(123)">
        Go to User Detail (ID: 123)
      </button>
      
      <!-- Navigazione con query params -->
      <button (click)="navigateWithQueryParams()">
        Go to Users (with filters)
      </button>
      
      <!-- Navigazione relativa -->
      <button (click)="navigateRelative()">
        Go to Sibling Route
      </button>
    </div>
  `,
  styles: [`
    .navigation-example {
      padding: 20px;
      
      button {
        display: block;
        margin: 10px 0;
        padding: 10px 20px;
        background: #0066cc;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        
        &:hover {
          background: #0052a3;
        }
      }
    }
  `]
})
export class NavigationExampleComponent {
  private readonly router = inject(Router);

  navigateToUsers() {
    this.router.navigate(['/users']);
  }

  navigateToUserDetail(userId: number) {
    this.router.navigate(['/users', userId]);
    // Risulta in: /users/123
  }

  navigateWithQueryParams() {
    this.router.navigate(['/users'], {
      queryParams: { 
        page: 1, 
        filter: 'active',
        sort: 'name'
      }
    });
    // Risulta in: /users?page=1&filter=active&sort=name
  }

  navigateRelative() {
    // Navigazione relativa alla route corrente
    this.router.navigate(['../sibling']);
  }

  // Esempio con async/await per gestire il risultato
  async navigateAsync() {
    const success = await this.router.navigate(['/users']);
    
    if (success) {
      console.log('Navigazione completata con successo');
    } else {
      console.log('Navigazione fallita o bloccata da guard');
    }
  }

  // Esempio con navigateByUrl (URL assoluto)
  navigateByUrl() {
    this.router.navigateByUrl('/users/123?tab=profile');
  }

  // Esempio con stato custom
  navigateWithState() {
    this.router.navigate(['/users'], {
      state: { 
        returnUrl: '/dashboard',
        message: 'Welcome back!'
      }
    });
    
    // Per recuperare lo stato nel component di destinazione:
    // const state = this.router.getCurrentNavigation()?.extras.state;
  }
}
