import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
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

@Component({
  selector: 'app-submit-popup',
  templateUrl: './submit-popup.component.html',
  styleUrls: ['./submit-popup.component.css'],
  providers: [DatePipe]
})
export class SubmitPopupComponent implements OnInit {
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
    // private supService: SuperviseurService, // plus de superviseur
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
    private userService: UserService
  ) {}

  ngOnInit() {
    this.creationForm = this.fb.group({
      title: ['', Validators.required],
      type: ['', Validators.required],
      file: [null, Validators.required],
      niveau: ['', Validators.required],
      category: ['', Validators.required],
      summary: ['', Validators.required],
    });

        this.adminAdded = false; // Initialize adminAdded
    this.documentForm = this.fb.group({
      title: ['', Validators.required],
      file: ['', Validators.required],
    });

    this.collaboratorForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
    });

  this.adminForm = this.fb.group({
    admin: [null, Validators.required]
  });

    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      this.name = params['name'];
      this.role = params['role'];
      this.id = params['id'];
      this.user_id = params['id'];
    });

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

    // Récupération des admins (users avec le rôle admin)
    this.userService.getAdmins().subscribe({
      next: (admins) => {
        this.admins = admins;
        console.log('Admins récupérés:', admins);
        console.log('IDs admins:', admins.map((a: any) => a.id));
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des admins', err);
      }
    });
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
    // Si on passe à l'étape 4 (document), on ne peut avancer que si le projet est créé
    if (this.currentStep === 3) {
      if (!this.project_id) {
        // On tente de créer le projet si ce n'est pas déjà fait
        if (this.creationForm.valid && this.selectedFile) {
          const formData = new FormData();
          formData.append('titre_projet', this.creationForm.value.title);
          formData.append('descript_projet', this.creationForm.value.summary);
          formData.append('tbl_niveau_id', this.creationForm.value.niveau);
          formData.append('user_id', this.user_id);
          formData.append('tbl_categorie_id', this.creationForm.value.category);
          formData.append('image', this.selectedFile);
          formData.append('type', this.creationForm.value.type);
          // Ajout de l'admin choisi si présent
          if (this.selectedAdminId) {
            formData.append('admin_id', this.selectedAdminId);
          }
          this.projetService.addProject(formData).subscribe({
            next: value => {
              this.project_id = value.id;
              alert("Projet créé avec succès !");
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
            },
            complete: () => {
              this.isLoading = false;
              this.creationForm.reset();
              this.submitted = false;
            }
          });
        } else {
          alert("Veuillez remplir tous les champs du projet et sélectionner une image avant de continuer.");
        }
        return;
      } else {
        this.formType = 'document';
        this.currentStep++;
      }
      return;
    }
    if (this.currentStep < 6) {
      this.currentStep++;
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
    }
  }

  onFileSelectedD(event: any) {
    this.selectedFileD = event.target.files[0];
    if (this.selectedFileD) {
      this.documentForm.patchValue({ file: this.selectedFileD.name });
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

      console.log('Ajout document - valeurs envoyées:', {
        nom_doc: this.documentForm.value.title,
        user_id: this.user_id,
        tbl_projet_id: this.project_id,
        document: this.selectedFileD ? this.selectedFileD.name : null
      });

      this.documentService.addDocument(formData).subscribe({
        next: () => {
          alert("Document ajouté avec succès !");
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
          alert("Erreur lors de l'ajout du document.");
        },
        complete: () => {
          this.isLoading = false;
          this.documentForm.reset();
        }
      });
    }

    if (this.formType === 'collaborator' && this.collaboratorForm.valid) {
      this.colService.addCollaborateur(
        this.collaboratorForm.value.name,
        this.collaboratorForm.value.email,
        this.project_id,
        this.user_id
      ).subscribe({
        next: () => {
          alert("Collaborateur ajouté !");
          this.saveC = true;
          this.collaboratorForm.reset();
        },
        error: err => {
          console.error(err);
          alert("Erreur lors de l'ajout du collaborateur.");
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    }

    if (this.formType === 'admin' && this.adminForm.valid) {
      // Soumission stricte du projet à l'admin sélectionné
      const adminId = this.adminForm.value.admin;
      if (!adminId) {
        alert("Veuillez sélectionner un administrateur avant de soumettre le projet.");
        this.isLoading = false;
        return;
      }
      if (!this.project_id) {
        alert("Projet non créé. Impossible de soumettre à un admin.");
        this.isLoading = false;
        return;
      }
      this.projetService.assignAdminToProject(this.project_id, adminId).subscribe({
        next: (response) => {
          this.adminAdded = true;
          console.log('Réponse backend assignation admin:', response);
          alert('Projet soumis à l\'administrateur avec succès !');
          this.dialogRef.close();
          window.location.reload();
        },
        error: err => {
          console.error('Erreur backend assignation admin:', err);
          this.adminAdded = false;
          alert('Erreur lors de la soumission à l\'administrateur.');
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    }
}
}
