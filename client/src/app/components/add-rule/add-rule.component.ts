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

import { StepperOrientation } from '@angular/cdk/stepper';
import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MissingSettingsDialogComponent } from 'src/app/components/missing-settings-dialog/missing-settings-dialog.component';
import { AgentSettingMetadata, ModelSpec } from 'src/app/interfaces/common';
import { Comparator, Rule, RuleTargetAction } from 'src/app/interfaces/rule';
import { SourceAgentMetadata } from 'src/app/interfaces/source';
import { TargetAgentMetadata } from 'src/app/interfaces/target';
import { AgentsService } from 'src/app/services/agents.service';
import { RulesService } from 'src/app/services/rules.service';
import { UserService } from 'src/app/services/user.service';
import { store } from 'src/app/store';

const EMPTY_SOURCE_AGENT_DESCRIPTION: SourceAgentMetadata = {
  dataPoints: [],
  id: '',
  name: '',
  parameters: [],
  type: 'source',
};

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
  saveEnabled: boolean = false;
  lockEquals: boolean = false;

  executionIntervals: number[] = [30, 60, 240, 480, 720, 1440];
  sources: SourceAgentMetadata[] = [];
  comparators: any[] = [
    { key: 'gt', value: 'greater than' },
    { key: 'lt', value: 'less than' },
    { key: 'eq', value: 'equals' },
  ];
  targets: TargetAgentMetadata[] = [];

  currentRuleName: string = '';
  currentRuleSourceAgentId: string = '';
  currentRuleSourceAgentDescription = EMPTY_SOURCE_AGENT_DESCRIPTION;
  currentExecutionInterval = 30;
  currentRuleConditionDataPoint: string = '';
  currentRuleConditionDataType: string;
  currentRuleConditionValues?: string[];
  currentRuleConditionComparator: Comparator;
  currentRuleConditionCompareValue: string | boolean | number;
  currentTargetAgentId: string;
  currentRuleTargets: RuleTargetAction[];
  currentRuleSourceParameters: Record<string, string> = {};

  @ViewChild('name', { static: true }) nameForm: NgForm;
  @ViewChild('source', { static: true }) sourceForm: NgForm;
  @ViewChild('condition', { static: true }) conditionForm: NgForm;
  @ViewChild('executionInterval', { static: true })
  executionIntervalForm: NgForm;

  /**
   * Constructor
   * @param {UserService} userService - injected
   * @param {Router} router - injected
   * @param {MatDialog} dialog
   */
  constructor(
    private userService: UserService,
    private readonly rulesService: RulesService,
    private readonly agentsService: AgentsService,
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
      this.currentRuleTargets = targets;
    });
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

    this.agentsService.fetchAgentsMetadata();
    store.agents.subscribe((agentsDescription) => {
      this.sources = agentsDescription.source;
      this.targets = agentsDescription.target;
    });
  }

  /**
   * Get source agent by ID.
   *
   * @param {string} id
   * @returns {SourceAgentDescription | undefined}
   */
  getSourceAgent(id: string): SourceAgentMetadata | undefined {
    return this.sources.find((source) => source.id === id);
  }

  /**
   * Get target agent by ID.
   *
   * @param {string} id
   * @returns {TargetAgent | undefined}
   */
  getTargetAgent(id: string): TargetAgentMetadata | undefined {
    return this.targets.find((agent) => agent.id === id);
  }

  /**
   * Handle source change.
   *
   * @param {string} sourceAgentId
   */
  onSourceChange(sourceAgentId: string) {
    const agent = this.getSourceAgent(sourceAgentId);

    if (agent) {
      this.currentRuleSourceAgentDescription = agent;
      store.sourceSet.next(true);

      this.checkUserSettingsForAgent(agent.settings);
    }
  }

  /**
   * Handle source change.
   *
   * @param {string} val
   */
  onTargetChange(val: string) {
    const agent = this.getTargetAgent(val);

    if (agent && agent.settings) {
      this.checkUserSettingsForAgent(agent.settings);
    }
  }

  /**
   * Handle dataPoint change.
   *
   * @param {DataPoint} val
   */
  onDataPointChange(val: string) {
    const dataPoint = this.currentRuleSourceAgentDescription!.dataPoints.find(
      (dataPoint) => dataPoint.key === val
    );
    if (dataPoint) {
      this.currentRuleConditionDataPoint = val;
      this.currentRuleConditionComparator = 'eq';
      this.currentRuleConditionDataType = dataPoint.type;
      this.currentRuleConditionValues = undefined;

      if (dataPoint.type === 'boolean') {
        this.lockEquals = true;
        this.currentRuleConditionCompareValue = true;
      } else if (dataPoint.values) {
        this.lockEquals = true;
        this.currentRuleConditionCompareValue = dataPoint.values[0];
        this.currentRuleConditionValues = dataPoint.values;
      } else if (dataPoint.type === 'string') {
        this.lockEquals = true;
        this.currentRuleConditionCompareValue = '';
      } else {
        this.lockEquals = false;
        this.currentRuleConditionCompareValue = '';
      }
    }
  }

  /**
   * Resets this form to its initial state
   */
  reset() {
    this.currentRuleName = '';
    this.currentRuleSourceAgentId = '';
    this.currentRuleSourceAgentDescription = EMPTY_SOURCE_AGENT_DESCRIPTION;
    this.currentExecutionInterval = 30;
    this.currentRuleConditionDataPoint = '';
    this.currentRuleConditionDataType = '';
    this.currentRuleConditionValues = undefined;
    this.currentRuleConditionComparator = 'eq';
    this.currentRuleConditionCompareValue = '';
    this.currentTargetAgentId = '';
    this.currentRuleTargets = [];
    this.currentRuleSourceParameters = {};

    // Reset forms
    this.conditionForm.resetForm();
    this.sourceForm.resetForm();
    this.executionIntervalForm.resetForm();
  }

  /**
   * Save rule.
   */
  saveRule() {
    const rule: ModelSpec<Rule> = {
      ownerId: this.userService.loggedInUser.id,
      name: this.currentRuleName,
      executionInterval: this.currentExecutionInterval,
      source: {
        agentId: this.currentRuleSourceAgentId,
        parameters: this.currentRuleSourceParameters,
      },
      condition: {
        dataPoint: this.currentRuleConditionDataPoint,
        comparator: this.currentRuleConditionComparator,
        compareValue: this.currentRuleConditionCompareValue,
      },
      targets: this.currentRuleTargets,
    };
    this.rulesService.addRule(rule);

    this.reset();

    this.router.navigate(['/rules/list']);
  }

  /**
   *  Checks missing settings required by an agent.
   *  @param {AgentSettingMetadata[]} settings? the agent's required settings
   */
  private checkUserSettingsForAgent(settings?: AgentSettingMetadata[]) {
    const missingSettings = settings?.filter(
      (setting) => !this.userService.getSetting(setting.key)
    );

    if (missingSettings && missingSettings.length) {
      this.dialog.open(MissingSettingsDialogComponent, {
        data: missingSettings,
      });
    }
  }
}
