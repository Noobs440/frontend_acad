import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminsysRoutingModule } from './adminsys-routing.module';
import { CategoryListComponent } from './category-list/category-list.component';
import { AdminsysComponent } from './adminsys.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DocumentListComponent } from './document-list/document-list.component';
import { CollaboratorListComponent } from './collaborator-list/collaborator-list.component';
import { FacultyListComponent } from './faculty-list/faculty-list.component';
import { FiliereListComponent } from './filiere-list/filiere-list.component';
import { NiveauListComponent } from './niveau-list/niveau-list.component';
import { IndexComponent } from './index/index.component';
import { NgChartsModule } from 'ng2-charts';
import { ProjectListComponent } from './project-list/project-list.component';
import { UniversiteListComponent } from './universite-list/universite-list.component';
import { UserManagementComponent } from './user-management/user-management.component';
import { ResetPasswordDialogComponent } from './reset-password-dialog/reset-password-dialog.component';
import { ConfirmDialogComponent } from './confirm-dialog.component';
import { ProjectTraceListComponent } from './project-trace-list/project-trace-list.component';
// autres composants à ajouter ici

@NgModule({
  declarations: [
    CategoryListComponent,
    AdminsysComponent,
    DocumentListComponent,
    CollaboratorListComponent,
    FacultyListComponent,
    FiliereListComponent,
    NiveauListComponent,
    IndexComponent,
    ProjectListComponent,
    UniversiteListComponent,
    UserManagementComponent,
    ResetPasswordDialogComponent,
    ConfirmDialogComponent,
    ProjectTraceListComponent,
    // autres composants
  ],
  imports: [
    CommonModule,
    AdminsysRoutingModule,
    FormsModule,
    NgChartsModule,
     ReactiveFormsModule,       
    MatDialogModule,           
    MatFormFieldModule,        
    MatInputModule,            
    MatButtonModule,           
    NgChartsModule,
  ]
})
export class AdminsysModule {}