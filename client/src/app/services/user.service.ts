import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Token } from '../interfaces/token';
import { User } from '../models/user.model';

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
      this.updateUser(
        User.fromJSON(localStorage.getItem(this.localStorageUserKey))
      );
    }
  }

  /**
   * Get logged in user.
   *
   * @returns {User}
   */
  get user(): User {
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
   *
   * @param {Token} token
   */
  updateToken(token: Token) {
    this.currentUser!.token = token;
    this.updateUser(this.currentUser);
  }
}
