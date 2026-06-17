import { Component, Inject } from '@angular/core';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { CustomvalidationService } from '../../../services/customvalidation.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { UserService } from '../../../services/user.service';
import { FiliereService } from '../../../services/filiere.service';
import { LoginPopupComponent } from '../login-popup/login-popup.component';

@Component({
  selector: 'app-register',
  templateUrl: './register-popup.component.html',
  styleUrl: './register-popup.component.css'
})
export class RegisterComponent {
  registerForm!: FormGroup;
  submitted = false;
  showCodeInput = false;
  codeForm!: FormGroup;
  filiere_name: any = [];
  filiere_id: any = [];
  filiere!: any[];
  private emailsaved: any;
  successMessage: string = '';
  successImage: string = 'assets/img/success.jpg';

  constructor(
    private dialogRef: MatDialogRef<RegisterComponent>,
    private fb: FormBuilder,
    private customValidator: CustomvalidationService,
    private userService: UserService,
    private filiereService: FiliereService,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required], ],
      matricule: ['',[Validators.required,Validators.pattern(/^CM-UDS-\d{2}[A-Z]{2,5}\d{4}$/)]],
      password: ['', Validators.compose([Validators.required, this.customValidator.patternValidator()])],
      confirmPassword: ['', [Validators.required]],
      filiere: ['', [Validators.required]],
    },
      {
        validator: this.customValidator.MatchPassword('password', 'confirmPassword'),
      }
    );

    this.codeForm = this.fb.group({
      verificationCode: ['', Validators.required]
    });

    this.filiereService.getFilieres().subscribe(filiere => {
      this.filiere = filiere;
      for (var k = 0; k < this.filiere.length; k++) {
        this.filiere_id.push([this.filiere[k].id]);
      }
      for (var k = 0; k < this.filiere.length; k++) {
        this.filiere_name.push([this.filiere[k].nom_fil]);
      }
    });
  }

  currentStep = 1;
  nextStep() {
    this.currentStep++;
  }

  previousStep() {
    this.currentStep--;
  }

  get registerFormControl() {
    return this.registerForm.controls;
  }

  get codeFormControl() {
    return this.codeForm.controls;
  }

  onCancel() {
    this.dialogRef.close();
  }
  isLoading = false;
  verifyAccountMessage: string = '';
  onSubmit() {
    this.submitted = true;
    this.isLoading = true;
    if (this.registerForm.valid) {
      this.userService.inscription(this.registerForm.value.username, this.registerForm.value.email, this.registerForm.value.password, this.registerForm.value.filiere,this.registerForm.value.matricule).subscribe({
        next: value => {

        },
        error: err => {
          if (err.status === 429) {
            this.verifyAccountMessage = err.error?.message ?? 'Trop de requêtes. Veuillez patienter.';
          } else {
            this.verifyAccountMessage = "Ce compte d'utilisateur existe deja";
          }
          this.isLoading = false;
        },
        complete: () => {
          this.showCodeInput = true;
          this.emailsaved = this.registerForm.value.email;
          this.isLoading = false;
        }
      });
    }
  }

  submitted2: boolean = false;
  verifyCodeErrorMessage = "";

onVerifyCode() {
  this.isLoading = true;
  this.submitted2 = true;

  if (this.codeForm.valid) {
    const verificationPayload = {
      email: this.emailsaved,
      code: this.codeForm.value.verificationCode,
      nom_user: this.registerForm.value.username,
      password: this.registerForm.value.password,
      tbl_filiere_id: this.registerForm.value.filiere,
      matricule: this.registerForm.value.matricule
    };

    this.userService.verifycode(
      verificationPayload.email,
      verificationPayload.code,
      verificationPayload.nom_user,
      verificationPayload.password,
      verificationPayload.tbl_filiere_id,
      verificationPayload.matricule
    ).subscribe({
      next: value => {

      },
      error: err => {
        if (err.status === 429) {
          this.verifyCodeErrorMessage = err.error?.message ?? 'Trop de requêtes. Veuillez patienter.';
        } else {
          this.verifyCodeErrorMessage = "Code de vérification invalide ou informations incorrectes.";
        }
        this.isLoading = false;
      },
      complete: () => {
        this.successMessage = "Votre compte a été créé avec succès!";
        this.showCodeInput = false;
        this.isLoading = false;
      }
    });
  }
}


  openDialog(): void {
    const dialogRef = this.dialog.open(LoginPopupComponent, {
      width: '387px',
      height: '600px',
    });

    dialogRef.afterClosed().subscribe(result => {

    });
  }
  openLoginDialog(): void {
  this.dialogRef.close();
  this.dialog.open(LoginPopupComponent, {
    width: '400px',
    disableClose: true
  });
}
}
