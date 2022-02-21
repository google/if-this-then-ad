import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { environment } from 'src/environments/environment';

import { User } from 'src/app/models/user.model';
import { BehaviorSubject } from 'rxjs';
import { Token } from "../interfaces/token";
@Injectable({
  providedIn: 'root'
})

export class AuthService {
  currentUser: User | null;
  userWatch: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);

  constructor(private route: ActivatedRoute, private router: Router) {
    // Get user from localStorage
    if (localStorage.getItem('user')) {
      this.currentUser = User.fromJSON(localStorage.getItem('user'));
    }
  }

  /**
   * Login.
   */
  login() {
    this.route.queryParamMap.subscribe((params) => {
      const returnTo = params.get('returnTo') || '';

      window.location.href = `${environment.apiUrl}/auth/login?returnTo=${returnTo}&clientUrl=${this.router['location']._platformLocation.location.origin}`;
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
    return !!this.currentUser;
  }

  /**
   * Set user.
   * 
   * @param
   */
  set user(user: User | null) {
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUser = user;

    if (user) {
      this.userWatch.next(user);
    }
  }

  /**
   * Logout.
   */
  logout() {
    localStorage.removeItem('user');
    this.currentUser = null;
  }
  /**
   * Gets Access token for a user
   */
  get accessToken() {
    return this.currentUser?.token.access ?? '';
  }

  /**
   * Set new user token
   * @param {Token} userToken 
   */
  updateToken(userToken: Token) {
    this.currentUser!.token = userToken;
    this.user = this.currentUser;
  }
}