import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-complete-dialog',
  templateUrl: './complete-dialog.component.html',
  styleUrl: './complete-dialog.component.css'
})

export class CompleteDialogComponent {

  confirm_message:any
  constructor(@Inject(MAT_DIALOG_DATA) public data: any){
    this.confirm_message=data.message;
  }

}
