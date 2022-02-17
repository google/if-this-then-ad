import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { environment } from 'src/environments/environment';

import { User } from 'src/app/models/user.model';

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  currentUser: User | null;

  constructor(private route: ActivatedRoute) {
    // Get user from localStorage
    if (localStorage.getItem('user')) {
      this.currentUser = new User().deserialize(JSON.parse(localStorage.getItem('user')!));
    }
  }

  /**
   * Login.
   */
  login() {
    this.route.queryParamMap.subscribe((params) => {
      const returnTo = params.get('returnTo') || '';

      window.location.href = `${environment.apiUrl}/auth/login?returnTo=${returnTo}`;
    });
  }

  /**
   * Get logged in user.
   * 
   * @returns {User|null}
   */
  get user(): User | null {
    return this.currentUser;
  }

  /**
   * Check if logged in.
   * 
   * @returns {boolean}
   */
  get isLoggedIn(): boolean {
    return localStorage.getItem('user') !== null;
  }

  /**
   * Set user.
   * 
   * @param
   */
  set user(user: User | null) {
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUser = user;
  }

  /**
   * Logout.
   */
  logout() {
    localStorage.removeItem('user');
    this.currentUser = null;
  }
}