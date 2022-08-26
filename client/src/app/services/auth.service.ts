/**
    Copyright 2022 Google LLC
    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at
        https://www.apache.org/licenses/LICENSE-2.0
    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
 */

import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { environment } from 'src/environments/environment';

import { HttpClient } from '@angular/common/http';
import { catchError, Observable, retry, tap, throwError } from 'rxjs';
import { Credentials, User } from '../interfaces/user';
import { UserService } from './user.service';
@Injectable({
  providedIn: 'root',
})

/**
 * Authentication service to handle all auth API requests.
 */
export class AuthService {
  /**
   * Constructor.
   *
   * @param {ActivatedRoute} route
   * @param {Router} router
   */
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private userService: UserService
  ) {}

  /**
   * Login.
   */
  login() {
    this.route.queryParamMap.subscribe((params) => {
      const returnTo = params.get('returnTo') || '';
      const clientUrl =
        this.router['location']._platformLocation.location.origin;

      window.location.href = `${environment.apiUrl}/auth/login?returnTo=${returnTo}&clientUrl=${clientUrl}`;
    });
  }

  /**
   * Check if logged in.
   * @returns {boolean}
   */
  get isLoggedIn(): boolean {
    return !!this.userService.currentUser;
  }

  /**
   * Logout.
   */
  logout() {
    this.userService.updateUser(undefined);
    this.router.navigate(['/login']);
  }

  /**
   * Get access token.
   */
  get accessToken() {
    return this.userService.currentUser?.credentials?.accessToken ?? '';
  }

  /**
   * Request access token refresh from the server.
   *
   * @param {number} maxRetries
   * @returns {Observable<any>}
   */
  refreshAccessToken(maxRetries = 2): Observable<Credentials> {
    const user: User = this.userService.loggedInUser;
    const token = this.accessToken;
    const userId = user.id;
    const data = { userId, token };

    return this.http
      .post<Credentials>(`${environment.apiUrl}/auth/refresh`, data)
      .pipe(
        retry(maxRetries),
        catchError((err) => {
          this.logout();
          return throwError(() => err);
        }),
        tap((token) => this.userService.updateCredentials(token))
      );
  }
}
