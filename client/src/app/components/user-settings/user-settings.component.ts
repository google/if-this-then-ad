import { Component, ViewChild, } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatAccordion } from '@angular/material/expansion';
import { Location } from '@angular/common';

import { UserSetting } from '../../interfaces/user-settings';

@Component({
  selector: 'app-user-settings',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.scss']
})
export class UserSettingsComponent {
  @ViewChild(MatAccordion) accordion: MatAccordion;

  private requiredSettings: Array<string> = [];
  public settings: Array<UserSetting> = [
    {
      title: 'OpenWeatherMap API',
      description: 'Needed to fetch the weather',
      field: 'Api Key',
      settingName: 'OPENWEATHER_API_KEY',
    },
    {
      title: 'Ambee API',
      description: 'Needed to fetch the pollen and air quality infos',
      field: 'Api Key',
      settingName: 'AMBEE_API_KEY',
    },
    {
      title: 'Google Maps API',
      description: 'Needed to do the autocompletion of the city name',
      field: 'Api Key',
      settingName: 'GOOGLEMAPS_API_KEY',
    },
  ];

  constructor(
    private route: ActivatedRoute,
    private location: Location
  ) {
    this.route.fragment.subscribe(f => {
      this.requiredSettings = (f as string).split(',');
      this.settings = this.settings.map(v => {
        return { 
          ...v,
          expanded: this.requiredSettings.includes(v.settingName)
        } 
      });
    });
  }

  back() {
    this.location.back();
  }
}