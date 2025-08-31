import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { InfoDialogComponent } from '../../../shared/info-dialog/info-dialog.component';
import { HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { ProjetService } from '../../../services/projet.service';
import { ActivatedRoute } from '@angular/router';
import { CategoryService } from '../../../services/category.service';
import { NiveauService } from '../../../services/niveau.service';
import { DocumentService } from '../../../services/document.service';
import { CollaborateurService } from '../../../services/collaborateur.service';
// import supprimé : plus de superviseur
import { UserService } from '../../../services/user.service';
import { UserManagementService } from '../../../services/user-management.service';

@Component({
  selector: 'app-submit-popup',
  templateUrl: './submit-popup.component.html',
  styleUrls: ['./submit-popup.component.css'],
  providers: [DatePipe]
})
export class SubmitPopupComponent implements OnInit {
  isLoadingStep1 = false;
  isLoadingStep2 = false;
  isLoadingStep3 = false;
  isLoadingStep4 = false;
  isLoadingStep5 = false;
  isLoadingStep6 = false;
  adminAdded: boolean = false;
  admins: any[] = [];
  selectedAdminId: string | null = null;
  creationForm!: FormGroup;
  documentForm!: FormGroup;
  collaboratorForm!: FormGroup;
  adminForm!: FormGroup;

  selectedFile!: File;
  selectedFileD!: File;
  today: any;

  token!: string;
  name!: string;
  role!: string;
  id: any;
  user_id: any;

  isLoading = false;
  ErrorMessage = "";
  submitted = false;
  formType = 'project';
  currentStep = 1;

  saveD = false;
  saveC = false;
  saveS = false;
  project_id: any;

  categories: any[] = [];
  niveaux: any[] = [];
  projets: any[] = [];
  projet: any[] = [];
  categories_name: any[] = [];
  categories_id: any[] = [];
  niveaux_name: any[] = [];
  niveaux_id: any[] = [];

  constructor(
    private colService: CollaborateurService,
    private documentService: DocumentService,
    private dialogRef: MatDialogRef<SubmitPopupComponent>,
    private fb: FormBuilder,
    private http: HttpClient,
    private datePipe: DatePipe,
    private projetService: ProjetService,
    private route: ActivatedRoute,
    private categoryService: CategoryService,
    private niveauService: NiveauService,
    private userService: UserService,
    private userManagementService: UserManagementService,
    private dialog: MatDialog
  ) {}
  // Pour la logique collaborateur avancée
  foundUser: any = null;
  showPasswordField: boolean = false;

  onCollaboratorEmailInput() {
    const email = this.collaboratorForm.value.email;
    if (!email || !this.collaboratorForm.controls['email'].valid) {
      this.foundUser = null;
      this.showPasswordField = false;
      this.collaboratorForm.get('name')?.reset();
      this.collaboratorForm.get('name')?.enable();
      return;
    }
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

  ngOnInit() {
    this.creationForm = this.fb.group({
      title: ['', Validators.required],
      type: ['', Validators.required],
      file: [null, Validators.required],
      niveau: ['', Validators.required],
      category: ['', Validators.required],
      summary: ['', Validators.required],
    });

    this.adminAdded = false;
    this.documentForm = this.fb.group({
      title: ['', Validators.required],
      file: ['', Validators.required],
    });

    this.collaboratorForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['']
    });

    this.adminForm = this.fb.group({
      admin: [null, Validators.required]
    });

    this.token = localStorage.getItem('token') || '';
    this.name = localStorage.getItem('name') || '';
    this.role = localStorage.getItem('role') || '';
    this.id = localStorage.getItem('id') || '';
    this.user_id = localStorage.getItem('id') || '';

    this.today = this.datePipe.transform(new Date(), 'dd-MM-yyyy') || '';

    this.categoryService.getCategories().subscribe(data => {
      this.categories = data;
      this.categories.forEach(c => {
        this.categories_id.push(c.id);
        this.categories_name.push(c.nom_cat);
      });
    });

    this.niveauService.getNiveaux().subscribe(data => {
      this.niveaux = data;
      this.niveaux.forEach(n => {
        this.niveaux_id.push(n.id);
        this.niveaux_name.push(n.code_niv);
      });
    });

    this.projetService.getProjectsTypes().subscribe(data => {
      this.projets = data;
    });

    this.projetService.getProjects().subscribe(data => {
      this.projet = data;
    });

    this.userService.getAdmins().subscribe({
      next: (admins) => {
        this.admins = admins;
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des admins', err);
      }
    });

    // Correction : si le popup reçoit un id projet et un startStep, on démarre à l'étape document
    if (this.dialogRef && this.dialogRef._containerInstance && this.dialogRef._containerInstance._config.data) {
      const data = this.dialogRef._containerInstance._config.data;
      if (data.projectId) {
        this.project_id = data.projectId;
      }
      if (data.startStep) {
        this.currentStep = data.startStep;
        this.formType = 'document';
      }
    }
  }

  get creationFormControl() {
    return this.creationForm.controls;
  }

  get documentFormControl() {
    return this.documentForm.controls;
  }

  get collaboratorFormControl() {
    return this.collaboratorForm.controls;
  }

  get adminFormControl() {
    return this.adminForm.controls;
  }

  nextStep() {
    this.submitted = true;
    if (this.currentStep === 1) {
      // Vérification manuelle pour UX : si un champ est manquant, afficher un message temporaire
      if (!this.creationForm.value.title || !this.creationForm.value.type || !this.selectedFile) {
        this.ErrorMessage = 'Veuillez remplir tous les champs requis (Titre, Type, Couverture).';
        setTimeout(() => { this.ErrorMessage = ''; }, 3000);
        return;
      }
      this.isLoadingStep1 = true;
      this.isLoadingStep1 = false;
      this.currentStep++;
      return;
    }
    if (this.currentStep === 2) {
      this.isLoadingStep2 = true;
      if (this.creationForm.get('niveau')?.invalid || this.creationForm.get('category')?.invalid) {
        this.dialog.open(InfoDialogComponent, {
          width: '350px',
          data: { title: 'Attention', message: 'Veuillez remplir tous les champs requis.' }
        });
        this.isLoadingStep2 = false;
        return;
      }
      this.isLoadingStep2 = false;
      this.currentStep++;
      return;
    }
    if (this.currentStep === 3) {
      if (this.isLoadingStep3) {
        // Si déjà en chargement, ne rien faire
        return;
      }
      if (this.creationForm.get('summary')?.invalid) {
        this.ErrorMessage = 'Veuillez remplir la description.';
        setTimeout(() => { this.ErrorMessage = ''; }, 3000);
        return;
      }
      if (!this.project_id && this.creationForm.valid && this.selectedFile) {
        this.isLoadingStep3 = true;
        const formData = new FormData();
        formData.append('titre_projet', this.creationForm.value.title);
        formData.append('descript_projet', this.creationForm.value.summary);
        formData.append('tbl_niveau_id', this.creationForm.value.niveau);
        formData.append('user_id', this.user_id);
        formData.append('tbl_categorie_id', this.creationForm.value.category);
        formData.append('image', this.selectedFile);
        formData.append('type', this.creationForm.value.type);
        if (this.selectedAdminId) {
          formData.append('admin_id', this.selectedAdminId);
        }
        this.projetService.addProject(formData).subscribe({
          next: value => {
            this.project_id = value.id;
            this.isLoadingStep3 = false;
            this.formType = 'document';
            this.currentStep++;
          },
          error: err => {
            console.error('Erreur backend:', err.error);
            if (err.error && err.error.errors) {
              for (const key in err.error.errors) {
                if (err.error.errors.hasOwnProperty(key)) {
                  console.error(`Champ: ${key} - Message: ${err.error.errors[key]}`);
                }
              }
            }
            this.ErrorMessage = "Erreur lors de la création du projet.";
            setTimeout(() => { this.ErrorMessage = ''; }, 3000);
            this.isLoadingStep3 = false;
          }
        });
      } else if (this.project_id) {
        // Si le projet a déjà été créé, on peut avancer
        this.formType = 'document';
        this.currentStep++;
      } else {
        this.ErrorMessage = "Veuillez d'abord créer le projet.";
        setTimeout(() => { this.ErrorMessage = ''; }, 3000);
      }
      return;
    }
    if (this.currentStep === 4) {
      this.isLoadingStep4 = true;
      this.isLoadingStep4 = false;
      this.formType = 'collaborator';
      this.currentStep++;
      return;
    }
    if (this.currentStep === 5) {
      this.isLoadingStep5 = true;
      this.isLoadingStep5 = false;
      this.formType = 'admin';
      this.currentStep++;
      return;
    }
    if (this.currentStep === 6) {
      this.isLoadingStep6 = true;
      if (this.adminForm.invalid) {
        this.dialog.open(InfoDialogComponent, {
          width: '350px',
          data: { title: 'Attention', message: 'Veuillez sélectionner un administrateur.' }
        });
        this.isLoadingStep6 = false;
        return;
      }
      this.isLoadingStep6 = false;
      // Soumission finale ici si besoin
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      if (this.currentStep === 4) this.formType = 'project';
      if (this.currentStep === 5) this.formType = 'document';
      if (this.currentStep === 6) this.formType = 'collaborator';
      this.currentStep--;
    }
  }

  onCancel() {
    this.dialogRef.close();
    window.location.reload();
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
    if (this.selectedFile) {
      this.creationForm.patchValue({ file: this.selectedFile.name });
      this.creationForm.get('file')?.markAsTouched();
      this.creationForm.get('file')?.updateValueAndValidity();
    }
  }

  onFileSelectedD(event: any) {
    this.selectedFileD = event.target.files[0];
    if (this.selectedFileD) {
      this.documentForm.patchValue({ file: this.selectedFileD });
      this.documentForm.get('file')?.markAsTouched();
      this.documentForm.get('file')?.updateValueAndValidity();
    }
  }

  onSubmit() {
    this.isLoading = true;
    this.submitted = true;

    // La création du projet se fait désormais dans nextStep()

    if (this.formType === 'document' && this.documentForm.valid && this.selectedFileD) {
      const formData = new FormData();
      formData.append('nom_doc', this.documentForm.value.title);
      formData.append('user_id', this.user_id);
      formData.append('tbl_projet_id', this.project_id);
      formData.append('document', this.selectedFileD);


      this.documentService.addDocument(formData).subscribe({
        next: () => {
          this.dialog.open(InfoDialogComponent, {
            width: '350px',
            data: { title: 'Succès', message: 'Document ajouté avec succès !' }
          });
          this.saveD = true;
        },
        error: err => {
          console.error('Erreur backend document:', err.error);
          if (err.error && err.error.errors) {
            for (const key in err.error.errors) {
              if (err.error.errors.hasOwnProperty(key)) {
                console.error(`Champ: ${key} - Message: ${err.error.errors[key]}`);
              }
            }
          }
          this.dialog.open(InfoDialogComponent, {
            width: '350px',
            data: { title: 'Erreur', message: "Erreur lors de l'ajout du document." }
          });
        },
        complete: () => {
          this.isLoading = false;
          this.documentForm.reset();
        }
      });
    }

    if (this.formType === 'collaborator' && this.collaboratorForm.valid) {
      if (!this.project_id) {
        this.dialog.open(InfoDialogComponent, {
          width: '350px',
          data: { title: 'Erreur', message: "Projet non créé. Impossible d’ajouter un collaborateur." }
        });
        this.isLoading = false;
        return;
      }
      const email = this.collaboratorForm.value.email;
      const name = this.collaboratorForm.value.name;
      if (this.foundUser) {
        // Utilisateur existant, ajout direct comme collaborateur
        this.colService.addCollaborateur(
          this.foundUser.nom_user,
          this.foundUser.email,
          this.project_id,
          this.foundUser.id // Pass the correct user_id
        ).subscribe({
          next: () => {
            this.dialog.open(InfoDialogComponent, {
              width: '350px',
              data: { title: 'Succès', message: 'Collaborateur ajouté !' }
            });
            this.saveC = true;
            this.collaboratorForm.reset();
            this.foundUser = null;
            this.showPasswordField = false;
            this.collaboratorForm.get('email')?.enable();
          },
          error: err => {
            console.error(err);
            this.dialog.open(InfoDialogComponent, {
              width: '350px',
              data: { title: 'Erreur', message: "Erreur lors de l'ajout du collaborateur." }
            });
            this.collaboratorForm.get('email')?.enable();
          },
          complete: () => {
            this.isLoading = false;
          }
        });
      } else {
        // Utilisateur non existant, création puis ajout
        const password = this.collaboratorForm.value.password;
        if (!password) {
          this.dialog.open(InfoDialogComponent, {
            width: '350px',
            data: { title: 'Erreur', message: "Veuillez saisir un mot de passe pour créer l'utilisateur." }
          });
          this.isLoading = false;
          return;
        }
  const newUser = { nom_user: name, email: email, password: password, role: 'user' };
  this.userManagementService.createUser(newUser).subscribe({
          next: (createdUser) => {
            // Enchaîner directement avec l'ajout du collaborateur
            this.colService.addCollaborateur(
              createdUser.nom_user,
              createdUser.email,
              this.project_id,
              createdUser.id
            ).subscribe({
              next: () => {
                this.dialog.open(InfoDialogComponent, {
                  width: '350px',
                  data: { title: 'Succès', message: 'Utilisateur créé et collaborateur ajouté !' }
                }).afterClosed().subscribe(() => {
                  this.saveC = true;
                  this.collaboratorForm.reset();
                  this.foundUser = null;
                  this.showPasswordField = false;
                  this.formType = 'collaborator';
                  this.currentStep = 5;
                });
              },
              error: err => {
                console.error(err);
                this.dialog.open(InfoDialogComponent, {
                  width: '350px',
                  data: { title: 'Erreur', message: "Erreur lors de l'ajout du collaborateur." }
                }).afterClosed().subscribe(() => {
                  this.collaboratorForm.reset();
                  this.foundUser = null;
                  this.showPasswordField = false;
                  this.formType = 'collaborator';
                  this.currentStep = 5;
                });
              },
              complete: () => {
                this.isLoading = false;
              }
            });
          },
          error: err => {
            console.error(err);
            this.dialog.open(InfoDialogComponent, {
              width: '350px',
              data: { title: 'Erreur', message: "Erreur lors de la création de l'utilisateur." }
            }).afterClosed().subscribe(() => {
              // Réinitialiser le formulaire et revenir à l'étape collaborateur
              this.collaboratorForm.reset();
              this.foundUser = null;
              this.showPasswordField = false;
              this.formType = 'collaborator';
              this.currentStep = 5;
            });
            this.isLoading = false;
          }
        });
      }
    }

    if (this.formType === 'admin' && this.adminForm.valid) {
      this.isLoadingStep6 = true;
      const adminId = this.adminForm.value.admin;
      if (!adminId) {
        this.dialog.open(InfoDialogComponent, {
          width: '350px',
          data: { title: 'Attention', message: "Veuillez sélectionner un administrateur avant de soumettre le projet." }
        });
        this.isLoadingStep6 = false;
        return;
      }
      if (!this.project_id) {
        this.dialog.open(InfoDialogComponent, {
          width: '350px',
          data: { title: 'Erreur', message: "Projet non créé. Impossible de soumettre à un admin." }
        });
        this.isLoadingStep6 = false;
        return;
      }
      // 1. Assigner l'admin puis 2. Soumettre le projet (en série)
      this.projetService.assignAdminToProject(this.project_id, adminId).subscribe({
        next: () => {
          this.projetService.submitProject(this.project_id).subscribe({
            next: () => {
              this.adminAdded = true;
              this.dialog.open(InfoDialogComponent, {
                width: '350px',
                data: { title: 'Succès', message: "Projet soumis à l'administrateur avec succès !" }
              });
              this.dialogRef.close();
              window.location.reload();
            },
            error: err => {
              console.error('Erreur backend soumission projet:', err);
              this.adminAdded = false;
              this.dialog.open(InfoDialogComponent, {
                width: '350px',
                data: { title: 'Erreur', message: "Erreur lors de la soumission du projet." }
              });
            },
            complete: () => {
              this.isLoadingStep6 = false;
            }
          });
        },
        error: err => {
          console.error('Erreur backend assignation admin:', err);
          this.adminAdded = false;
          this.dialog.open(InfoDialogComponent, {
            width: '350px',
            data: { title: 'Erreur', message: "Erreur lors de l'assignation de l'administrateur." }
          });
          this.isLoadingStep6 = false;
        }
      });
    }
}
}
