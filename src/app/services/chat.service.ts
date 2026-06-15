import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Comment {
  id: number;
  project_id: number;
  user_id: number | null;
  visitor_name: string | null;
  visitor_email: string | null;
  content: string;
  created_at: string;
  user?: { name: string };
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private apiUrl = 'https://uds-faculte-des-sciences.netlify.app//api';

  constructor(private http: HttpClient) { }
  sendMessage(projectId: number, content: string): Observable<Comment> {
    return this.http.post<Comment>(`${this.apiUrl}/projects/${projectId}/chat-comments`, { content });
  }
}
