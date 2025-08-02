// cours.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CoursService {
  private apiUrl = 'votre_url_api';

  constructor(private http: HttpClient) {}

  getCours() {
    return this.http.get<any[]>(`${this.apiUrl}/cours`);
  }
}