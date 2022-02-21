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
import { User } from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-logged-in',
  templateUrl: './logged-in.component.html',
  styleUrls: ['./logged-in.component.scss'],
})

/**
 * Logged-In component to handle the auth callback.
 */
export class LoggedInComponent implements OnInit {
  /**
   * Constructor.
   *
   * @param {Router} router
   * @param {ActivatedRoute} route
   * @param {AuthService} authService
   */
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {
    // Extract user
    const userString = this.route.snapshot.queryParamMap.get('user') || '""';
    this.authService.user =  User.fromJSON(userString);

    // Redirect user to where they came from
    const returnTo = this.route.snapshot.queryParamMap.get('returnTo') || '';
    this.router.navigate([returnTo]);
  }

  // eslint-disable-next-line require-jsdoc
  ngOnInit(): void {}
}
