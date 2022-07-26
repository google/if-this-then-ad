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
} from '@angular/common/http';
import { catchError, Observable, throwError, switchMap } from 'rxjs';
import { AuthService } from '../services/auth.service';

const REFRESH_ERROR_CODES = new Set([401]);

@Injectable()
/**
 * Interceptor for HTTP requests, it attaches Authorization
 * Header and attempts to do a token refresh when current
 * access Token expires.
 * At other layers ensure user is redirected to login
 * if Token expired error is thrown.
 */
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  private applyToken(request: HttpRequest<unknown>, accessToken: string) {
    return request.clone({
      setHeaders: { Authorization: 'Bearer ' + accessToken },
    });
  }

  private handleRefresh(request: HttpRequest<unknown>, next: HttpHandler) {
    return this.authService
      .refreshAccessToken()
      .pipe(
        switchMap((token) =>
          next.handle(this.applyToken(request, token.access))
        )
      );
  }

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
    const authRequest = this.applyToken(request, accessToken);

    return next
      .handle(authRequest)
      .pipe(
        catchError((err) =>
          REFRESH_ERROR_CODES.has(err.status)
            ? this.handleRefresh(authRequest, next)
            : throwError(() => err)
        )
      );
  }
}
