import {
  PaginatedResponse,
  TableRequest,
  User,
} from '@admin-dashboard-nx-monorepo/models';
import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { injectBaseUrl } from '@core/CIF/inject-base-url';
import { WHITELISTED_API } from '@core/interceptors/base-response.interceptor';
import { BYPASS_LOADING_SPINNER } from '@core/interceptors/loading.interceptor';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private readonly http = inject(HttpClient);
  private readonly createUrlRemote = injectBaseUrl();

  private readonly usersUrl = this.createUrlRemote(`/users`, () => `/users`);
  private readonly RESET_USERS_HTTP_CONTEXT = new HttpContext().set(
    BYPASS_LOADING_SPINNER,
    true
  );
  private readonly WHITELISTED_API_HTTP_CONTEXT = new HttpContext().set(
    WHITELISTED_API,
    true
  );

  // ✅ APPROACH 1: GET with Query Parameters (Simple, RESTful)
  getUsers(page: number = 1, size: number = 5) {
    return this.http.get<PaginatedResponse<User>>(
      `${this.usersUrl}?page=${page}&size=${size}`
    );
  }

  // ✅ APPROACH 1 Enhanced: GET with sorting/filtering via query params
  getUsersWithFilters(
    page: number = 1,
    size: number = 5,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc',
    filterField?: string,
    filterValue?: string
  ) {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (sortBy && sortOrder) {
      params = params.set('sortBy', sortBy).set('sortOrder', sortOrder);
    }

    if (filterField && filterValue) {
      params = params
        .set('filterField', filterField)
        .set('filterValue', filterValue);
    }

    return this.http.get<PaginatedResponse<User>>(this.usersUrl, { params });
  }

  // ✅ APPROACH 2: POST with Request Body (Complex filters, more flexible)
  searchUsers(request: TableRequest<User>) {
    return this.http.post<PaginatedResponse<User>>(
      `${this.usersUrl}/search`,
      request
    );
  }

  addUser(user: User) {
    return this.http.post<User>(this.usersUrl, user);
  }

  updateUser(user: User) {
    return this.http.put<User>(`${this.usersUrl}/${user.id}`, user);
  }

  deleteUser(userId: string) {
    return this.http.delete<void>(`${this.usersUrl}/${userId}`);
  }

  resetDemoData() {
    return this.http.post<void>(
      this.usersUrl + '/reset',
      {},
      { context: this.RESET_USERS_HTTP_CONTEXT }
    );
  }
}
