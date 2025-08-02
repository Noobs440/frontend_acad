import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EnseignantDashboardComponent } from './enseignant-dashboard/enseignant-dashboard.component';
import { DetailProjetComponent } from './enseignant-components/detail-projet/detail-projet.component';
import {  EnseignantComponent } from './enseignant-components/enseignant/enseignant.component';

const routes: Routes = [
  { 
    path: '', 
    component: EnseignantComponent,  // Ceci est le layout parent
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: EnseignantDashboardComponent },
      { path: 'dashboard/projet-detail/:id', component: DetailProjetComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EnseignantRoutingModule { }