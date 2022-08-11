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
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Rule } from 'src/app/models/rule.model';
import { User } from 'src/app/models/user.model';
import { environment } from 'src/environments/environment';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-dash',
  templateUrl: './dash.component.html',
  styleUrls: ['./dash.component.scss'],
})

/**
 * Dash Component.
 */
export class DashComponent implements OnInit {
  displayName: string;
  user: User;
  rules: Rule[];
  activeRules: number = 0;
  inactiveRules: number = 0;
  errorRules: number = 0;
  adsManaged: number = 420;

  /**
   * Constructor.
   *
   * @param {UserService} userService
   */
  constructor(private userService: UserService, private http: HttpClient) {}

  /**
   * Init.
   */
  ngOnInit(): void {
    this.displayName = this.userService.currentUser?.displayName!;
    this.user = this.userService.currentUser!;
    this.loadRules();
  }

  // TODO: centralise all data fetching into one service
  // use caching to prevent hitting the api unnecessarily.
  /**
   * Fetch all rules for logged in user.
   */
  loadRules() {
    this.http
      .get<Array<Rule>>(`${environment.apiUrl}/rules/user/${this.user?.id}`)
      .pipe(map((res: Array<Rule>) => res))
      .subscribe((result) => {
        this.rules = result;
        this.calculateStats(this.rules);
      });
  }

  /**
   * Calculates statics to display on the dashboard.
   *
   * @param {Rule[]} rules
   */
  calculateStats(rules: Rule[]) {
    rules.forEach((r) => {
      this.activeRules += 1;
      if (!r.status?.success) {
        this.errorRules += 1;
      }
    });
  }
}
