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
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpClient,
} from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { catchError, Observable, throwError } from 'rxjs';
import { User } from '../models/user.model';
import { Token } from '../interfaces/token';
import { AuthService } from '../services/auth.service';

@Injectable()
/**
 * Interceptor for HTTP requests, it attaches Authorization
 * Header and attempts to do a token refresh when  current
 * access Token expires.
 * At other layers ensure user is redirected to login
 * if Token expired error is thrown.
 */
export class AuthInterceptor implements HttpInterceptor {
  private MAXRETRIES = 2;
  private retries = 0;

  /**
   * Constructor.
   *
   * @param {HttpClient} http
   * @param {AuthService} authService
   */
  constructor(private http: HttpClient, private authService: AuthService) {}

  /**
   * Handle HTTP request.
   *
   * @param {HttpRequest<unknown>} request
   * @param {HttpHandler} next
   * @returns {Observable<HttpEvent<unknown>>}
   */
  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    const accessToken = this.authService.accessToken;
    const req = request.clone({
      setHeaders: { Authorization: 'Bearer ' + accessToken },
    });

    return next.handle(req).pipe(
      catchError((err) => {
        const codes = new Set([401, 403, 504]);
        if (codes.has(err.status) && this.retries < this.MAXRETRIES) {
          this.retries++;
          this.refreshAccessToken().subscribe({
            next(t) {
              const retryRequest = req.clone({
                setHeaders: { Authorization: 'Bearer ' + t?.access },
              });
              return next.handle(retryRequest);
            },
            error(e) {
              console.error(e);
            },
          });
          // update token on the user
          this.refreshAccessToken().subscribe({
            next: (t) => this.authService.updateToken(t),
          });
        }
        return throwError(() => new Error('Access Token expired: Login again'));
      })
    );
  }

  /**
   * Refresh access token.
   *
   * @returns {Observable<any>}
   */
  private refreshAccessToken(): Observable<any> {
    const user: User = this.authService.currentUser!;
    const token = this.authService.accessToken;
    const userId = user.id;
    const data = {
      userId,
      token,
    };

    return this.http.post<Token>(`${environment.apiUrl}/auth/refresh`, data);
  }
}
