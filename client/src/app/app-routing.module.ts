import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddRuleComponent } from './add-rule/add-rule.component';
import { SourceSelectorComponent } from './source-selector/source-selector.component';
import { TriggerSelectorComponent } from './trigger-selector/trigger-selector.component';

const routes: Routes = [
  {
    path: '',
    component: AddRuleComponent,
  },
  {
    path: 'source',
    component: SourceSelectorComponent,
  },
  {
    path: 'source/trigger',
    component: TriggerSelectorComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
