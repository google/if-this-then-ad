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
import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import {
  faCircle,
  faCirclePause,
  faRefresh,
} from '@fortawesome/free-solid-svg-icons';
import { map } from 'rxjs/operators';
import { RuleTargetAction } from 'src/app/interfaces/rule';
import { store } from 'src/app/store';
import { environment } from 'src/environments/environment';

interface AdGroup {
  customerId: string;
  campaignId: string;
  campaignName: string;
  id: string;
  name: string;
  type: string;
  status: string;
}

@Component({
  selector: 'app-googleads-selector',
  templateUrl: './googleads-selector.component.html',
  styleUrls: ['./googleads-selector.component.scss'],
})

/**
 *  Google ad groups selector component
 */
export class GoogleAdsSelectorComponent implements AfterViewInit {
  adGroupEnabled = faCircle;
  adGroupDisabled = faCirclePause;
  faRefresh = faRefresh;
  isLoading = true;
  adGroups: AdGroup[] = [];
  displayedColumns: string[] = ['status', 'name', 'campaignName', 'type', 'id'];
  selectedRows = new Set<AdGroup>();
  dataSource = new MatTableDataSource<any>(this.adGroups);
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  /**
   * Constructor: Http client gets injected.
   *
   * @param {HttpClient} http Http client
   */
  constructor(private http: HttpClient) {}

  // eslint-disable-next-line require-jsdoc
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  /**
   * Fetch Google ads data to display
   */
  ngOnInit(): void {
    this.fetchAccountData();
  }

  /**
   * Handle select row click event.
   *
   * @param {AdGroup} r Clicked row
   */
  selectRow(r: AdGroup) {
    if (this.selectedRows.has(r)) {
      this.selectedRows.delete(r);
    } else {
      this.selectedRows.add(r);
    }
    const targetAgentActions = this.transformToActions(this.selectedRows);
    store.targets.next(targetAgentActions);

    // Update save requirements
    const valid = this.selectedRows.size > 0;
    store.saveRequirements.next({
      ...store.saveRequirements.value,
      ...{ target: valid },
    });
  }

  /**
   * Transform user selection into a TargetAgent object.
   *
   * @param {Set<AdGroup>} userSelection
   * @returns {TargetAgent} TargetAgent Object
   */
  private transformToActions(userSelection: Set<AdGroup>): RuleTargetAction[] {
    const actions: RuleTargetAction[] = [...userSelection].map((row) => ({
      agentId: 'google-ads',
      action: 'ACTIVATE',
      parameters: {
        customerAccountId: row.customerId,
        adGroupId: row.id,
      },
    }));
    return actions;
  }

  /**
   * Refresh ad groups.
   */
  refreshAdGroups() {
    this.isLoading = true;
    this.fetchAccountData();
  }

  /**
   * Fetch Google Ads account data.
   */
  private fetchAccountData() {
    this.http
      .get<AdGroup[]>(
        `${environment.apiUrl}/agents/googleads-agent/list/adgroups`
      )
      .pipe(map((res: AdGroup[]) => res))
      .subscribe((adGroups) => {
        this.adGroups = adGroups;
        this.dataSource.data = this.adGroups;
        this.dataSource.paginator = this.paginator;
        this.isLoading = false;
      });
  }
}
