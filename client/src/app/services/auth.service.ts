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
import { ActivatedRoute, Router } from '@angular/router';

import { environment } from 'src/environments/environment';

import { User, UserSettingKeyValue } from 'src/app/models/user.model';
import { BehaviorSubject } from 'rxjs';
import { Token } from '../interfaces/token';
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
    this.getUserFromLocalStorage();
  }

  getUserFromLocalStorage() {
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
      const clientUrl =
        this.router['location']._platformLocation.location.origin;

      window.location.href = `${environment.apiUrl}/auth/login?returnTo=${returnTo}&clientUrl=${clientUrl}`;
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
  /**
   * Gets Access token for a user
   */
  get accessToken() {
    return this.currentUser?.token?.access ?? '';
  }

  /**
   * Set new user token
   * @param {Token} userToken
   */
  updateToken(userToken: Token) {
    this.currentUser!.token = userToken;
    this.user = this.currentUser;
  }

  getUserSetting(s: string) {
    this.getUserFromLocalStorage();

    return this.currentUser 
      && this.currentUser.userSettings
      && (s in this.currentUser.userSettings)
        ? this.currentUser.userSettings[s] as string
        : '';
  }

  setUserSettings(userSettings: UserSettingKeyValue) {
    if (this.currentUser) {
        this.currentUser.userSettings = userSettings;
        this.user = this.currentUser;
    }
  }
}
