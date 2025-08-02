// etudiant.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EtudiantService {
  private apiUrl = 'votre_url_api';

  constructor(private http: HttpClient) {}

  getEtudiants() {
    return this.http.get<any[]>(`${this.apiUrl}/etudiants`);
  }
}
