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
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';
import { DataPoint } from 'src/app/interfaces/datapoint';
import { Rule } from 'src/app/models/rule.model';

import { store } from 'src/app/store';
import { NgForm } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { SourceAgent } from 'src/app/interfaces/source-agent';
import { TargetAgent } from 'src/app/interfaces/target-agent';
import { SourceAgentParameter } from 'src/app/interfaces/source-agent-parameter';
import { SourceAgentSettingsParam } from 'src/app/interfaces/source-agent-settings-parameter';
import { StepperOrientation } from '@angular/cdk/stepper';
import { UserService } from 'src/app/services/user.service';
import { MissingSettingsDialogComponent } from 'src/app/missing-settings-dialog/missing-settings-dialog.component';

@Component({
  selector: 'app-add-rule',
  templateUrl: './add-rule.component.html',
  styleUrls: ['./add-rule.component.scss'],
})

/**
 * Add rule component.
 */
export class AddRuleComponent implements OnInit {
  isLinear = false;
  stepperOrientation: StepperOrientation = 'horizontal'; // vertical
  sources: SourceAgent[] = [];
  targets: TargetAgent[] = [];
  sourceDataPoints: DataPoint[] = [];
  sourceParams: SourceAgentParameter[] = [];
  currentRule: Rule = new Rule();
  saveEnabled: boolean = false;
  comparatorMapping: any[] = [
    { key: 'gt', value: 'greater than' },
    { key: 'lt', value: 'less than' },
    { key: 'eq', value: 'equals' },
  ];

  executionIntervals: number[] = [30, 60, 240, 480, 720, 1440];
  dataPointListValues?: string[] = [];
  lockEquals: boolean = false;
  targetAgent: string;

  @ViewChild('name', { static: true }) nameForm: NgForm;
  @ViewChild('source', { static: true }) sourceForm: NgForm;
  @ViewChild('condition', { static: true }) conditionForm: NgForm;
  @ViewChild('executionInterval', { static: true })
  executionIntervalForm: NgForm;

  /**
   * Constructor.
   *
   * @param {HttpClient} http
   */
  constructor(
    private http: HttpClient,
    private userService: UserService,
    private router: Router,
    public dialog: MatDialog
  ) {
    // Watch save requirements
    store.saveRequirements.subscribe((_) => {
      this.saveEnabled = Object.values(store.saveRequirements.value).every(
        (x) => x
      );
    });

    // Watch targets update
    store.targets.subscribe((targets) => {
      this.currentRule.targets = targets;
    });

    this.loadAgents();
  }

  // eslint-disable-next-line require-jsdoc
  ngOnInit(): void {
    // Watch name form changes
    this.nameForm.form.valueChanges.subscribe((val) => {
      const valid = !!this.nameForm.valid;

      store.saveRequirements.next({
        ...store.saveRequirements.value,
        ...{ name: valid },
      });
    });

    // Watch source form changes
    this.sourceForm.form.valueChanges.subscribe((val) => {
      const valid = !!this.sourceForm.valid;

      store.saveRequirements.next({
        ...store.saveRequirements.value,
        ...{ source: valid },
      });
    });

    // Watch executionInterval form changes
    this.executionIntervalForm.form.valueChanges.subscribe((val) => {
      const valid = !!this.executionIntervalForm.valid;

      store.saveRequirements.next({
        ...store.saveRequirements.value,
        ...{ executionInterval: valid },
      });
    });

    // Watch condition form changes
    this.conditionForm.form.valueChanges.subscribe((val) => {
      const valid = !!this.conditionForm.valid;

      store.saveRequirements.next({
        ...store.saveRequirements.value,
        ...{ condition: valid },
      });
    });
  }

  /**
   * Get source agent by ID.
   *
   * @param {string} id
   * @returns {SourceAgent | undefined}
   */
  getSourceAgent(id: string): SourceAgent | undefined {
    return this.sources.find((source) => source.id === id);
  }

  /**
   * Get target agent by ID.
   *
   * @param {string} id
   * @returns {TargetAgent | undefined}
   */
  getTargetAgent(id: string): TargetAgent | undefined {
    return this.targets.find((agent) => agent.id === id);
  }

  /**
   * Fetch all source agents from API.
   */
  loadAgents() {
    this.http
      .get<Array<SourceAgent | TargetAgent>>(
        `${environment.apiUrl}/agents/metadata`
      )
      .pipe(map((res: Array<SourceAgent | TargetAgent>) => res))
      .subscribe((result) => {
        this.sources = result.filter(
          (agent) => agent.type === 'source-agent'
        ) as SourceAgent[];
        this.targets = result.filter(
          (agent) => agent.type === 'target-agent'
        ) as TargetAgent[];
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

      this.checkUserSettingsForAgent(agent.settings.params);
    }
  }

  /**
   * Handle source change.
   *
   * @param {string} val
   */
  onTargetChange(val: string) {
    const agent = this.getTargetAgent(val);

    if (agent && agent.params) {
      this.checkUserSettingsForAgent(agent.params);
    }
  }

  /**
   * Handle dataPoint change.
   *
   * @param {DataPoint} val
   */
  onDataPointChange(val: DataPoint) {
    // Store data point
    this.currentRule.condition.dataPoint = val.dataPoint;
    this.currentRule.condition.name = val.name;
    this.currentRule.condition.dataType = val.dataType;
    // Reset comparator
    this.currentRule.condition.comparator = undefined;

    if (val.dataType === 'boolean' || val.dataType === 'enum') {
      this.currentRule.condition.comparator = 'eq';
      this.lockEquals = true;
    } else {
      this.lockEquals = false;
    }
    this.dataPointListValues = val.enum;
  }

  /**
   * Save rule.
   */
  saveRule() {
    // Add owner
    this.currentRule.owner = this.userService.user.id;

    // Send rule to API
    this.http
      .post(`${environment.apiUrl}/rules`, this.currentRule)
      .subscribe((result) => {
        // Inform the rules component about the new rule
        store.ruleAdded.next(true);
      });

    // Reset rule
    this.currentRule = new Rule();

    // Reset forms
    this.conditionForm.resetForm();
    this.sourceForm.resetForm();
    this.executionIntervalForm.resetForm();

    this.router.navigate(['/rules/list']);
  }

  /**
   *  Checks user Settings.
   *
   *  @param {Array<SourceAgentSettingsParam>} params
   */
  private checkUserSettingsForAgent(params: Array<SourceAgentSettingsParam>) {
    const missingSettings: Array<SourceAgentSettingsParam> = params.filter(
      (param) => !this.userService.getSetting(param.settingName)
    );

    if (missingSettings.length) {
      this.showMissingSettingsDialog(missingSettings);
    }
  }

  /**
   * Displays settings dialog.
   *
   * @param {Array<SourceAgentSettingsParam>} missingSettings
   */
  private showMissingSettingsDialog(
    missingSettings: Array<SourceAgentSettingsParam>
  ) {
    this.dialog.open(MissingSettingsDialogComponent, { data: missingSettings });
  }
}
