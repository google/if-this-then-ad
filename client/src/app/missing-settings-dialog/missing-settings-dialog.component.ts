import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { SourceAgentSettingsParam } from '../interfaces/source-agent-settings-parameter';

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
   * @param {Array<SourceAgentSettingsParam>} settings
   * @param {Router} router
   */
  constructor(
    @Inject(MAT_DIALOG_DATA) public settings: Array<SourceAgentSettingsParam>,
    private router: Router
  ) {}

  /**
   * Navigate to user settings.
   */
  goToUserSettings() {
    const fragment = this.settings.map((s) => s.settingName).join(',');
    this.router.navigate(['/settings'], { fragment });
  }
}
