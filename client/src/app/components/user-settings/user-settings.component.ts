import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatAccordion } from '@angular/material/expansion';
import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

import { User, UserSettingKeyValue } from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/auth.service';

import { of } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';

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
  styleUrls: ['./user-settings.component.scss']
})
export class UserSettingsComponent {
  user: User|null;

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

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private http: HttpClient,
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private message: MatSnackBar
  ) {
    this.route.fragment.subscribe(f => {
      if (f) {
        this.requiredSettings = (f as string).split(',');
      }

    });

    this.settings = this.settings.map(v => {
      return { 
        ...v,
        expanded: this.requiredSettings.includes(v.settingName),
      } 
    });

    const group: {[key: string]: Array<any>} = {};
    for (let s of this.settings) {
      group[s.settingName] = [];
    }

    this.userSettings = this.formBuilder.group(group);
    if (this.authService?.currentUser?.userSettings) {
      const filteredUserSettings: UserSettingKeyValue = {};
      for (let s in this.authService?.currentUser?.userSettings) {
        if (Object.keys(group).includes(s)) {
          filteredUserSettings[s] = this.authService?.currentUser?.userSettings[s];
        }
      }

      this.userSettings.setValue(filteredUserSettings);
    }
  }

  ngOnInit(): void {
    this.userSettings.valueChanges
      .pipe(
        debounceTime(1000),
        switchMap((value) => of(value))
      )
      .subscribe((value: UserSettingKeyValue) => {
        this.showSavedStatus('Saving...', true)
        this.save(value);
      });
  }

  back() {
    this.location.back();
  }

  save(value: UserSettingKeyValue) {
    this.http
      .post(
        `${environment.apiUrl}/accounts/${this.authService.currentUser?.id}/settings`,
        value
      )
      .subscribe({
        next: _ => {
          this.authService.setUserSettings(value);
          this.showSavedStatus('Saved');
        },
        error: _ => {
          console.log("Error saving user settings", _);
          this.showSavedStatus('Error');
        }
      });
  }

  showSavedStatus(message: string, saving: boolean = false) {
      this.savingUserSettings = saving;
      this.message.open(message, 'Dismiss', {duration: 5000});
  }
}