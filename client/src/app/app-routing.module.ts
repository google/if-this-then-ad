import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TriggersComponent } from './triggers/triggers.component';
import { SourceSelectorComponent } from './source-selector/source-selector.component';
import { TriggerSelectorComponent } from './trigger-selector/trigger-selector.component';

const routes: Routes = [
  {
    path: '',
    component: TriggersComponent,
  },
  {
    path: 'trigger',
    component: TriggerSelectorComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
