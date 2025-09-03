import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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
export class CommentService {

  private apiUrl = 'https://backend-acad.onrender.com/api';

  constructor(private http: HttpClient) { }

  getComments(projectId: number, page: number = 1, perPage: number = 6): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/projects/${projectId}/comments?page=${page}&per_page=${perPage}`);
  }

  addComment(projectId: number, data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/projects/${projectId}/comments`, data);
  }
getUserCommentConversations(userId: number): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/user/${userId}/comment-conversations`);
}


}
