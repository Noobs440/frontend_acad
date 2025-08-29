
  
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { DocumentService } from '../../../services/document.service';
import { CollaborateurService } from '../../../services/collaborateur.service';
import { SuperviseurService } from '../../../services/superviseur.service';
import { UserManagementService } from '../../../services/user-management.service';
import { InfoDialogComponent } from '../../../shared/info-dialog/info-dialog.component';

@Component({
  selector: 'app-document-popup',
  templateUrl: './document-popup.component.html',
  styleUrls: ['./document-popup.component.css']
})
export class DocumentPopupComponent implements OnInit {
  // Spinner pour la recherche de document
  isLoadingSearch: boolean = false;
  // Spinner pour l'ajout de superviseur
  isLoadingSupervisor: boolean = false;
  isDeletingCollaborator: string | null = null;

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
            // Actualiser la liste des collaborateurs si besoin
            this.dialog.open(InfoDialogComponent, {
              width: '350px',
              data: { title: 'Succès', message: 'Collaborateur supprimé avec succès.' }
            });
          },
          error: err => {
            this.dialog.open(InfoDialogComponent, {
              width: '350px',
              data: { title: 'Erreur', message: 'Erreur lors de la suppression du collaborateur.' }
            });
          },
          complete: () => {
            this.isDeletingCollaborator = null;
          }
        });
      }
    });
  }
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

  confirmDeleteDocument(document: any) {
    if (!document || !document.id) {
      this.dialog.open(InfoDialogComponent, {
        width: '350px',
        data: { title: 'Erreur', message: 'Document à supprimer non défini.' }
      });
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
            this.dialog.open(InfoDialogComponent, {
              width: '350px',
              data: { title: 'Succès', message: 'Le document a bien été supprimé sur le serveur.' }
            });
            this.dialogRef.close(true);
          },
          error: (err: any) => {
            this.dialog.open(InfoDialogComponent, {
              width: '350px',
              data: { title: 'Erreur', message: "Erreur lors de la suppression du document côté serveur." }
            });
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
    console.log('[SUPPRESSION] Début suppression document id=', id);
    alert('Suppression du document en cours...');
    this.documentService.deleteDocument(id).subscribe({
      next: () => {
        console.log('[SUPPRESSION] Document supprimé id=', id);
        alert('Le document a été supprimé avec succès.');
        this.dialog.open(InfoDialogComponent, {
          width: '350px',
          data: { title: 'Succès', message: 'Le document a été supprimé avec succès.' }
        });
        this.dialogRef.close(true);
      },
      error: (err: any) => {
        console.error('[SUPPRESSION] Erreur suppression document', err);
        alert('Erreur lors de la suppression du document.');
        this.dialog.open(InfoDialogComponent, {
          width: '350px',
          data: { title: 'Erreur', message: "Erreur lors de la suppression du document." }
        });
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

    // Préremplissage si modification document
    if (this.formType === 'document' && this.data.document) {
      this.documentForm.patchValue({
        title: this.data.document.nom_doc || '',
        file: this.data.document.fileName || ''
      });
      // Optionnel : stocker le fichier si besoin
      // this.selectedFile = this.data.document.file || null;
    }

    this.collaboratorForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['']
    });
  // Ajout logique avancée collaborateur (recherche/création user)


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



    onCollaboratorEmailInput() {
      const emailControl = this.collaboratorForm.get('email');
      if (!emailControl || emailControl.invalid) {
        emailControl?.markAsTouched();
        this.submittedCollaborator = true;
        return;
      }
      const email = emailControl.value;
      // Recherche uniquement sur clic du bouton
      this.userManagementService.findUserByEmail(email).subscribe(user => {
        if (user) {
          this.foundUser = user;
          this.showPasswordField = false;
          this.collaboratorForm.get('name')?.setValue(user.nom_user);
          this.collaboratorForm.get('name')?.disable();
          this.collaboratorForm.get('email')?.disable();
        } else {
          // Demander confirmation avant de créer
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
              // Préparer le formulaire pour la création : tout éditable et vide
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

      if (this.isEditMode) {
        // Modification du document
  this.documentService.updateDocumentMultipart(this.data.document.id, formData).subscribe({
          next: res => alert("Document modifié avec succès."),
          error: err => {
            console.error(err);
            alert("Erreur lors de la modification du document.");
          },
          complete: () => {
            this.dialogRef.close(true);
            // Pas de reload ici
          }
        });
      } else {
        // Ajout du document
        this.documentService.addDocument(formData).subscribe({
          next: res => alert("Document ajouté avec succès."),
          error: err => {
            console.error(err);
            alert("Erreur lors de l'ajout du document.");
          },
          complete: () => {
            this.dialogRef.close(true);
            window.location.reload();
          }
        });
      }

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
        this.isLoading = true;
        const email = this.collaboratorForm.value.email;
        const name = this.collaboratorForm.value.name;
        if (this.foundUser) {
          // Utilisateur existant, ajout direct comme collaborateur
          this.colService.addCollaborateur(
            this.foundUser.nom_user,
            this.foundUser.email,
            this.id,
            this.foundUser.id // Pass the correct user_id
          ).subscribe({
            next: () => alert("Collaborateur ajouté !"),
            error: err => {
              console.error(err);
              alert("Erreur lors de l'ajout du collaborateur.");
            },
            complete: () => {
              this.isLoading = false;
              this.collaboratorForm.reset();
              this.foundUser = null;
              this.showPasswordField = false;
              this.collaboratorForm.get('email')?.enable();
              this.collaboratorForm.get('name')?.enable();
              this.collaboratorForm.get('password')?.reset();
              window.location.reload();
            }
          });
        } else {
          // Utilisateur non existant, création puis ajout
          const password = this.collaboratorForm.value.password;
          if (!password) {
            alert("Veuillez saisir un mot de passe pour créer l'utilisateur.");
            this.isLoading = false;
            return;
          }
          const newUser = { nom_user: name, email: email, password: password, role: 'user' };
          this.userManagementService.createUser(newUser).subscribe({
            next: (createdUser) => {
              this.colService.addCollaborateur(
                createdUser.nom_user,
                createdUser.email,
                this.id,
                createdUser.id
              ).subscribe({
                next: () => alert("Utilisateur créé et collaborateur ajouté !"),
                error: err => {
                  console.error(err);
                  alert("Erreur lors de l'ajout du collaborateur.");
                },
                complete: () => {
                  this.isLoading = false;
                  this.collaboratorForm.reset();
                  this.foundUser = null;
                  this.showPasswordField = false;
                  this.collaboratorForm.get('email')?.enable();
                  this.collaboratorForm.get('name')?.enable();
                  this.collaboratorForm.get('password')?.reset();
                  window.location.reload();
                }
              });
            },
            error: err => {
              console.error(err);
              alert("Erreur lors de la création de l'utilisateur.");
              this.isLoading = false;
              this.collaboratorForm.reset();
              this.foundUser = null;
              this.showPasswordField = false;
              this.collaboratorForm.get('email')?.enable();
            }
          });
        }
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

  nextStep() {
    if (this.formType === 'collaborator') {
      this.formType = 'admin';
      this.currentStep++;
    } else if (this.formType === 'document') {
      this.formType = 'collaborator';
      this.currentStep++;
    }
  }
}