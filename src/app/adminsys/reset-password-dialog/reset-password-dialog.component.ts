import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserManagementService } from '../../services/user-management.service';

@Component({
  selector: 'app-reset-password-dialog',
  templateUrl: './reset-password-dialog.component.html'
})
export class ResetPasswordDialogComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private userManagementService: UserManagementService,
    private dialogRef: MatDialogRef<ResetPasswordDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.form = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.form.valid) {
      this.userManagementService.resetPassword(this.data.user.id, this.form.value.password)
        .subscribe(() => this.dialogRef.close(true));
    }
  }

  onCancel() {
    this.dialogRef.close(false);
  }
}
