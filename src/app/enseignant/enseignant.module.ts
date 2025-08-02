import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EnseignantRoutingModule } from './enseignant.routing.module';

import { EnseignantDashboardComponent } from './enseignant-dashboard/enseignant-dashboard.component';
import { AgGridModule } from 'ag-grid-angular';
import { TableComponent } from './enseignant-components/table/table.component';
import { DetailProjetComponent } from './enseignant-components/detail-projet/detail-projet.component';
import { AgTabComponent } from './enseignant-components/ag-tab/ag-tab.component';
import { EnseignantComponent } from './enseignant-components/enseignant/enseignant.component';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';



@NgModule({
  declarations: [
    EnseignantDashboardComponent,
    TableComponent,
    DetailProjetComponent,
    AgTabComponent,
    EnseignantComponent,
  ],
  imports: [
    AgGridModule,
    CommonModule,
    EnseignantRoutingModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,

  ]
})
export class EnseignantModule {

}
