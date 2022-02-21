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
import { Rule } from 'src/app/models/rule.model';

import { store } from 'src/app/store';
import { NgForm } from '@angular/forms';
import { SourceAgentParameter } from 'src/app/interfaces/source-agent-parameter';

import { get as getScript } from 'scriptjs';
declare const google: any;

@Component({
  selector: 'app-add-rule',
  templateUrl: './add-rule.component.html',
  styleUrls: ['./add-rule.component.scss'],
})

/**
 * Add rule component.
 */
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

  geoSearchHtmlClassName = 'geosearch';
  googleMapsKey = '';

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
  constructor(private http: HttpClient) {
    // Watch save requirements
    store.saveRequirements.subscribe((val) => {
      this.saveEnabled = Object.values(store.saveRequirements.value).every(
        (x) => x
      );
    });

    // Watch targets update
    store.targets.subscribe((targets) => {
      this.currentRule.targets = targets;
    });

    this.loadSourceAgents();

    // TODO: debug
    /* this.currentRule.name = 'test';
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

  // eslint-disable-next-line require-jsdoc
  ngAfterViewInit(): void {}

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
   * Fetch all source agents from API.
   */
  loadSourceAgents() {
    this.http
      .get<Array<SourceAgent>>(`${environment.apiUrl}/agents/metadata`)
      .pipe(map((res: Array<SourceAgent>) => res))
      .subscribe((result) => {
        this.sources = result.filter((agent) => agent.type === 'source-agent');
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

    this.initGeoSearch();
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
  }

  /**
   * Save rule.
   */
  saveRule() {
    // TODO: remove this!
    this.currentRule.owner = 'YrqYQc15jFYutbMdZNss';

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
    this.nameForm.resetForm();
  }

  /**
   * Get Google Maps API key.
   *
   * @returns {Promise<string>}
   */
  private async getApiKey(): Promise<string> {
    if (!this.googleMapsKey) {
      const url = environment.apiUrl + '/get-api-key/GOOGLE_MAPS_API_KEY';
      const result = await this.http.get<{ key: string }>(url).toPromise();
      if (result) {
        this.googleMapsKey = result.key;
      }
    }

    return this.googleMapsKey;
  }

  /**
   * Init geo search.
   */
  private async initGeoSearch() {
    const url =
      environment.GOOGLE_MAPS_AUTOCOMPLETE_URL + (await this.getApiKey());
    getScript(url, () => {
      this.setGeoListener(this.geoSearchHtmlClassName);
    });
  }

  /**
   * Set geo listener.
   *
   * @param {string} className
   */
  private setGeoListener(className: string) {
    const inputs = document.getElementsByClassName(className);
    if (inputs.length) {
      const currentInput = inputs[0] as HTMLInputElement;
      const autocomplete = new google.maps.places.Autocomplete(currentInput);

      autocomplete.setFields(['address_components', 'name']);

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        const currentAddress = this.getFormatedAddress(place);

        currentInput.value = currentAddress;
        const currentParamName = currentInput.getAttribute('ng-reflect-name');
        for (const j in this.currentRule.source.params) {
          if (currentParamName == this.currentRule.source.params[j].dataPoint) {
            this.currentRule.source.params[j].value = currentAddress;
            break;
          }
        }
      });
    }
  }

  /**
   * Get formatted address.
   *
   * @param {any} place
   * @returns {string}
   */
  private getFormatedAddress(place: any): string {
    let locality = '';
    let country = '';

    for (const component of place.address_components) {
      switch (component.types[0]) {
        case 'locality':
          locality = component.long_name;
          break;

        case 'country':
          country = component.long_name;
          break;
      }
    }

    return (locality ? `${locality}, ` : '') + country;
  }
}
