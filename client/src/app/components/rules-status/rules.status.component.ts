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

import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import {
  faCircleCheck,
  faQuestion,
  faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons';
import { AgentsMetadata } from 'src/app/interfaces/api';
import { Rule } from 'src/app/interfaces/rule';
import { UserService } from 'src/app/services/user.service';
import { store } from 'src/app/store';

interface RulesDataSourceItem {
  status?: string;
  name: string;
  source: string;
  lastExecution?: Date;
  message?: string;
}

@Component({
  selector: 'app-rules-status',
  templateUrl: './rules.status.component.html',
  styleUrls: ['./rules.status.component.scss'],
})

/**
 * Rules component.
 */
export class RulesStatusComponent implements AfterViewInit, OnInit {
  errorIcon = faTriangleExclamation;
  successIcon = faCircleCheck;
  unknownStatusIcon = faQuestion;
  columnHeaders: string[] = [
    'status',
    'name',
    'source',
    'lastExecution',
    'message',
  ];
  dataSource = new MatTableDataSource<RulesDataSourceItem>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  agentsMetadata: AgentsMetadata;

  /**
   * Constructor.
   *
   * @param {HttpClient} http
   */
  constructor(private http: HttpClient, private userService: UserService) {}

  /**
   * @inheritdoc
   */
  ngOnInit(): void {
    store.agents.subscribe((agentsMetadata) => {
      this.agentsMetadata = agentsMetadata;
    });

    store.rules.subscribe((rules) => {
      this.dataSource.data = this.createRulesDataSource(rules);
    });
  }

  // eslint-disable-next-line require-jsdoc
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  /**
   * Transforms a set of rules into a table data source.
   * @param {Rule[]} rules the rules to display
   * @returns {RulesDataSourceItem[]}
   */
  private createRulesDataSource(rules: Rule[]): RulesDataSourceItem[] {
    return rules.map((rule) => {
      const sourceAgentMetadata = this.agentsMetadata.source?.find(
        (agentMetadata) => agentMetadata.id === rule.source.agentId
      );
      const status = rule.latestStatus
        ? rule.latestStatus.success
          ? 'success'
          : 'failed'
        : undefined;

      return {
        status,
        name: rule.name,
        source: sourceAgentMetadata?.name ?? '[Unknown source]',
        lastExecution: rule.latestStatus?.lastExecution,
        message: rule.latestStatus?.error,
      };
    });
  }
}
