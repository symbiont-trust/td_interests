import type { AxiosInstance } from 'axios';

export interface PublicMessageThread {
  id: number;
  title: string;
  description?: string;
  creatorWallet: string;
  creatorProfile?: UserProfile;
  lastMessageAt?: string;
  messageCount: number;
  isActive: boolean;
  isFeatured: boolean;
  interestTags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PublicMessage {
  id: number;
  threadId: number;
  senderWallet: string;
  senderProfile?: UserProfile;
  content: string;
  parentMessageId?: number;
  tags?: string;
  replyCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  walletAddress: string;
  handle: string;
}

export interface CreatePublicThread {
  title: string;
  description?: string;
  interestTags: string[];
  initialMessage: string;
}

export interface CreatePublicMessage {
  content: string;
  parentMessageId?: number;
  tags?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export class PublicMessageService {
  private securedAxios: AxiosInstance;
  private unsecuredAxios: AxiosInstance;

  constructor(
    securedAxios: AxiosInstance,
    unsecuredAxios: AxiosInstance
  ) {
    this.securedAxios = securedAxios;
    this.unsecuredAxios = unsecuredAxios;
  }

  // Get all active public threads
  async getThreads(page: number = 0, size: number = 20): Promise<PaginatedResponse<PublicMessageThread>> {
    const response = await this.unsecuredAxios.get('/api/public-threads', {
      params: { page, size }
    });
    return response.data;
  }

  // Get featured threads
  async getFeaturedThreads(page: number = 0, size: number = 20): Promise<PaginatedResponse<PublicMessageThread>> {
    const response = await this.unsecuredAxios.get('/api/public-threads/featured', {
      params: { page, size }
    });
    return response.data;
  }

  // Get popular threads
  async getPopularThreads(page: number = 0, size: number = 20): Promise<PaginatedResponse<PublicMessageThread>> {
    const response = await this.unsecuredAxios.get('/api/public-threads/popular', {
      params: { page, size }
    });
    return response.data;
  }

  // Search threads by title
  async searchThreads(query: string, page: number = 0, size: number = 20): Promise<PaginatedResponse<PublicMessageThread>> {
    const response = await this.unsecuredAxios.get('/api/public-threads/search', {
      params: { q: query, page, size }
    });
    return response.data;
  }

  // Get threads by interests
  async getThreadsByInterests(interests: string[], page: number = 0, size: number = 20): Promise<PaginatedResponse<PublicMessageThread>> {
    const response = await this.unsecuredAxios.get('/api/public-threads/by-interests', {
      params: { interests: interests.join(','), page, size }
    });
    return response.data;
  }

  // Get specific thread
  async getThread(threadId: number): Promise<PublicMessageThread> {
    const response = await this.unsecuredAxios.get(`/api/public-threads/${threadId}`);
    return response.data;
  }

  // Get thread messages
  async getThreadMessages(threadId: number, page: number = 0, size: number = 50): Promise<PaginatedResponse<PublicMessage>> {
    const response = await this.unsecuredAxios.get(`/api/public-threads/${threadId}/messages`, {
      params: { page, size }
    });
    return response.data;
  }

  // Get message replies
  async getMessageReplies(messageId: number, page: number = 0, size: number = 20): Promise<PaginatedResponse<PublicMessage>> {
    const response = await this.unsecuredAxios.get(`/api/public-threads/messages/${messageId}/replies`, {
      params: { page, size }
    });
    return response.data;
  }

  // Create new thread (requires authentication)
  async createThread(createData: CreatePublicThread): Promise<PublicMessageThread> {
    const response = await this.securedAxios.post('/api/public-threads', createData);
    return response.data;
  }

  // Send message to thread (requires authentication)
  async sendMessage(threadId: number, messageData: CreatePublicMessage): Promise<PublicMessage> {
    const response = await this.securedAxios.post(`/api/public-threads/${threadId}/messages`, messageData);
    return response.data;
  }

  // Deactivate thread (requires authentication, creator only)
  async deactivateThread(threadId: number): Promise<void> {
    await this.securedAxios.patch(`/api/public-threads/${threadId}/deactivate`);
  }

  // Toggle featured status (requires authentication, admin only)
  async toggleFeaturedStatus(threadId: number): Promise<void> {
    await this.securedAxios.patch(`/api/public-threads/${threadId}/toggle-featured`);
  }
}