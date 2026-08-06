import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ActivityLog {
  id: number;
  user_id: number | null;
  subject_type: string | null;
  subject_id: number | null;
  event: string;
  description: string | null;
  old_values: any;
  new_values: any;
  url: string | null;
  method: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ActivityLogService {
  private apiUrl = 'https://dschangschoolhub.ddns.net/api/activity-logs';

  constructor(private http: HttpClient) {}

  getLogs(filters: any = {}, page: number = 1, perPage: number = 20): Observable<any> {
    let params = new HttpParams()
      .set('page', page)
      .set('per_page', perPage);

    Object.keys(filters).forEach(key => {
      params = params.set(key, filters[key]);
    });

    return this.http.get<any>(this.apiUrl, { params });
  }

  getLogById(id: number): Observable<ActivityLog> {
    return this.http.get<ActivityLog>(`${this.apiUrl}/${id}`);
  }
}
