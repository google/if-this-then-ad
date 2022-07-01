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
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTreeModule } from '@angular/material/tree';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatRadioModule } from '@angular/material/radio';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';

import {
  AddRuleComponent,
  MissingSettingsDialogComponent,
} from './components/add-rule/add-rule.component';
import { RulesComponent } from './components/rules/rules.component';
import { RulesStatusComponent } from './components/rules-status/rules.status.component';
import { TargetSelectorComponent } from './components/target-selector/target-selector.component';
import { HeaderComponent } from './components/header/header.component';
import { LoginComponent } from './components/login/login.component';
import { LoggedInComponent } from './components/logged-in/logged-in.component';
import { httpInterceptorProviders } from './interceptors';
import { LocationAutoComplete } from './components/location-auto-complete/location-auto-complete.component';
import { UserSettingsComponent } from './components/user-settings/user-settings.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { GoogleAdsSelectorComponent } from './components/googleads-selector/googleads-selector.component';
import { DashComponent } from './components/dash/dash.component';
import { StringReplacePipe } from './pipes/string-replace.pipe';
import { IntervalFormatPipe } from './interval-format.pipe';

@NgModule({
  declarations: [
    AppComponent,
    AddRuleComponent,
    RulesComponent,
    RulesStatusComponent,
    TargetSelectorComponent,
    HeaderComponent,
    LoginComponent,
    LoggedInComponent,
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
