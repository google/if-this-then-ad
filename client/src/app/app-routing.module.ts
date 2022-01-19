import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
<<<<<<< HEAD
import { TriggersComponent } from './triggers/triggers.component';
=======
import { SourceSelectorComponent } from './source-selector/source-selector.component';
import { TriggerSelectorComponent } from './trigger-selector/trigger-selector.component';
>>>>>>> main

const routes: Routes = [
  {
    path: '',
<<<<<<< HEAD
    component: TriggersComponent,
=======
    component: SourceSelectorComponent,
  },
  {
    path: 'trigger',
    component: TriggerSelectorComponent,
>>>>>>> main
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
