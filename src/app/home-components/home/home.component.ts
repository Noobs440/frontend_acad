import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  isLoading = true;

  sectionClass: string = 'recent-posts section';
  ngOnInit(): void {
     this.sectionClass = 'different-class';

    setTimeout(() => {
      this.isLoading = false;
    }, 300); // 30 seconds
  }
   getFullImageUrl(projectImage: string): string {
    if (!projectImage) {
      return '';
    }
    return projectImage.startsWith('http') ? projectImage : `http://localhost:8000/${projectImage.replace(/^\/+/, '')}`;
  }
}
