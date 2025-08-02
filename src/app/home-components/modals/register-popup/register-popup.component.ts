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
          console.log(value);
        },
        error: err => {
          console.error(err);
          this.verifyAccountMessage = "Ce compte d'utilisateur existe deja";
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
      this.userService.verifycode(this.emailsaved, this.codeForm.value.verificationCode).subscribe({
        next: value => {
          console.log(value);
        },
        error: err => {
          console.error(err);
          console.log(this.emailsaved);
          console.log(this.codeForm.value.verificationCode);
          this.verifyCodeErrorMessage = "code de verification invalide";
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
      console.log('The dialog was closed');
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
