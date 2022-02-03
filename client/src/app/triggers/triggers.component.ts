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

import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';
import { SourceAgent } from 'src/app/interfaces/source-agent';
import { DataPoint } from 'src/app/interfaces/datapoint';
import { Trigger } from '../models/trigger.model';

@Component({
  selector: 'app-triggers',
  templateUrl: './triggers.component.html',
  styleUrls: ['./triggers.component.scss']
})

export class TriggersComponent implements OnInit, AfterViewInit {
  agents: SourceAgent[] = [];
  agentDataPoints: DataPoint[] = [];
  currentTrigger: Trigger = new Trigger();
  triggers: Trigger[] = [];
  displayedColumns: string[] = ['name', 'source', 'type', 'condition', 'value', 'interval'];
  dataSource = new MatTableDataSource<any>(this.triggers);

  conditionsMapping: {} = {
    gt: 'Greater Than',
    lt: 'Lower Than',
    yes: 'Yes',
    no: 'No',
  }

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private http: HttpClient) {
    this.loadAgents();
    this.loadRules();
  }

  ngOnInit(): void {}

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  /**
   * Get source agent by ID.
   *
   * @param {string} id
   * @returns {SourceAgent | undefined}
   */
  getSourceAgent(id: string): SourceAgent | undefined {
    return this.agents.find(agent => agent.id === id);
  }

  /**
   * Fetch all rules from API.
   */
  loadRules() {
    this.http.get<Array<Trigger>>(`${environment.apiUrl}/rules`)
    .pipe(map((res: Array<Trigger>) => res))
    .subscribe(result => {
      this.triggers = result;

      this.dataSource.data = this.triggers;
      this.dataSource.paginator = this.paginator;
    });
  }

  /**
   * Fetch all source agents from API.
   */
   loadAgents() {
    this.http.get<Array<SourceAgent>>(`${environment.apiUrl}/agents/metadata`)
    .pipe(map((res: Array<SourceAgent>) => res))
    .subscribe(result => {
      this.agents = result;

      console.log(this.agents);
    });
  }

  /**
   * Handle source change.
   *
   * @param {string} val
   */
  onSourceChange(val: string) {
    this.currentTrigger.agent.id = val;

    const agent = this.getSourceAgent(val)

    if (agent) {
      this.agentDataPoints = agent.dataPoints;
    }
  }

  /**
   * Handle dataPoint change.
   *
   * @param {DataPoint} val
   */
  onDataPointChange(val: DataPoint) {
    this.currentTrigger.rule.dataPoint = val.id;
    this.currentTrigger.rule.dataType = val.dataType;
  }

  /**
   * Add trigger.
   *
   * @param {any} form
   */
  addTrigger(form: any) {
    this.triggers.push(this.currentTrigger);

    this.dataSource.data = this.triggers;
    this.dataSource.paginator = this.paginator;

    this.http.post(`${environment.apiUrl}/rules`, this.currentTrigger)
    .subscribe(result => {
      console.log('addTrigger', result);
    });

    this.currentTrigger = new Trigger();
  }

  /**
   * Convert agent ID to UI friendly name.
   *
   * @param {string} id
   * @returns {string | undefined}
   */
  agentIdToDisplayName(id: string): string | undefined {
    const agent = this.getSourceAgent(id);

    return agent?.displayName;
  }

  /**
   * Get UI friendly dataPoint type.
   *
   * @param {string} agentId
   * @param {string} dataPointId 
   * @returns {string | undefined}
   */
  getDataPointTypeUi(agentId: string, dataPointId: string): string | undefined {
    const agent = this.getSourceAgent(agentId);

    const dataPoint: DataPoint|undefined = agent?.dataPoints.find(dp => dp.id === dataPointId);

    return dataPoint?.displayName;
  }

  /**
   * Get UI friendly condition.
   *
   * @param {string} condition
   * @returns {string}
   */
  getConditionUi(condition: string): string {
    // @ts-ignore
    return this.conditionsMapping[condition];
  }
}