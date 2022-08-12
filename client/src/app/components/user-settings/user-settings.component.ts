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

import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatAccordion } from '@angular/material/expansion';
import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

import { User, UserSettingKeyValue } from 'src/app/models/user.model';

import { of } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';
import { UserService } from 'src/app/services/user.service';

interface UserSetting {
  title: string;
  description: string;
  field: string;
  settingName: string;
  expanded?: boolean;
  value?: string;
}

@Component({
  selector: 'app-user-settings',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.scss'],
})

/**
 * User Settings Component.
 */
export class UserSettingsComponent {
  user: User | null;

  @ViewChild(MatAccordion) accordion: MatAccordion;

  public savingUserSettings = false;
  public userSettings: FormGroup;
  private requiredSettings: Array<string> = [];
  public settings: Array<UserSetting> = [
    {
      title: 'OpenWeatherMap API',
      description: 'Required to fetch the weather',
      field: 'Api Key',
      settingName: 'OPENWEATHER_API_KEY',
    },
    {
      title: 'Ambee API',
      description: 'Required to fetch the pollen and air quality infos',
      field: 'Api Key',
      settingName: 'AMBEE_API_KEY',
    },
    {
      title: 'Google Maps API',
      description: 'Required to do autocompletion of the city name',
      field: 'Api Key',
      settingName: 'GOOGLEMAPS_API_KEY',
    },
    {
      title: 'Google Ads Developer Token',
      description: 'Required to access Google Ads API',
      field: 'Developer Token',
      settingName: 'GOOGLEADS_DEV_TOKEN',
    },
    {
      title: 'Google Ads Manager Account ID',
      description: 'Specifies the manager account to use',
      field: 'ID without dashes',
      settingName: 'GOOGLEADS_MANAGER_ACCOUNT_ID',
    },
    {
      title: 'Google Ads Account ID',
      description: 'Specifies the account to modify',
      field: 'ID without dashes',
      settingName: 'GOOGLEADS_ACCOUNT_ID',
    },
  ];

  /**
   * Constructor.
   *
   * @param {ActivatedRoute} route
   * @param {Location} location
   * @param {HttpClient} http
   * @param {UserService} userService
   * @param {FormBuilder} formBuilder
   * @param {MatSnackBar} message
   */
  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private http: HttpClient,
    private userService: UserService,
    private formBuilder: FormBuilder,
    private message: MatSnackBar
  ) {
    this.route.fragment.subscribe((f) => {
      if (f) {
        this.requiredSettings = (f as string).split(',');
      }
    });

    this.settings = this.settings.map((v) => {
      return {
        ...v,
        expanded: this.requiredSettings.includes(v.settingName),
      };
    });

    const group: { [key: string]: Array<any> } = {};
    for (const setting of this.settings) {
      group[setting.settingName] = [];
    }

    this.userSettings = this.formBuilder.group(group);
    if (this.userService.user?.userSettings) {
      const filteredUserSettings: UserSettingKeyValue = {};
      for (const setting of this.settings) {
        filteredUserSettings[setting.settingName] =
          this.userService.user?.userSettings[setting.settingName] || '';
      }

      this.userSettings.setValue(filteredUserSettings);
    }
  }

  /**
   * Init.
   */
  ngOnInit(): void {
    this.userSettings.valueChanges
      .pipe(
        debounceTime(1000),
        switchMap((settings) => of(settings))
      )
      .subscribe((settings: UserSettingKeyValue) => {
        this.showSavedStatus('Saving...', true);
        this.save(settings);
      });
  }

  /**
   * Move back in browser history.
   */
  back() {
    this.location.back();
  }

  /**
   * Save user settings.
   *
   * @param {UserSettingKeyValue} settings
   */
  save(settings: UserSettingKeyValue) {
    this.http
      .post(
        `${environment.apiUrl}/accounts/${this.userService.user.id}/settings`,
        settings
      )
      .subscribe({
        next: (_) => {
          this.userService.setSettings(settings);
          this.showSavedStatus('Saved');
        },
        error: (_) => {
          console.log('Error saving user settings', _);
          this.showSavedStatus('Error');
        },
      });
  }

  /**
   * Show saved status.
   *
   * @param {string} message
   * @param {boolean} saving
   */
  showSavedStatus(message: string, saving: boolean = false) {
    this.savingUserSettings = saving;
    this.message.open(message, 'Dismiss', { duration: 5000 });
  }
}
