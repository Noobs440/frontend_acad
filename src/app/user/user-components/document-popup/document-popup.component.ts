import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DocumentService } from '../../../services/document.service';
import { CollaborateurService } from '../../../services/collaborateur.service';
import { SuperviseurService } from '../../../services/superviseur.service';

@Component({
  selector: 'app-document-popup',
  templateUrl: './document-popup.component.html',
  styleUrls: ['./document-popup.component.css']
})
export class DocumentPopupComponent implements OnInit {
  formType!: string;
  id!: any;
  user_id!: any;
  isEditMode: boolean = false;

  documentForm!: FormGroup;
  collaboratorForm!: FormGroup;
  supervisorForm!: FormGroup;

  selectedFile!: File;

  submittedDocument = false;
  submittedCollaborator = false;
  submittedSupervisor = false;

  constructor(
    private fb: FormBuilder,
    private documentService: DocumentService,
    private colService: CollaborateurService,
    private supService: SuperviseurService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<DocumentPopupComponent>
  ) { }

  ngOnInit() {
    this.formType = this.data.formType || 'document';
    this.id = this.data.id;
    this.user_id = this.data.user_id;

    this.documentForm = this.fb.group({
      title: ['', Validators.required],
      file: ['', Validators.required]
    });

    this.collaboratorForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });

    this.supervisorForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });

    this.isEditMode = !!(this.formType === 'collaborator' && this.data.collaborator);

    if (this.isEditMode) {
      this.collaboratorForm.patchValue({
        name: this.data.collaborator.nom_collab,
        email: this.data.collaborator.email_collab
      });
    }
  }

  // Réinitialise la variable submitted du formulaire affiché
  resetSubmitted(type: string) {
    if (type === 'document') {
      this.submittedDocument = false;
    } else if (type === 'collaborator') {
      this.submittedCollaborator = false;
    } else if (type === 'supervisor') {
      this.submittedSupervisor = false;
    }
    return true; // pour l'appel dans le template
  }

  setFormType(type: string) {
    this.formType = type;
    this.resetSubmitted(type);
  }

  get documentFormControl() {
    return this.documentForm.controls;
  }

  get collaboratorFormControl() {
    return this.collaboratorForm.controls;
  }

  get supervisorFormControl() {
    return this.supervisorForm.controls;
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
    if (this.selectedFile) {
      this.documentForm.patchValue({ file: this.selectedFile.name });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit() {
    if (this.formType === 'document') {
      this.submittedDocument = true;
      if (this.documentForm.invalid || !this.selectedFile) {
        return;
      }
      const formData = new FormData();
      formData.append('nom_doc', this.documentForm.value.title);
      formData.append('user_id', this.user_id);
      formData.append('tbl_projet_id', this.id);
      formData.append('document', this.selectedFile);

      this.documentService.addDocument(formData).subscribe({
        next: res => alert("Document ajouté avec succès."),
        error: err => {
          console.error(err);
          alert("Erreur lors de l'ajout du document.");
        },
        complete: () => this.dialogRef.close(true)
      });

    } else if (this.formType === 'collaborator') {
      this.submittedCollaborator = true;
      if (this.collaboratorForm.invalid) {
        return;
      }

      if (this.isEditMode) {
        this.colService.updateCollaborateur(
          this.data.collaborator.id,
          this.collaboratorForm.value.name,
          this.collaboratorForm.value.email,
          this.id,
          this.user_id
        ).subscribe({
          next: () => alert("Collaborateur modifié avec succès."),
          error: err => {
            console.error(err);
            alert("Erreur lors de la modification du collaborateur.");
          },
          complete: () => this.dialogRef.close(true)
        });

      } else {
        this.colService.addCollaborateur(
          this.collaboratorForm.value.name,
          this.collaboratorForm.value.email,
          this.id,
          this.user_id
        ).subscribe({
          next: () => alert("Collaborateur ajouté avec succès."),
          error: err => {
            console.error(err);
            alert("Erreur lors de l'ajout du collaborateur.");
          },
          complete: () => this.dialogRef.close(true)
        });
      }

    } else if (this.formType === 'supervisor') {
      this.submittedSupervisor = true;
      if (this.supervisorForm.invalid) {
        return;
      }
      this.supService.addSuperviseur(
        this.supervisorForm.value.name,
        this.supervisorForm.value.email
      ).subscribe({
        next: () => alert("Superviseur ajouté avec succès."),
        error: err => {
          console.error(err);
          alert("Erreur lors de l'ajout du superviseur.");
        },
        complete: () => this.dialogRef.close(true)
      });

    } else {
      alert("Veuillez remplir correctement le formulaire.");
    }
  }
}