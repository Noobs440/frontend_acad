import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CollaborateurService } from '../../services/collaborateur.service';

@Component({
  selector: 'app-collaborateur-edit-popup',
  templateUrl: './collaborateur-edit-popup.component.html',
  styleUrls: ['./collaborateur-edit-popup.component.css']
})
export class CollaborateurEditPopupComponent implements OnInit {
  editForm!: FormGroup;
  submitted = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CollaborateurEditPopupComponent>,
    private collaborateurService: CollaborateurService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.editForm = this.fb.group({
      name: [this.data?.collaborator?.nom_collab || '', Validators.required],
      email: [this.data?.collaborator?.email_collab || '', [Validators.required, Validators.email]],
    });
  }

  get f() {
    return this.editForm.controls;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.editForm.invalid) return;

    const { name, email } = this.editForm.value;
    const id = this.data.collaborator.id;
    const nom_collab= this.data.name;
    const email_collab= this.data.email;
    const tbl_projet_id = this.data.tbl_projet_id;
    const tbl_user_id = this.data.user_id;

    const updateData = {
      nom_collab: name,
      email_collab: email,
    };

    this.collaborateurService.updateCollaborateur(id, nom_collab,email_collab,tbl_projet_id,tbl_user_id).subscribe({
      next: () => alert('Collaborateur modifié avec succès'),
      error: err => {
        console.error('Erreur API complète:', err);
        if (err.error?.errors) {
          const messages = Object.values(err.error.errors).flat().join('\n');
          alert('Erreur lors de la modification :\n' + messages);
        } else if (err.error?.message) {
          alert('Message : ' + err.error.message);
        } else {
          alert('Erreur inconnue lors de la modification.');
        }
      },
      complete: () => {
        this.dialogRef.close(true);
      }
    });
  }
}
