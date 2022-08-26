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

import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, switchMap, throwError } from 'rxjs';
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
  /**
   * Constructor
   * @param {AuthService} authService injected
   */
  constructor(private authService: AuthService) {}

  /**
   * Applies an access token to the request's authorization header.
   * @param {HttpRequest<unknown>} request the request to be sent
   * @param {string} accessToken the access token for the authorization header
   * @returns {HttpRequest<unknown>} the authorized request
   */
  private applyToken(request: HttpRequest<unknown>, accessToken: string) {
    return request.clone({
      setHeaders: { Authorization: 'Bearer ' + accessToken },
    });
  }

  /**
   * Handles the access token refresh.
   * @param {HttpRequest<unknown>} request the request to be sent
   * @param {HttpHandler} next the next handler in the chain.
   * @returns {Observable<HttpEvent<any>>}
   */
  private handleRefresh(request: HttpRequest<unknown>, next: HttpHandler) {
    return this.authService
      .refreshAccessToken()
      .pipe(
        switchMap((credentials) =>
          next.handle(this.applyToken(request, credentials.accessToken))
        )
      );
  }

  /**
   * Handle HTTP request.
   * @param {HttpRequest<unknown>} request the request to authorize
   * @param {HttpHandler} next the next handler in the chain.
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
