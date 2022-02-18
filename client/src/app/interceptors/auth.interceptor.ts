import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor, 
} from '@angular/common/http';
import { Observable } from 'rxjs';
import {User} from '../models/user.model'
@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor() {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {

    let accessToken = '';
    
    if (localStorage.getItem('user')) {
      const user = new User().deserialize(JSON.parse(localStorage.getItem('user')!));
      accessToken = user.token.access; 
    }
    const req = request.clone({setHeaders: {Authorization : 'Bearer '+ accessToken}, })

    console.log(req.headers);
    return next.handle(req);
  }
}
