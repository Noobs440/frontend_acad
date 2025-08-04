import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommentZoneComponent } from './comment-zone.component';

@NgModule({
  declarations: [CommentZoneComponent],
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  exports: [CommentZoneComponent]
})
export class CommentZoneModule {}
