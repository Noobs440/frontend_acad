import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface InfoDialogData {
  title: string;
  message: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  icon?: string;
  color?: string;
  type?: 'success' | 'error' | 'warning' | 'info';
}

@Component({
  selector: 'app-info-dialog',
  templateUrl: './info-dialog.component.html',
  styleUrls: ['./info-dialog.component.css']
})
export class InfoDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: InfoDialogData,
    public dialogRef: MatDialogRef<InfoDialogComponent>
  ) {
    // Déterminer le type selon le titre
    if (!this.data.type) {
      const titleLower = this.data.title?.toLowerCase() || '';
      if (titleLower.includes('succès') || titleLower.includes('success')) {
        this.data.type = 'success';
      } else if (titleLower.includes('erreur') || titleLower.includes('error')) {
        this.data.type = 'error';
      } else if (titleLower.includes('attention') || titleLower.includes('warning')) {
        this.data.type = 'warning';
      } else {
        this.data.type = 'info';
      }
    }
  }

  getIconName(): string {
    const iconMap: Record<string, string> = {
      success: 'check_circle',
      error: 'error',
      warning: 'warning',
      info: 'info'
    };
    return iconMap[this.data.type || 'info'] || 'info';
  }

  getIconColor(): string {
    const colorMap: Record<string, string> = {
      success: 'primary',
      error: 'warn',
      warning: 'accent',
      info: 'primary'
    };
    return colorMap[this.data.type || 'info'] || 'primary';
  }

  getIconClass(): string {
    const classMap: Record<string, string> = {
      success: 'icon-success',
      error: 'icon-error',
      warning: 'icon-warning',
      info: 'icon-info'
    };
    return classMap[this.data.type || 'info'] || 'icon-info';
  }

  onClose(): void {
    this.dialogRef.close(true);
  }
}
