import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { environment } from 'src/environments/environment';

import { User } from 'src/app/models/user.model';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})

/**
 * Authentication service to handle all auth API requests.
 */
export class AuthService {
  currentUser: User | null;
  userWatch: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(
    null
  );

  /**
   * Constructor.
   *
   * @param {ActivatedRoute} route
   * @param {Router} router
   */
  constructor(private route: ActivatedRoute, private router: Router) {
    // Get user from localStorage
    if (localStorage.getItem('user')) {
      this.user = new User().deserialize(
        JSON.parse(localStorage.getItem('user')!)
      );
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
   * @param {User|null} user
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
}
