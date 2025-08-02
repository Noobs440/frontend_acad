import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminsysRoutingModule } from './adminsys-routing.module';
import { CategoryListComponent } from './category-list/category-list.component';
import { AdminsysComponent } from './adminsys.component';
import { FormsModule } from '@angular/forms';
import { DocumentListComponent } from './document-list/document-list.component';
import { CollaboratorListComponent } from './collaborator-list/collaborator-list.component';
import { FacultyListComponent } from './faculty-list/faculty-list.component';
import { FiliereListComponent } from './filiere-list/filiere-list.component';
import { NiveauListComponent } from './niveau-list/niveau-list.component';
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
    // autres composants
  ],
  imports: [
    CommonModule,
    AdminsysRoutingModule,
    FormsModule
  ]
})
export class AdminsysModule {}