import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { DocumentService } from '../../../services/document.service';
import { CollaborateurService } from '../../../services/collaborateur.service';
import { SuperviseurService } from '../../../services/superviseur.service';
import { UserManagementService } from '../../../services/user-management.service';
import { InfoDialogComponent } from '../../../shared/info-dialog/info-dialog.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-document-popup',
  templateUrl: './document-popup.component.html',
  styleUrls: ['./document-popup.component.css']
})
export class DocumentPopupComponent implements OnInit {
  isDeletingCollaborator: string | null = null;
  isDeletingDocument: boolean = false;
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

  foundUser: any = null;
  showPasswordField: boolean = false;
  isLoading: boolean = false;
  isLoadingStep5: boolean = false;
  currentStep: number = 5;

  constructor(
    private fb: FormBuilder,
    private documentService: DocumentService,
    private colService: CollaborateurService,
    private supService: SuperviseurService,
    private userManagementService: UserManagementService,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<DocumentPopupComponent>
  ) { }

  confirmDeleteCollaborator(collaborator: any) {
    const dialogRef = this.dialog.open(InfoDialogComponent, {
      width: '400px',
      disableClose: true,
      data: {
        title: 'Confirmation de suppression',
        message: `Êtes-vous sûr de vouloir supprimer le collaborateur <b>${collaborator.nom_collab}</b> (<i>${collaborator.email_collab}</i>) ?<br><br><span style='color:red;font-weight:bold;'>Cette action est irréversible.</span>`,
        confirmButtonText: 'Oui, supprimer',
        cancelButtonText: 'Annuler',
        icon: 'warning',
        color: 'warn'
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.isDeletingCollaborator = collaborator.id;
        this.colService.deleteCollaborateur(collaborator.id).subscribe({
          next: () => {
            Swal.fire('Succès', 'Collaborateur supprimé avec succès.', 'success');
          },
          error: err => {
            console.error(err);
            Swal.fire('Erreur', 'Erreur lors de la suppression du collaborateur.', 'error');
          },
          complete: () => {
            this.isDeletingCollaborator = null;
          }
        });
      }
    });
  }

  confirmDeleteDocument(document: any) {
    if (!document || !document.id) {
      Swal.fire('Erreur', 'Document à supprimer non défini.', 'error');
      return;
    }
    const dialogRef = this.dialog.open(InfoDialogComponent, {
      width: '400px',
      disableClose: true,
      data: {
        title: 'Confirmation de suppression',
        message: `Êtes-vous sûr de vouloir supprimer le document <b>${document.nom_doc}</b> ?<br><br><span style='color:red;font-weight:bold;'>Cette action est irréversible.</span>`,
        confirmButtonText: 'Oui, supprimer',
        cancelButtonText: 'Annuler',
        icon: 'warning',
        color: 'warn'
      }
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result === true) {
        this.isDeletingDocument = true;
        this.documentService.deleteDocument(document.id).subscribe({
          next: () => {
            Swal.fire('Succès', 'Le document a bien été supprimé sur le serveur.', 'success');
            this.dialogRef.close(true);
          },
          error: (err: any) => {
            console.error(err);
            Swal.fire('Erreur', 'Erreur lors de la suppression du document côté serveur.', 'error');
          },
          complete: () => {
            this.isDeletingDocument = false;
          }
        });
      }
    });
  }

  deleteDocument(id: string) {
    this.isDeletingDocument = true;
    this.documentService.deleteDocument(id).subscribe({
      next: () => {
        Swal.fire('Succès', 'Le document a été supprimé avec succès.', 'success');
        this.dialogRef.close(true);
      },
      error: (err: any) => {
        console.error(err);
        Swal.fire('Erreur', 'Erreur lors de la suppression du document.', 'error');
      },
      complete: () => {
        this.isDeletingDocument = false;
      }
    });
  }

  ngOnInit() {
    this.formType = this.data.formType || 'document';
    this.id = this.data.id;
    this.user_id = this.data.user_id;

    this.documentForm = this.fb.group({
      title: ['', Validators.required],
      file: ['', Validators.required]
    });

    if (this.formType === 'document' && this.data.document) {
      this.documentForm.patchValue({
        title: this.data.document.nom_doc || '',
        file: this.data.document.fileName || ''
      });
    }

    this.collaboratorForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['']
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

  resetSubmitted(type: string) {
    if (type === 'document') this.submittedDocument = false;
    else if (type === 'collaborator') this.submittedCollaborator = false;
    else if (type === 'supervisor') this.submittedSupervisor = false;
    return true;
  }

  onCollaboratorEmailInput() {
    const emailControl = this.collaboratorForm.get('email');
    if (!emailControl || emailControl.invalid) {
      emailControl?.markAsTouched();
      this.submittedCollaborator = true;
      return;
    }
    const email = emailControl.value;
    this.userManagementService.findUserByEmail(email).subscribe(user => {
      if (user) {
        this.foundUser = user;
        this.showPasswordField = false;
        this.collaboratorForm.get('name')?.setValue(user.nom_user);
        this.collaboratorForm.get('name')?.disable();
        this.collaboratorForm.get('email')?.disable();
      } else {
        const confirmDialog = this.dialog.open(InfoDialogComponent, {
          width: '350px',
          data: {
            title: 'Utilisateur introuvable',
            message: "Cet email n'existe pas. Voulez-vous créer ce collaborateur ?",
            confirm: true
          }
        });
        confirmDialog.afterClosed().subscribe(result => {
          if (result === true) {
            this.foundUser = null;
            this.showPasswordField = true;
            this.collaboratorForm.get('name')?.reset();
            this.collaboratorForm.get('name')?.enable();
            this.collaboratorForm.get('email')?.enable();
            this.collaboratorForm.get('password')?.reset();
          } else {
            this.foundUser = null;
            this.showPasswordField = false;
          }
        });
      }
    });
  }

  setFormType(type: string) {
    this.formType = type;
    this.resetSubmitted(type);
  }

  get documentFormControl() { return this.documentForm.controls; }
  get collaboratorFormControl() { return this.collaboratorForm.controls; }
  get supervisorFormControl() { return this.supervisorForm.controls; }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
    if (this.selectedFile) this.documentForm.patchValue({ file: this.selectedFile.name });
  }

  onCancel(): void { this.dialogRef.close(); }

  onSubmit() {
    if (this.formType === 'document') {
      this.submittedDocument = true;
      if (this.documentForm.invalid || !this.selectedFile) return;

      const formData = new FormData();
      formData.append('nom_doc', this.documentForm.value.title);
      formData.append('user_id', this.user_id);
      formData.append('tbl_projet_id', this.id);
      formData.append('document', this.selectedFile);

      this.isLoading = true;
      if (this.isEditMode) {
        this.documentService.updateDocumentMultipart(this.data.document.id, formData).subscribe({
          next: () => Swal.fire('Succès', 'Document modifié avec succès.', 'success'),
          error: (err) => { console.error(err); Swal.fire('Erreur', 'Erreur lors de la modification du document.', 'error'); },
          complete: () => { this.isLoading = false; this.dialogRef.close(true); }
        });
      } else {
        this.documentService.addDocument(formData).subscribe({
          next: () => Swal.fire('Succès', 'Document ajouté avec succès.', 'success'),
          error: (err) => { console.error(err); Swal.fire('Erreur', 'Erreur lors de l\'ajout du document.', 'error'); },
          complete: () => { this.isLoading = false; this.dialogRef.close(true); window.location.reload(); }
        });
      }

    } else if (this.formType === 'collaborator') {
      this.submittedCollaborator = true;
      if (this.collaboratorForm.invalid) return;

      this.isLoading = true;
      const email = this.collaboratorForm.value.email;
      const name = this.collaboratorForm.value.name;

      const finishCollaboratorForm = () => {
        this.isLoading = false;
        this.collaboratorForm.reset();
        this.foundUser = null;
        this.showPasswordField = false;
        this.collaboratorForm.get('email')?.enable();
        this.collaboratorForm.get('name')?.enable();
        this.collaboratorForm.get('password')?.reset();
        window.location.reload();
      };

      if (this.isEditMode) {
        this.colService.updateCollaborateur(
          this.data.collaborator.id, name, email, this.id, this.user_id
        ).subscribe({
          next: () => Swal.fire('Succès', 'Collaborateur modifié avec succès.', 'success'),
          error: (err) => { console.error(err); Swal.fire('Erreur', 'Erreur lors de la modification du collaborateur.', 'error'); },
          complete: finishCollaboratorForm
        });
      } else {
        if (this.foundUser) {
          this.colService.addCollaborateur(this.foundUser.nom_user, this.foundUser.email, this.id, this.foundUser.id).subscribe({
            next: () => Swal.fire('Succès', 'Collaborateur ajouté avec succès !', 'success'),
            error: (err) => { console.error(err); Swal.fire('Erreur', 'Erreur lors de l\'ajout du collaborateur.', 'error'); },
            complete: finishCollaboratorForm
          });
        } else {
          const password = this.collaboratorForm.value.password;
          if (!password) { Swal.fire('Erreur', 'Veuillez saisir un mot de passe pour créer l\'utilisateur.', 'error'); this.isLoading = false; return; }
          const newUser = { nom_user: name, email: email, password: password, role: 'user' };
          this.userManagementService.createUser(newUser).subscribe({
            next: (createdUser) => {
              this.colService.addCollaborateur(createdUser.nom_user, createdUser.email, this.id, createdUser.id).subscribe({
                next: () => Swal.fire('Succès', 'Utilisateur créé et collaborateur ajouté !', 'success'),
                error: (err) => { console.error(err); Swal.fire('Erreur', 'Erreur lors de l\'ajout du collaborateur.', 'error'); },
                complete: finishCollaboratorForm
              });
            },
            error: (err) => { console.error(err); Swal.fire('Erreur', 'Erreur lors de la création de l\'utilisateur.', 'error'); this.isLoading = false; }
          });
        }
      }

    } else if (this.formType === 'supervisor') {
      this.submittedSupervisor = true;
      if (this.supervisorForm.invalid) return;
      this.isLoading = true;
      this.supService.addSuperviseur(this.supervisorForm.value.name, this.supervisorForm.value.email).subscribe({
        next: () => Swal.fire('Succès', 'Superviseur ajouté avec succès.', 'success'),
        error: (err) => { console.error(err); Swal.fire('Erreur', 'Erreur lors de l\'ajout du superviseur.', 'error'); },
        complete: () => { this.isLoading = false; this.dialogRef.close(true); }
      });
    }
  }

  nextStep() {
    if (this.formType === 'collaborator') { this.formType = 'admin'; this.currentStep++; }
    else if (this.formType === 'document') { this.formType = 'collaborator'; this.currentStep++; }
  }
}
