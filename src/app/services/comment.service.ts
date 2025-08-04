import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CommentService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  getComments(projectId: number) {
    return this.http.get(`${this.apiUrl}/comments?project_id=${projectId}`);
  }

  addComment(data: FormData) {
    return this.http.post(`${this.apiUrl}/comments`, data);
  }

  react(commentId: number, type: string) {
    return this.http.post(`${this.apiUrl}/comments/${commentId}/react`, { type });
  }

  countComments(projectId: number) {
    return this.http.get(`${this.apiUrl}/comments-count?project_id=${projectId}`);
  }

  deleteComment(id: number) {
    return this.http.delete(`${this.apiUrl}/comments/${id}`);
  }
}
