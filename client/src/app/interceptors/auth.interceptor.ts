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
import { AuthService } from '../services/auth.service';


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


  constructor(private http: HttpClient, private authService:AuthService) { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {

    const accessToken = this.authService.accessToken;     
    const req = request.clone({ setHeaders: { 'Authorization': 'Bearer ' + accessToken }});
    
    return next.handle(req).pipe(catchError((err) => {
      const codes = new Set([401, 403, 504]);
      if (codes.has(err.status) && this.retries < this.MAXRETRIES) {

        this.retries ++; 
        
        this.refreshAccessToken().subscribe({
          next(t) {
            const retryRequest = req.clone({ setHeaders: { 'Authorization': 'Bearer ' + t.access }});
            return next.handle(retryRequest);
          },
          error(e) { console.error(e) }
        }

        );
        // update token on the user 
        this.refreshAccessToken().subscribe({
          next: (t) => this.authService.updateToken(t)
        });
      }
      return throwError(() => new Error('Access Token expired: Login again'));
     }));
  }

  private refreshAccessToken(): Observable<any> {

    let user: User = this.authService.currentUser!; 
    const token = this.authService.accessToken; 
    const userId = user.id;
    const data = {
      userId,
      token
    }
    return this.http.post<Token>(`${environment.apiUrl}/auth/refresh`, data);
  }
}