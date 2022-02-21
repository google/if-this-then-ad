import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpClient
} from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { catchError, Observable, throwError } from 'rxjs';
import { User } from '../models/user.model'
import { Token } from '../interfaces/token';


/**
 * Interceptor for HTTP requests, it attaches Authorization 
 * Header and attempts to do a token refresh when  current 
 * access Token expires. 
 * At other layers ensure user is redirected to login 
 * if Token expired error is thrown.
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private  MAXRETRIES = 2;
  private retries = 0;


  constructor(private http: HttpClient) { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {

    let accessToken = '';
    const localUser = localStorage.getItem('user');
    if (localUser) {
      const user = User.fromJson(localUser);
      accessToken = user.token.access;
    }
    
    const req = request.clone({ setHeaders: { 'Authorization': 'Bearer ' + accessToken }, });
    
    return next.handle(req).pipe(catchError((err) => {
      const codes = new Set([401, 403, 504]);
      if (codes.has(err.status) && this.retries < this.MAXRETRIES) {

        this.retries ++; 

        this.refreshAccessToken().subscribe({
          next(t) {
            console.log(t);
            const retryRequest = req.clone({ setHeaders: { 'Authorization': 'Bearer ' + t.access }, });
            return next.handle(retryRequest);
          },
          error(e) { console.error(e) }
        }

        );
      }
      return throwError(() => new Error('Access Token expired: Login again'));
     }));
  }

  private refreshAccessToken(): Observable<any> {

    let user: User = User.fromJson(localStorage.getItem('user'));
    const token = user.token.access;
    const userId = user.id;
    const data = {
      userId,
      token
    }
    return this.http.post<Token>(`${environment.apiUrl}/auth/refresh`, data);
  }
}