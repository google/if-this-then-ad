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

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from 'src/app/interfaces/user';

import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})

/**
 * Login component.
 */
export class LoginComponent implements OnInit {
  bannerImage = 'assets/img/iftta-banner.png';

  /**
   * Constructor.
   *
   * @param {Router} router
   * @param {ActivatedRoute} route
   * @param {AuthService} authService
   * @param {UserService} userService
   */
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public authService: AuthService,
    private userService: UserService
  ) {}

  /**
   * Handle login if user is in query params.
   */
  ngOnInit() {
    const userString = this.route.snapshot.queryParamMap.get('user');

    if (userString) {
      const user = JSON.parse(userString) as User;
      this.userService.updateUser(user);

      // Redirect user to where they came from
      const returnTo = this.route.snapshot.queryParamMap.get('returnTo') || '';
      this.router.navigate([returnTo]);
    }
  }
}
