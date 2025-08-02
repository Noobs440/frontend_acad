import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-pdf-preview',
  templateUrl: './pdf-preview.component.html',
  styleUrl: './pdf-preview.component.css'
})
export class PdfPreviewComponent {
  @Input() pdfSrc!: string;

  constructor() { }
}
