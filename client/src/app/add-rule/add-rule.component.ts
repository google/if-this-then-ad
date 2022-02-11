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

import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';
import { SourceAgent } from 'src/app/interfaces/source-agent';
import { DataPoint } from 'src/app/interfaces/datapoint';
import { Rule } from '../models/rule.model';

import { store } from '../store';
import { NgForm } from '@angular/forms';
import { SourceAgentParameter } from '../interfaces/source-agent-parameter';

@Component({
  selector: 'app-add-rule',
  templateUrl: './add-rule.component.html',
  styleUrls: ['./add-rule.component.scss']
})

export class AddRuleComponent implements OnInit {
  sources: SourceAgent[] = [];
  sourceDataPoints: DataPoint[] = [];
  sourceParams: SourceAgentParameter[] = [];
  currentRule: Rule = new Rule();
  saveEnabled: boolean = false;
  comparatorMapping: {} = {
    gt: 'Greater Than',
    lt: 'Lower Than',
    eq: 'Equal',
    yes: 'Yes',
    no: 'No',
  };

  @ViewChild('source', { static: true }) sourceForm: NgForm;
  @ViewChild('condition', { static: true }) conditionForm: NgForm;
  @ViewChild('executionInterval', { static: true }) executionIntervalForm: NgForm;

  constructor(private http: HttpClient) {
    // Watch save requirements
    store.saveRequirements.subscribe(val => {
      this.saveEnabled = Object.values(store.saveRequirements.value).every(x => x);
    });

    // Watch targets update
    store.targets.subscribe(targets => {
      this.currentRule.targets = targets;
    });

    this.loadSourceAgents();

    // TODO: debug
    /*this.currentRule.name = 'test';
    this.currentRule.executionInterval = 1;
    this.currentRule.condition.comparator = 'gt';
    this.currentRule.condition.value = 25;

    this.currentRule.source.params = [
      {
        dataPoint: 'targetLocation',
        name: 'Target Location',
        type: 'string',
        value: 'hamburg,de',
      },
    ];*/
  }

  ngOnInit(): void {
    // Watch source form changes
    this.sourceForm.form.valueChanges.subscribe(val => {
      const valid = !!this.sourceForm.valid;

      store.saveRequirements.next({...store.saveRequirements.value, ...{ source: valid }});
    });

    // Watch executionInterval form changes
    this.executionIntervalForm.form.valueChanges.subscribe(val => {
      const valid = !!this.executionIntervalForm.valid;

      store.saveRequirements.next({...store.saveRequirements.value, ...{ executionInterval: valid }});
    });

    // Watch condition form changes
    this.conditionForm.form.valueChanges.subscribe(val => {
      const valid = !!this.conditionForm.valid;

      store.saveRequirements.next({...store.saveRequirements.value, ...{ condition: valid }});
    });
  }

  /**
   * Get source agent by ID.
   *
   * @param {string} id
   * @returns {SourceAgent | undefined}
   */
  getSourceAgent(id: string): SourceAgent | undefined {
    return this.sources.find(source => source.id === id);
  }

  /**
   * Fetch all source agents from API.
   */
   loadSourceAgents() {
    this.http.get<SourceAgent>(`${environment.apiUrl}/agents/open-weather-map/metadata`)
    //.pipe(map((res: Array<SourceAgent>) => res))
    .pipe(map((res: SourceAgent) => res))
    .subscribe(result => {
      this.sources = [result];

      console.log('source agents', this.sources);
    });
  }

  /**
   * Handle source change.
   *
   * @param {string} val
   */
  onSourceChange(val: string) {
    const agent = this.getSourceAgent(val);

    if (agent) {
      this.currentRule.source.id = val;
      this.currentRule.source.name = agent.name;
      this.sourceDataPoints = agent.dataPoints;
      this.currentRule.source.params = agent.params;

      store.sourceSet.next(true);
    }
  }

  /**
   * Handle dataPoint change.
   *
   * @param {DataPoint} val
   */
  onDataPointChange(val: DataPoint) {
    this.currentRule.condition.dataPoint = val.dataPoint;
    this.currentRule.condition.name = val.name;
    this.currentRule.condition.dataType = val.dataType;
  }

  /**
   * Save rule.
   */
  saveRule() {
    console.log('Saving rule...', this.currentRule);

    this.http.post(`${environment.apiUrl}/rules`, this.currentRule)
    .subscribe(result => {
      console.log('addRule', result);

      // Inform the rules component about the new rule
      store.ruleAdded.next(true);
    });

    // Clear rule
    this.currentRule = new Rule();
  }
}