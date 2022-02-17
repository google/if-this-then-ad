import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';

import { environment } from 'src/environments/environment';

import { User } from 'src/app/models/user.model';

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  headers = new HttpHeaders().set('Content-Type', 'application/json');
  currentUser: User | null;

  constructor(private http: HttpClient, public router: Router) {
    this.currentUser = JSON.parse(localStorage.getItem('user') || '""');
  }

  // Login
  login() {
    return this.http.get<any>(`${environment.apiUrl}/auth/google`)
    .pipe(map(user => {
      localStorage.setItem('user', JSON.stringify(user));
      this.currentUser = user;
    }));
  }

  // Get current user
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  // Check if logged in
  get isLoggedIn(): boolean {
    return localStorage.getItem('user') !== null;
  }

  // Logout
  logout() {
    localStorage.removeItem('user');
    this.currentUser = null;
  }
}