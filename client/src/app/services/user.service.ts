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
   * Set user.
   *
   * @param {User|undefined} user
   */
  /* set user(user: User | undefined) {
    this.currentUser = user;

    if (user) {
      // Write to LocalStorage
      localStorage.setItem(this.localStorageUserKey, JSON.stringify(user));
    } else {
      localStorage.removeItem(this.localStorageUserKey);
    }

    // Propagate
    this.userWatch.next(user);
  } */

  /**
   * Something.
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
      // this.user = this.currentUser;
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
