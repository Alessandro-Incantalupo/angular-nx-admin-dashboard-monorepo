import { User } from '@admin-dashboard-nx-monorepo/models';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { injectBaseUrl } from '@core/CIF/inject-base-url';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly createUrlRemote = injectBaseUrl();

  private readonly authUrl = this.createUrlRemote(`/auth`, () => `/auth`);

  decodeUserFromToken(): any | null {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return decoded as User;
    } catch {
      return null;
    }
  }

  login(email: string, password: string) {
    return this.http.post<{ token: string }>(this.authUrl + '/login', {
      email,
      password,
    });
  }
}
