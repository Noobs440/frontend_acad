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
import { SuperviseurService } from '../../../services/superviseur.service';

@Component({
  selector: 'app-submit-popup',
  templateUrl: './submit-popup.component.html',
  styleUrls: ['./submit-popup.component.css'],
  providers: [DatePipe]
})
export class SubmitPopupComponent implements OnInit {
  creationForm!: FormGroup;
  documentForm!: FormGroup;
  collaboratorForm!: FormGroup;
  supervisorForm!: FormGroup;

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
    private supService: SuperviseurService,
    private colService: CollaborateurService,
    private documentService: DocumentService,
    private dialogRef: MatDialogRef<SubmitPopupComponent>,
    private fb: FormBuilder,
    private http: HttpClient,
    private datePipe: DatePipe,
    private projetService: ProjetService,
    private route: ActivatedRoute,
    private categoryService: CategoryService,
    private niveauService: NiveauService
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

    this.documentForm = this.fb.group({
      title: ['', Validators.required],
      file: ['', Validators.required],
    });

    this.collaboratorForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
    });

    this.supervisorForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
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

  get supervisorFormControl() {
    return this.supervisorForm.controls;
  }

  nextStep() {
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

    if (this.formType === 'project' && this.creationForm.valid && this.selectedFile) {
      const formData = new FormData();
      formData.append('titre_projet', this.creationForm.value.title);
      formData.append('descript_projet', this.creationForm.value.summary);
      formData.append('tbl_niveau_id', this.creationForm.value.niveau);
      formData.append('user_id', this.user_id);
      formData.append('tbl_categorie_id', this.creationForm.value.category);
      formData.append('image', this.selectedFile);
      formData.append('type', this.creationForm.value.type);

      this.projetService.addProject(formData).subscribe({
        next: value => {
          this.project_id = value.id;
          alert("Projet créé avec succès !");
        },
        error: err => {
          console.error(err);
          this.ErrorMessage = "Erreur lors de la création du projet.";
        },
        complete: () => {
          this.isLoading = false;
          this.creationForm.reset();
          this.formType = 'document';
          this.currentStep++;
          this.submitted = false;
        }
      });
    } else if (this.formType === 'project') {
      this.ErrorMessage = "Erreur lors de la création. Vérifiez les champs.";
      this.isLoading = false;
    }

    if (this.formType === 'document' && this.documentForm.valid && this.selectedFileD) {
      const formData = new FormData();
      formData.append('nom_doc', this.documentForm.value.title);
      formData.append('user_id', this.user_id);
      formData.append('tbl_projet_id', this.project_id);
      formData.append('document', this.selectedFileD);

      this.documentService.addDocument(formData).subscribe({
        next: () => {
          alert("Document ajouté avec succès !");
          this.saveD = true;
        },
        error: err => {
          console.error(err);
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

    if (this.formType === 'supervisor' && this.supervisorForm.valid) {
      this.supService.addSuperviseur(
        this.supervisorForm.value.name,
        this.supervisorForm.value.email
      ).subscribe({
        next: () => {
          alert("Superviseur ajouté !");
          this.saveS = true;
          this.supervisorForm.reset();
        },
        error: err => {
          console.error(err);
          alert("Erreur lors de l'ajout du superviseur.");
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    }
  }
}
