import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
// import CommentService if still needed, else remove
import { ChatService } from '../services/chat.service';

@Component({
  selector: 'app-floating-chat',
  templateUrl: './floating-chat.component.html',
  styleUrls: ['./floating-chat.component.css']
})
export class FloatingChatComponent implements OnInit {
  isOpen = false;
  isLoggedIn = false;

  commentConversations: any[] = [];
  activeCommentConversation: any = null;
  newMessage = '';

  unreadCount = 0;

  constructor(
    private userService: UserService,
    private chatService: ChatService,
  ) {}

  ngOnInit(): void {
    this.userService.isUserLoggedIn$().subscribe(status => {
      this.isLoggedIn = status;
      if (status) {
        const userId = this.userService.getCurrentUserId();
        if (userId) {
          this.loadCommentConversations(userId);
        }
      } else {
        this.commentConversations = [];
        this.activeCommentConversation = null;
      }
    });
    this.userService.loadUserProfile();
  }

  toggleOpen() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.unreadCount = 0; // reset badge when chat is opened
    }
  }

  selectCommentConversation(conv: any) {
    this.activeCommentConversation = conv;
    // Marquer tous les messages comme lus pour cette conversation
    if (conv && conv.messages) {
      conv.messages.forEach((msg: any) => msg.isRead = true);
      this.updateUnreadCount();
    }
  }

  sendMessage() {
    if (!this.newMessage.trim() || !this.activeCommentConversation) return;

    const projectId = this.activeCommentConversation.projectId;
    const content = this.newMessage.trim();

    this.chatService.sendMessage(projectId, content).subscribe({
      next: (newComment) => {
        this.activeCommentConversation.messages.push({
          id: newComment.id,
          authorName: newComment.user?.name || 'Moi',
          content: newComment.content,
          timestamp: new Date(newComment.created_at),
          isFromCurrentUser: true,
          isRead: true
        });
        this.newMessage = '';
      },
      error: (err) => {
        console.error('Erreur lors de l\'envoi du message', err);
      }
    });
  }

  loadCommentConversations(userId: number) {
    this.userService.getUserCommentConversations(userId).subscribe(convs => {
      const currentUserId = this.userService.getCurrentUserId();
      this.commentConversations = (convs || []).filter(c => c.messages && c.messages.length > 0)
        .map(conv => ({
          ...conv,
          messages: conv.messages.map((msg: any) => ({
            ...msg,
            isFromCurrentUser: msg.user_id === currentUserId
          }))
        }));
      this.updateUnreadCount();
      if (this.commentConversations.length > 0) {
        this.selectCommentConversation(this.commentConversations[0]);
      }
    });
  }

  updateUnreadCount() {
    // Compte les messages non lus (exemple simple : tous sauf ceux de l'utilisateur courant)
    this.unreadCount = this.commentConversations.reduce((acc, conv) => {
      return acc + (conv.messages ? conv.messages.filter((msg: any) => !msg.isRead && !msg.isFromCurrentUser).length : 0);
    }, 0);
  }
}
