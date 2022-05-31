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
import {
  faHouse,
  faList,
  faSquarePlus,
  faGear,
  faMessage
} from '@fortawesome/free-solid-svg-icons';

import { store } from 'src/app/store';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
// eslint-disable-next-line require-jsdoc
export class AppComponent {
  faHouse = faHouse;
  faList = faList;
  faSquarePlus = faSquarePlus;
  faGear = faGear;
  faMessage = faMessage;
  title = 'IFTTA';

  @ViewChild('sidenav') sidenav: any;

  /**
   * Constructor.
   *
   * @param {AuthService} authService
   * @param {Router} router
   */
  constructor(public authService: AuthService) {
    store.sidenav.subscribe((v) => {
      if (authService.isLoggedIn) {
        this.sidenav.toggle();
      }
    });
  }
}
