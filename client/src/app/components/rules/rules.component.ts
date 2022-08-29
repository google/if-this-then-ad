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
import { combineLatestWith } from 'rxjs';
import { AgentsMetadata } from 'src/app/interfaces/api';
import { Rule, RuleStatus } from 'src/app/interfaces/rule';
import { RulesService } from 'src/app/services/rules.service';
import { UserService } from 'src/app/services/user.service';
import { store } from 'src/app/store';

interface RulesDataSourceItem {
  id: string;
  latestStatus?: RuleStatus;
  name: string;
  executionInterval: number;
  source: {
    agentId: string;
    agentName: string;
  };
  condition: {
    dataPoint?: string;
    comparator: string;
    value: string | number | boolean;
  };
}

@Component({
  selector: 'app-rules',
  templateUrl: './rules.component.html',
  styleUrls: ['./rules.component.scss'],
})

/**
 * Rules component.
 */
export class RulesComponent implements AfterViewInit, OnInit {
  dataSource = new MatTableDataSource<RulesDataSourceItem>([]);
  columnHeaders = [
    'status',
    'name',
    'source',
    'type',
    'comparator',
    'value',
    'interval',
    'lastExecution',
    'message',
    'actions',
  ];

  errorIcon = faTriangleExclamation;
  successIcon = faCircleCheck;
  unknownStatusIcon = faQuestion;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  /**
   * Constructor.
   *
   * @param {HttpClient} http
   */
  constructor(
    private readonly http: HttpClient,
    private readonly userService: UserService,
    private readonly rulesService: RulesService
  ) {}

  /**
   * @inheritdoc
   */
  ngOnInit(): void {
    store.rules
      .pipe(combineLatestWith(store.agents))
      .subscribe(([rules, agentsMetadata]) => {
        this.dataSource.data = this.createRulesDataSource(
          rules,
          agentsMetadata
        );
      });
    this.rulesService.fetchRulesForCurrentUser();
  }

  /**
   * Transforms rules into a table data source.
   * @param {Rule[]} rules the rules
   * @param {AgentsMetadata} agentsMetadata the agent metadata
   * @returns {RulesDataSourceItem[]} the table data source
   */
  private createRulesDataSource(
    rules: Rule[],
    agentsMetadata: AgentsMetadata
  ): RulesDataSourceItem[] {
    return rules.map((rule) => {
      const sourceAgentMetadata = agentsMetadata?.source.find(
        (agentMetadata) => agentMetadata.id === rule.source.agentId
      );
      const sourceDataPointMetadata = sourceAgentMetadata?.dataPoints.find(
        (dataPointMetadata) =>
          (dataPointMetadata.key = rule.condition.dataPoint)
      );
      return {
        id: rule.id,
        latestStatus: rule.latestStatus,
        name: rule.name,
        executionInterval: rule.executionInterval,
        source: {
          agentId: rule.source.agentId,
          agentName: sourceAgentMetadata?.name ?? '[Unknown agent]',
        },
        condition: {
          dataPoint: sourceDataPointMetadata?.name,
          comparator: this.rulesService.getComparatorLabel(
            rule.condition.comparator
          ),
          value: rule.condition.compareValue,
        },
      };
    });
  }

  /**
   * @inheritdoc
   */
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  /**
   * Delete rule.
   *
   * @param {Rule} rule
   */
  removeRule(rule: Rule) {
    this.rulesService.deleteRule(rule.id);
  }
}
