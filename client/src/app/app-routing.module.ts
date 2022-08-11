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

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddRuleComponent } from 'src/app/components/add-rule/add-rule.component';
import { LoginComponent } from 'src/app/components/login/login.component';

import { AuthGuard } from './services/auth.guard';
import { UserSettingsComponent } from './components/user-settings/user-settings.component';
import { RulesComponent } from './components/rules/rules.component';
import { RulesStatusComponent } from './components/rules-status/rules.status.component';

const routes: Routes = [
  {
    path: 'rules/new',
    component: AddRuleComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'rules/list',
    component: RulesComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'rules/status',
    component: RulesStatusComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'settings',
    component: UserSettingsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: '',
    redirectTo: '/rules/list',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
// eslint-disable-next-line require-jsdoc
export class AppRoutingModule {}
