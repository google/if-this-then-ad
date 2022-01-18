import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TriggersComponent } from './triggers/triggers.component';

const routes: Routes = [
  {
    path: '',
    component: TriggersComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
