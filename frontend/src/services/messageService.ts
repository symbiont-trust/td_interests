import type { AxiosInstance } from 'axios';

export interface PrivateMessageThread {
  id: number;
  user1Wallet: string;
  user2Wallet: string;
  subject?: string;
  lastMessageAt?: string;
  unreadCount: number;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  otherUserProfile?: {
    walletAddress: string;
    handle: string;
    country?: {
      id: number;
      name: string;
    };
    interests: Array<{
      id: number;
      name: string;
    }>;
  };
}

export interface Message {
  id: number;
  threadId: number;
  threadType: string;
  senderWallet: string;
  content: string;
  parentMessageId?: number;
  tags?: string;
  createdAt: string;
  updatedAt: string;
  replyCount: number;
  senderProfile?: {
    walletAddress: string;
    handle: string;
    country?: {
      id: number;
      name: string;
    };
    interests: Array<{
      id: number;
      name: string;
    }>;
  };
}

export interface CreateThreadRequest {
  recipientWallet: string;
  subject?: string;
  initialMessage: string;
}

export interface CreateMessageRequest {
  threadId: number;
  content: string;
  parentMessageId?: number;
  tags?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export class MessageService {
  private securedAxios: AxiosInstance;

  constructor(securedAxios: AxiosInstance, _unsecuredAxios: AxiosInstance) {
    this.securedAxios = securedAxios;
  }

  // Thread management
  async createThread(request: CreateThreadRequest): Promise<PrivateMessageThread> {
    const response = await this.securedAxios.post('/api/private-messages/threads', request);
    return response.data;
  }

  async getThreads(archived: boolean = false, page: number = 0, size: number = 10): Promise<PaginatedResponse<PrivateMessageThread>> {
    const response = await this.securedAxios.get('/api/private-messages/threads', {
      params: { archived, page, size }
    });
    return response.data;
  }

  async getThread(threadId: number): Promise<PrivateMessageThread> {
    const response = await this.securedAxios.get(`/api/private-messages/threads/${threadId}`);
    return response.data;
  }

  async archiveThread(threadId: number, archived: boolean): Promise<void> {
    await this.securedAxios.put(`/api/private-messages/threads/${threadId}/archive`, null, {
      params: { archived }
    });
  }

  async markThreadAsRead(threadId: number): Promise<void> {
    await this.securedAxios.put(`/api/private-messages/threads/${threadId}/read`);
  }

  // Message management
  async getThreadMessages(threadId: number, page: number = 0, size: number = 20): Promise<PaginatedResponse<Message>> {
    const response = await this.securedAxios.get(`/api/private-messages/threads/${threadId}/messages`, {
      params: { page, size }
    });
    return response.data;
  }

  async sendMessage(request: CreateMessageRequest): Promise<Message> {
    const response = await this.securedAxios.post('/api/private-messages/messages', request);
    return response.data;
  }

  async getMessageReplies(messageId: number, page: number = 0, size: number = 10): Promise<PaginatedResponse<Message>> {
    const response = await this.securedAxios.get(`/api/private-messages/messages/${messageId}/replies`, {
      params: { page, size }
    });
    return response.data;
  }

  // Unread counts
  async getUnreadCount(): Promise<number> {
    const response = await this.securedAxios.get('/api/private-messages/unread-count');
    return response.data;
  }

  async getUnreadThreadCount(): Promise<number> {
    const response = await this.securedAxios.get('/api/private-messages/unread-threads');
    return response.data;
  }
}