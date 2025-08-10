import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CommentService } from '../services/comment.service';

@Component({
  selector: 'app-comment-zone',
  templateUrl: './comment-zone.component.html',
  styleUrls: ['./comment-zone.component.scss']
})
export class CommentZoneComponent implements OnInit {
  @Input() projectId!: number;
  @Input() userId!: number;
  comments: any[] = [];
  commentForm: FormGroup;
  loading = false;
  fileToUpload: File | null = null;

  constructor(private commentService: CommentService, private fb: FormBuilder) {
    this.commentForm = this.fb.group({
      content: [''],
      file: [null]
    });
  }

  ngOnInit() {
    this.loadComments();
  }

  loadComments() {
    this.loading = true;
    this.commentService.getComments(this.projectId).subscribe((comments: any) => {
      this.comments = comments;
      this.loading = false;
    });
  }

  onFileChange(event: any) {
    this.fileToUpload = event.target.files[0];
  }

  submitComment(parentId: number | null = null) {
    const formData = new FormData();
    formData.append('content', this.commentForm.value.content);
    formData.append('project_id', this.projectId.toString());
    if (parentId) formData.append('parent_id', parentId.toString());
    if (this.fileToUpload) formData.append('file', this.fileToUpload);
    this.commentService.addComment(formData).subscribe(() => {
      this.commentForm.reset();
      this.fileToUpload = null;
      this.loadComments();
    });
  }

  react(commentId: number, type: string) {
    this.commentService.react(commentId, type).subscribe(() => this.loadComments());
  }

  deleteComment(id: number) {
    this.commentService.deleteComment(id).subscribe(() => this.loadComments());
  }

  getReactionCount(comment: any, type: string): number {
    if (!comment.reactions) return 0;
    return comment.reactions.filter((r: any) => r.type === type).length;
  }
}
