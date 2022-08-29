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

import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTreeModule } from '@angular/material/tree';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AddRuleComponent } from './components/add-rule/add-rule.component';
import { DashComponent } from './components/dash/dash.component';
import { GoogleAdsSelectorComponent } from './components/googleads-selector/googleads-selector.component';
import { HeaderComponent } from './components/header/header.component';
import { LocationAutoComplete } from './components/location-auto-complete/location-auto-complete.component';
import { LoginComponent } from './components/login/login.component';
import { MissingSettingsDialogComponent } from './components/missing-settings-dialog/missing-settings-dialog.component';
import { RulesStatusComponent } from './components/rules-status/rules.status.component';
import { RulesComponent } from './components/rules/rules.component';
import { TargetSelectorComponent } from './components/target-selector/target-selector.component';
import { UserSettingsComponent } from './components/user-settings/user-settings.component';
import { httpInterceptorProviders } from './interceptors';
import { IntervalFormatPipe } from './pipes/interval-format/interval-format.pipe';
import { StringReplacePipe } from './pipes/string-replace/string-replace.pipe';

@NgModule({
  declarations: [
    AppComponent,
    AddRuleComponent,
    RulesComponent,
    RulesStatusComponent,
    TargetSelectorComponent,
    HeaderComponent,
    LoginComponent,
    LocationAutoComplete,
    UserSettingsComponent,
    MissingSettingsDialogComponent,
    GoogleAdsSelectorComponent,
    DashComponent,
    StringReplacePipe,
    IntervalFormatPipe,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatPaginatorModule,
    MatTreeModule,
    MatIconModule,
    MatProgressBarModule,
    MatToolbarModule,
    MatMenuModule,
    MatExpansionModule,
    MatDialogModule,
    MatSnackBarModule,
    HttpClientModule,
    MatStepperModule,
    MatSidenavModule,
    MatListModule,
    MatRadioModule,
    MatCardModule,
    MatTooltipModule,
    FontAwesomeModule,
  ],
  providers: [httpInterceptorProviders],
  bootstrap: [AppComponent],
})
// eslint-disable-next-line require-jsdoc
export class AppModule {}
