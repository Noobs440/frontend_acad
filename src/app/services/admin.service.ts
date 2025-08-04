import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private apiUrl = 'http://localhost:8000/api/admins'; 
  constructor(private http: HttpClient) {}
  getAdmins(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}
