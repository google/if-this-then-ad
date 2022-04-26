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

import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';
import { AuthService } from 'src/app/services/auth.service';
import { Rule } from 'src/app/models/rule.model';

import { store } from 'src/app/store';
import { User } from 'src/app/models/user.model';
import {
  faTriangleExclamation,
  faCircleCheck,
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-rules-status',
  templateUrl: './rules.status.component.html',
  styleUrls: ['./rules.status.component.scss'],
})

/**
 * Rules component.
 */
export class RulesStatusComponent implements AfterViewInit {
  errorIcon = faTriangleExclamation;
  successIcon = faCircleCheck;
  rules: Rule[] = [];
  displayedColumns: string[] = [
    'name',
    'source',
    'lastExecution',
    'status',
    'message',
  ];
  dataSource = new MatTableDataSource<any>(this.rules);
  user: User | null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  /**
   * Constructor.
   *
   * @param {HttpClient} http
   */
  constructor(private http: HttpClient, private authService: AuthService) {
    // Reload rules when rule was added
    this.user = this.authService.currentUser;
    store.ruleAdded.subscribe((v) => {
      this.loadRules();
    });

    this.loadRules();
  }

  // eslint-disable-next-line require-jsdoc
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  /**
   * Fetch all rules for logged in user.
   */
  loadRules() {
    this.http
      .get<Array<Rule>>(`${environment.apiUrl}/rules/user/${this.user?.id}`)
      .pipe(map((res: Array<Rule>) => res))
      .subscribe((result) => {
        this.rules = result;
        console.log(this.rules);
        this.dataSource.data = this.rules;
        this.dataSource.paginator = this.paginator;
      });
  }
}
