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

const routes: Routes = [
  {
    path: '',
    component: AdminsysComponent,
    children: [
      {path: 'users', component: UserManagementComponent },
      {path: 'universites', component: UniversiteListComponent },
      {path: 'projets', component: ProjectListComponent },
      { path: 'niveaux', component: NiveauListComponent },
      { path: 'filieres', component: FiliereListComponent },
      { path: 'facultes', component: FacultyListComponent },
      { path: 'collaborateurs', component: CollaboratorListComponent },
      { path: 'documents', component: DocumentListComponent },
      { path: 'categories', component: CategoryListComponent },
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
