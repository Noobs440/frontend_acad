import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminDashboardComponent } from '../admin/admin-dashboard/admin-dashboard.component';
import { DetailProjectComponent } from './admin-components/detail-project/detail-project.component';

const routes: Routes = [
  {path:"",redirectTo:"dashboard",pathMatch:'full'},{ path: "dashboard", component: AdminDashboardComponent },
  { path: 'dashboard/project-detail/:id', component: DetailProjectComponent },];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
