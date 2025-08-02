import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';

import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { AgGridModule } from 'ag-grid-angular';
import { TableComponent } from './admin-components/table/table.component';
import { DetailProjectComponent } from './admin-components/detail-project/detail-project.component';
import { AgTabComponent } from './admin-components/ag-tab/ag-tab.component';
import { AdminComponent } from './admin-components/admin/admin.component';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { HelpComponentAdmin } from './admin-components/help/help.component';



@NgModule({
  declarations: [
    AdminDashboardComponent,
    TableComponent,
    DetailProjectComponent,
    AgTabComponent,
    AdminComponent,
    HelpComponentAdmin,
  ],
  imports: [
    AgGridModule,
    CommonModule,
    AdminRoutingModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,

  ]
})
export class AdminModule {

}
