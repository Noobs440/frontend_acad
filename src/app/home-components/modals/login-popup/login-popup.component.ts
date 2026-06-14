import { Component, OnInit } from '@angular/core';
import { RegisterComponent } from '../register-popup/register-popup.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
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
export class LoginPopupComponent implements OnInit {
  loginForm!: FormGroup;
  resetForm!: FormGroup;
  resetRequestForm!: FormGroup;
  verificationForm!: FormGroup;

  errorMessage = '';
  successMessage = '';
  isLoading = false;
  submitted = false;
  showVerification = false;
  showPasswordReset = false;
  showResetPasswordForm = false;
  showSuccessMessage = false;
  showPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private dialogRef: MatDialogRef<LoginPopupComponent>,
    public dialog: MatDialog,
    private fb: FormBuilder,
    private customValidator: CustomvalidationService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, this.customValidator.patternValidator()]]
    });

    this.resetRequestForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    this.verificationForm = this.fb.group({
      verificationCode: ['', Validators.required]
    });

    this.resetForm = this.fb.group({
      newPassword: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    }, {
      validators: this.customValidator.MatchPassword('newPassword', 'confirmPassword')
    });
  }

  get loginFormControl()        { return this.loginForm.controls; }
  get resetRequestFormControl() { return this.resetRequestForm.controls; }
  get verificationFormControl() { return this.verificationForm.controls; }
  get resetFormControl()        { return this.resetForm.controls; }

  onSubmit() {
    this.submitted = true;
    this.errorMessage = '';

    if (this.loginForm.invalid) return;

    this.isLoading = true;
    const { email, password } = this.loginForm.value;

    this.userService.login(email, password).subscribe({
      next: (value) => {
        // On stocke via AuthService — plus de localStorage direct
        this.authService.setSession(value.access_token, {
          id: value.id,
          username: value.username,
          role: value.role
        });

        this.dialogRef.close();
        this.redirectUserByRole(value.role);
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Adresse email ou mot de passe invalide.';
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  onSendVerificationCode() {
    this.submitted = true;
    if (this.resetRequestForm.invalid) return;

    this.isLoading = true;
    this.userService.sendVerificationCode(this.resetRequestForm.value.email).subscribe({
      next: () => { this.showVerification = true; },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Erreur lors de l\'envoi du code de vérification.';
      },
      complete: () => { this.isLoading = false; }
    });
  }

  onVerifyCode() {
    this.submitted = true;
    if (this.verificationForm.invalid) return;

    this.isLoading = true;
    const { email } = this.resetRequestForm.value;
    const { verificationCode } = this.verificationForm.value;

    this.userService.verifyResetcode(email, verificationCode).subscribe({
      next: () => { this.showResetPasswordForm = true; },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Code de vérification invalide.';
      },
      complete: () => { this.isLoading = false; }
    });
  }

  onResetPassword() {
    this.submitted = true;
    if (this.resetForm.invalid) return;

    this.isLoading = true;
    const email = this.resetRequestForm.value.email;
    const { newPassword, verificationCode } = {
      newPassword: this.resetForm.value.newPassword,
      verificationCode: this.verificationForm.value.verificationCode
    };

    this.userService.resetPassword(email, newPassword, verificationCode).subscribe({
      next: () => {
        this.showSuccessMessage = true;
        this.successMessage = 'Votre mot de passe a été réinitialisé avec succès.';
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Aucun utilisateur trouvé avec cette adresse email.';
      },
      complete: () => { this.isLoading = false; }
    });
  }

  private redirectUserByRole(role: string) {
    switch (role) {
      case 'admin':     this.router.navigate(['/admin/dashboard']); break;
      case 'adminsys':  this.router.navigate(['/adminsys']); break;
      case 'user':      this.router.navigate(['/user/dashboard']); break;
      default:          this.router.navigate(['/unauthorized']); break;
    }
  }

  onCancel() { this.dialogRef.close(); }

  openRegisterDialog(): void {
    this.dialogRef.close();
    this.dialog.open(RegisterComponent, { width: '387px', height: '600px' });
  }

  openForgetPasswordDialog(): void {
    this.dialogRef.close();
    this.dialog.open(ForgetPasswordComponent, { width: '400px', height: '500px' });
  }
}