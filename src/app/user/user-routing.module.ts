import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';
import { ProjectDetailComponent } from './user-components/project-detail/project-detail.component';
import { FormsModule } from '@angular/forms';


const routes: Routes = [
  //{path:"",pathMatch:'full'},
  {path: "dashboard", component: UserDashboardComponent},
  {path: "dashboard/project-detail/:id", component:ProjectDetailComponent}

  ];

@NgModule({
  imports: [RouterModule.forChild(routes), FormsModule],
  exports: [RouterModule, FormsModule]
})
export class UserRoutingModule { }
