import { Component } from '@angular/core';
import { RegisterComponent } from '../register-popup/register-popup.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { InfoDialogComponent } from '../../../shared/info-dialog/info-dialog.component';
import { CustomvalidationService } from '../../../services/customvalidation.service';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { ForgetPasswordComponent } from '../forget-password/forget-password.component';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-login-popup',
  templateUrl: './login-popup.component.html',
  styleUrls: ['./login-popup.component.css']
})
export class LoginPopupComponent {
  password !: string;
  email !: string;
  user: any;
  loginForm!: FormGroup;
  codeForm!: FormGroup;
  errorMessage = '';
  resetForm!: FormGroup;
  showPasswordReset = false;
  submitted3 = false;
  isLoading: boolean = false;
  resetRequestForm!: FormGroup;
  verificationForm!: FormGroup;
  submitted = false;
  showVerification = false;
  showResetPasswordForm = false;
  showSuccessMessage = false;
  successMessage = '';

  // Ajout de la variable pour afficher / masquer le mot de passe
  showPassword: boolean = false;       // Pour le champ mot de passe du login
  showNewPassword: boolean = false;    // Pour le nouveau mot de passe (reset)
  showConfirmPassword: boolean = false; // Pour la confirmation du mot de passe (reset)


  constructor(
    private router: Router,
    private authService: AuthService,
    private dialogRef: MatDialogRef<LoginPopupComponent>,
    public dialog: MatDialog,
    private fb: FormBuilder,
    private customValidator: CustomvalidationService,
    private userService: UserService
  ) { }

  ngOnInit() {
    this.resetRequestForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
    this.verificationForm = this.fb.group({
      verificationCode: ['', Validators.required]
    });
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.compose([Validators.required, this.customValidator.patternValidator()])]
    }, {
      validator: this.customValidator.MatchPassword('password', 'confirmPassword')
    });

    this.resetForm = this.fb.group({
      newPassword: ['', Validators.required],
      confirmPassword: ['', [Validators.required,]]
    },
      {
        validator: this.customValidator.MatchPassword('newPassword', 'confirmPassword'),
      }
    );
  }

  get loginFormControl() {
    return this.loginForm.controls;
  }

  get resetRequestFormControl() {
    return this.resetRequestForm.controls;
  }

  get verificationFormControl() {
    return this.verificationForm.controls;
  }

  get resetFormControl() {
    return this.resetForm.controls;
  }

  onResetPassword() {
    this.submitted = true;
    if (this.resetForm.invalid) {
      return;
    }
    this.isLoading = true;
    const email = this.resetRequestForm.value.email;
    const newPassword = this.resetForm.value.newPassword;
    const verificationCode = this.verificationForm.value.verificationCode;

    this.userService.resetPassword(email, newPassword, verificationCode).subscribe({
      next: () => {
        this.showSuccessMessage = true;
        this.successMessage = 'Votre mot de passe a été réinitialisé avec succès.';
      },
      error: err => {
        console.error(err);
        this.isLoading = false;
        this.errorMessage = 'Aucun utilisateur trouver avec cette adresse email';
        this.dialog.open(InfoDialogComponent, {
          width: '350px',
          data: { title: 'Erreur', message: this.errorMessage }
        });
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  onVerifyCode() {
    this.submitted = true;
    if (this.verificationForm.invalid) {
      return;
    }

    this.isLoading = true;
    const email = this.resetRequestForm.value.email;
    const verificationCode = this.verificationForm.value.verificationCode;

    this.userService.verifyResetcode(email, verificationCode).subscribe({
      next: () => {
        this.showResetPasswordForm = true;
      },
      error: err => {
        console.error(err);
        this.isLoading = false;
        this.errorMessage = 'Code de vérification invalide.';
        this.dialog.open(InfoDialogComponent, {
          width: '350px',
          data: { title: 'Erreur', message: this.errorMessage }
        });
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  onSendVerificationCode() {
    this.submitted = true;
    if (this.resetRequestForm.invalid) {
      return;
    }

    this.isLoading = true;
    const email = this.resetRequestForm.value.email;

    this.userService.sendVerificationCode(email).subscribe({
      next: () => {
        this.showVerification = true;
      },
      error: err => {
        console.error(err);
        this.isLoading = true;
        this.errorMessage = 'Erreur lors de l\'envoi du code de vérification.';
        this.dialog.open(InfoDialogComponent, {
          width: '350px',
          data: { title: 'Erreur', message: this.errorMessage }
        });
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  mustMatch(controlName: string) {
    return (formGroup: FormGroup) => {
      const control = formGroup.controls[controlName];
      const matchingControl = formGroup.controls['confirmPassword'];

      if (matchingControl.errors && !matchingControl.errors['mustMatch']) {
        return;
      }

      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ mustMatch: true });
      } else {
        matchingControl.setErrors(null);
      }
    };
  }

  onSubmit() {
    this.submitted = true;
    this.errorMessage = '';

    if (this.loginForm.invalid) {
      return;
    }

    if (this.loginForm.valid) {
      this.isLoading = true;
      this.userService.login(this.loginForm.value.email, this.loginForm.value.password).subscribe({
        next: value => {
          const userRole = value.role;
          const token = value.access_token;
          const name = value.username;
          const role = value.role;
          const id = value.id;

          localStorage.setItem('token', token);
          localStorage.setItem('name', name);
          localStorage.setItem('role', role);
          localStorage.setItem('id', id);
          localStorage.setItem('user', JSON.stringify(value.user)); // Stocker les informations de l'utilisateur

          // Rediriger l'utilisateur en fonction de son rôle
          this.redirectUserByRole(userRole);
          // Fermer le modal
          this.dialogRef.close();
        },
        error: err => {
          console.error(err);
          this.isLoading = false;
          this.errorMessage = "Addresse email ou mot de passe invalide";
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    }
  }

  private redirectUserByRole(role: string) {
    switch (role) {
      case 'admin':
        this.router.navigate(['/admin/dashboard']);
        break;
      case 'superviseur':
        this.router.navigate(['/enseignant']);
        break;
      case 'user':
        this.router.navigate(['/user/dashboard']);
        break;
      default:
        this.router.navigate(['/unauthorized']);
        break;
    }
  }

  onCancel() {
    this.dialogRef.close();
  }

  openRegisterDialog(): void {
    this.dialogRef.close(); // Close the current dialog

    const dialogRef2 = this.dialog.open(RegisterComponent, {
      width: '387px',
      height: '600px',
    });

    dialogRef2.afterClosed().subscribe(result => {
      // Dialog closed
    });
  }

  openForgetPasswordDialog(): void {
    this.dialogRef.close(); // Close the current dialog

    const dialogRef3 = this.dialog.open(ForgetPasswordComponent, {
      width: '400px',
      height: '500px'
    });

    dialogRef3.afterClosed().subscribe(result => {
      // Dialog closed
    });
  }
}
