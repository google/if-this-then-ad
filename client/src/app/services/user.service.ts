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
import { BehaviorSubject } from 'rxjs';
import { Credentials, User } from '../interfaces/user';

@Injectable({
  providedIn: 'root',
})

/**
 * User service to store and retrieve user.
 */
export class UserService {
  localStorageUserKey: string = 'user';
  currentUser?: User;
  userWatch: BehaviorSubject<User | undefined> = new BehaviorSubject<
    User | undefined
  >(undefined);

  /**
   * Constructor.
   */
  constructor() {
    this.loadFromLocalStorage();
  }

  /**
   * Get user from local storage.
   */
  private loadFromLocalStorage() {
    if (localStorage.getItem(this.localStorageUserKey)) {
      const userString = localStorage.getItem(this.localStorageUserKey);
      const user = JSON.parse(userString!) as User;
      this.updateUser(user);
    }
  }

  /**
   * Get logged in user.
   *
   * @returns {User}
   */
  get loggedInUser(): User {
    if (this.currentUser) {
      return this.currentUser;
    } else {
      throw new Error('No logged in user');
    }
  }

  /**
   * Update user.
   *
   * @param {User|undefined} user
   */
  updateUser(user?: User) {
    this.currentUser = user;

    if (user) {
      // Write to LocalStorage
      localStorage.setItem(this.localStorageUserKey, JSON.stringify(user));
    } else {
      localStorage.removeItem(this.localStorageUserKey);
    }

    // Propagate
    this.userWatch.next(user);
  }

  /**
   * Get user setting.
   *
   * @param {string} setting
   * @returns {string|number}
   */
  getSetting(setting: string) {
    return this.currentUser &&
      this.currentUser.settings &&
      setting in this.currentUser.settings
      ? (this.currentUser.settings[setting] as string)
      : '';
  }

  /**
   * Set user settings.
   *
   * @param {Record<string, string>} settings
   */
  setSettings(settings: Record<string, string>) {
    if (this.currentUser) {
      this.currentUser.settings = settings;
      this.updateUser(this.currentUser);
    }
  }

  /**
   * Set new user token.
   * @param {Credentials} credentials the new user credentials
   */
  updateCredentials(credentials: Credentials) {
    this.loggedInUser.credentials = credentials;
    this.updateUser(this.loggedInUser);
  }
}
