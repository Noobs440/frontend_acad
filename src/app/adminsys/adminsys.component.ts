import { Component } from '@angular/core';
@Component({
  selector: 'app-adminsys',
  templateUrl: './adminsys.component.html',
  styleUrl: './adminsys.component.css'
})
export class AdminsysComponent {
  showTraces = false;
  selectedProjectId = 1; // Remplacez par l'id du projet à afficher dynamiquement si besoin
}
