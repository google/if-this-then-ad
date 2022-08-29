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

import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AgentSettingMetadata } from '../../interfaces/common';

@Component({
  selector: 'missing-settings-dialog',
  templateUrl: './missing-settings-dialog.component.html',
  styleUrls: ['./missing-settings-dialog.component.scss'],
})

/**
 *  User Settings Dialog Component.
 */
export class MissingSettingsDialogComponent {
  /**
   * Component constructor.
   *
   * @param {AgentSettingMetadata[]} settings
   * @param {Router} router
   */
  constructor(
    @Inject(MAT_DIALOG_DATA) public settings: AgentSettingMetadata[],
    private router: Router
  ) {}

  /**
   * Navigate to user settings.
   */
  goToUserSettings() {
    const fragment = this.settings.map((s) => s.name).join(',');
    this.router.navigate(['/settings'], { fragment });
  }
}
