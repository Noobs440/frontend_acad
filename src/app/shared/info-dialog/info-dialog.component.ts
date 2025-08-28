import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface InfoDialogData {
  title: string;
  message: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  icon?: string;
  color?: string;
}

@Component({
  selector: 'app-info-dialog',
  templateUrl: './info-dialog.component.html',
  styleUrls: ['./info-dialog.component.css']
})
export class InfoDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: InfoDialogData) {}
}
