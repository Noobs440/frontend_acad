import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminsysComponent } from './adminsys.component';
import { CategoryListComponent } from './category-list/category-list.component';
import { DocumentListComponent } from './document-list/document-list.component';
import { CollaboratorListComponent } from './collaborator-list/collaborator-list.component';
import { FacultyListComponent } from './faculty-list/faculty-list.component';
import { FiliereListComponent } from './filiere-list/filiere-list.component';
import { NiveauListComponent } from './niveau-list/niveau-list.component';
import { IndexComponent } from './index/index.component'; 
import { ProjectListComponent } from './project-list/project-list.component';
import { UniversiteListComponent } from './universite-list/universite-list.component';
import { UserManagementComponent } from './user-management/user-management.component';
import { SettingsComponent } from './settings/settings.component';
import { ActivityLogListComponent } from './activity-log-list/activity-log-list.component';
import path from 'path';

const routes: Routes = [
  {
    path: '',
    component: AdminsysComponent,
    children: [
      {path: 'settings', component: SettingsComponent, children: [
          { path: 'categories', component: CategoryListComponent },
          { path: 'documents', component: DocumentListComponent },
          { path: 'collaborateurs', component: CollaboratorListComponent },
          { path: 'facultes', component: FacultyListComponent },
          { path: 'filieres', component: FiliereListComponent },
          { path: 'niveaux', component: NiveauListComponent },
          { path: 'universites', component: UniversiteListComponent },
        ]},
      {path: 'activity-logs', component: ActivityLogListComponent },
      {path: 'users', component: UserManagementComponent },
      {path: 'projets', component: ProjectListComponent },
      { path: 'index', component: IndexComponent },
      // autres routes
      { path: '', redirectTo: 'index', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminsysRoutingModule {}
