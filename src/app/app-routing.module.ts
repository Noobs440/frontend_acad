import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home-components/home/home.component';
import { ContactComponent } from './home-components/contact/contact.component';
import { PopCategoryComponent } from './home-components/pop-category/pop-category.component';
import { LevelsListingComponent } from './home-components/levels-listing/levels-listing.component';
import { ProjectsComponent } from './home-components/projects/projects.component';
import { TeamComponent } from './home-components/team/team.component';
import { ProjectDetailComponent } from './home-components/project-detail/project-detail.component';
import { DefaultComponent } from './layouts/default/default.component';
import { AdminComponent } from './admin/admin-components/admin/admin.component';
import { UserComponent } from './user/user-components/user/user.component';
import { ProfileComponent } from './components/profile/profile.component';
import { EditNameComponent } from './components/profile/edit-name.component';
import { EditEmailComponent } from './components/profile/edit-email.component';
import { EditPasswordComponent } from './components/profile/edit-password.component';
import { EditPhotoComponent } from './components/profile/edit-photo.component';
import { EnseignantComponent } from './enseignant/enseignant-components/enseignant/enseignant.component';
import { AdminsysModule } from './adminsys/adminsys.module';
import { AuthGuard } from './guards/auth.gard';
import { AdminGuard } from './guards/admin.guard';
import { UserGuard } from './guards/user.guard';
import { AdminsysGuard } from './guards/adminsys.guard';
import { HelpComponent } from './user/user-components/help/help.component';
import {AdminsysComponent} from './adminsys/adminsys.component';
const routes: Routes = [

  

  {
    path: 'adminsys',
    component: AdminsysComponent,
    canActivate: [AdminsysGuard, AuthGuard],
    children: [
      { path: '', loadChildren: () => import('./adminsys/adminsys.module').then(m => m.AdminsysModule) }
    ]
  },
  
  {
    path: 'admin',
    component: AdminComponent,
    children: [
      { path: '', loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule) },
    ],
    canActivate: [AdminGuard,AuthGuard]
  },

{
  path: 'enseignant',
  loadChildren: () => import('./enseignant/enseignant.module').then(m => m.EnseignantModule)
},

   { path: 'helpUser', component: HelpComponent },
  { path: 'helpAdmin', component: HelpComponent},
  {
    path: 'user',
    component: UserComponent,
    children: [
      { path: '', loadChildren: () => import('./user/user.module').then(m => m.UserModule) },
    ],
    canActivate: [UserGuard, AuthGuard]
  },
   { path: 'helpUser', component: HelpComponent },
  { path: 'helpAdmin', component: HelpComponent},
  {
      path: 'profile',
      component: ProfileComponent,
      children: [
        { path: '', redirectTo: 'edit-name', pathMatch: 'full' },
        { path: 'edit-name', component: EditNameComponent },
        { path: 'edit-email', component: EditEmailComponent },
        { path: 'edit-password', component: EditPasswordComponent },
        { path: 'edit-photo', component: EditPhotoComponent },
      ]
    },

  {
    path: '',
    component: DefaultComponent,
    children: [
      // { path: '', redirectTo: '/home', pathMatch: 'full' },
      // { path: 'home', loadChildren: () => import('./home/home.module').then(m => m.HomeModule) },
      // { path: 'login', component: LoginComponent },
  {path:"",redirectTo:"home",pathMatch:"full"},
      // {path:"home/login",component:LoginComponent},
      // {path:"home/register", component:RegisterComponent},
      // {path:"admin", component:AdminDashboardComponent},
  {path:"home/contact", component:ContactComponent},
  {path:"home/category", component:PopCategoryComponent},
  {path:"home/levels-listing", component: LevelsListingComponent},
  {path:"home/projects-listing", component:ProjectsComponent},
  {path: "home/project-detail/:id",component:ProjectDetailComponent},
  {path:"home/team", component:TeamComponent},
  {path:"home",component:HomeComponent,},
      
    ],
  },
  {
    path: '**', redirectTo: '/home'
  },

  

  // { path: 'admin', loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule) },
  // { path: 'user', loadChildren: () => import('./user/user.module').then(m => m.UserModule) },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
