import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Token } from '../interfaces/token';
import { User, UserSettingKeyValue } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})

/**
 * User service to store and retrieve user.
 */
export class UserService {
  localStorageUserKey: string = 'user';
  currentUser: User | null;
  userWatch: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(
    null
  );

  /**
   * Constructor.
   */
  constructor() {
    this.loadFromLocalStorage();
  }

  /**
   * Get user from local storage.
   */
  loadFromLocalStorage() {
    if (localStorage.getItem(this.localStorageUserKey)) {
      this.user = User.fromJSON(localStorage.getItem(this.localStorageUserKey));
    }
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
   * Set user.
   *
   * @param {User|null} user
   */
  set user(user: User | null) {
    this.currentUser = user;

    // Write to LocalStorage
    localStorage.setItem(
      this.localStorageUserKey,
      JSON.stringify(user || '""')
    );

    // Propagate
    this.userWatch.next(user);
  }

  /**
   * Remove user from localStorage.
   */
  remove() {
    localStorage.removeItem(this.localStorageUserKey);
    this.user = null;
  }

  /**
   * Get user setting.
   *
   * @param {string} setting
   * @returns {string|number}
   */
  getSetting(setting: string) {
    return this.currentUser &&
      this.currentUser.userSettings &&
      setting in this.currentUser.userSettings
      ? (this.currentUser.userSettings[setting] as string)
      : '';
  }

  /**
   * Set user settings.
   *
   * @param {UserSettingKeyValue} settings
   */
  setSettings(settings: UserSettingKeyValue) {
    if (this.currentUser) {
      this.currentUser.userSettings = settings;
      this.user = this.currentUser;
    }
  }

  /**
   * Set new user token.
   *
   * @param {Token} token
   */
  updateToken(token: Token) {
    this.currentUser!.token = token;
    this.user = this.currentUser;
  }
}
