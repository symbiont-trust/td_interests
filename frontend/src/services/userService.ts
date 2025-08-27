import type { AxiosInstance } from 'axios';

export interface Country {
  id: number;
  name: string;
  continent: {
    id: number;
    name: string;
  };
}

export interface InterestTag {
  id: number;
  name: string;
}

export interface UserProfile {
  walletAddress: string;
  handle: string;
  country?: Country;
  locationTags: LocationTag[];
  interests: InterestTag[];
  createdAt: string;
  updatedAt: string;
}

export interface LocationTag {
  id: number;
  tagName: string;
}

export interface SearchFilters {
  interests?: number[];
  locationTags?: string[];
  country?: number;
}

export interface SearchResult {
  users: UserProfile[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface MutualConnection {
  walletAddress: string;
  handle: string;
  commonInterests: InterestTag[];
}

export interface ConnectionRequest {
  id: number;
  requesterWallet: string;
  recipientWallet: string;
  status: 'PENDING' | 'ACCEPTED' | 'DISMISSED';
  commonInterests: InterestTag[];
  createdAt: string;
  requesterProfile?: UserProfile;
  recipientProfile?: UserProfile;
}

export class UserService {
  private securedAxios: AxiosInstance;
  // private unsecuredAxios: AxiosInstance; // For future public endpoints

  constructor(securedAxios: AxiosInstance, _unsecuredAxios: AxiosInstance) {
    this.securedAxios = securedAxios;
    // this.unsecuredAxios = unsecuredAxios;
  }

  async getCurrentUser(): Promise<UserProfile> {
    const response = await this.securedAxios.get('/api/users/profile');
    return response.data;
  }

  async searchUsers(filters: SearchFilters, page: number = 0, size: number = 10): Promise<SearchResult> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('size', size.toString());
    
    if (filters.interests && filters.interests.length > 0) {
      filters.interests.forEach(id => params.append('interests', id.toString()));
    }
    
    if (filters.locationTags && filters.locationTags.length > 0) {
      filters.locationTags.forEach(tag => params.append('locationTags', tag));
    }
    
    if (filters.country) {
      params.append('country', filters.country.toString());
    }

    const response = await this.securedAxios.get(`/api/users/search?${params.toString()}`);
    return response.data;
  }

  async getUserProfile(walletAddress: string): Promise<UserProfile> {
    const response = await this.securedAxios.get(`/api/users/${walletAddress}`);
    return response.data;
  }

  async getMutualConnections(walletAddress: string): Promise<MutualConnection[]> {
    const response = await this.securedAxios.get(`/api/users/${walletAddress}/mutual-connections`);
    return response.data;
  }

  async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    const response = await this.securedAxios.put('/api/users/profile', data);
    return response.data;
  }

  // Connection-related methods
  async sendConnectionRequest(recipientWallet: string): Promise<ConnectionRequest> {
    const response = await this.securedAxios.post('/api/connections/request', {
      recipientWallet
    });
    return response.data;
  }

  async getConnectionRequests(type: 'sent' | 'received'): Promise<ConnectionRequest[]> {
    const response = await this.securedAxios.get(`/api/connections/requests/${type}`);
    return response.data;
  }

  async respondToConnectionRequest(requestId: number, action: 'ACCEPT' | 'DISMISS'): Promise<ConnectionRequest> {
    const response = await this.securedAxios.put(`/api/connections/requests/${requestId}`, {
      action
    });
    return response.data;
  }

  async getConnections(): Promise<ConnectionRequest[]> {
    const response = await this.securedAxios.get('/api/connections');
    return response.data;
  }

  async removeConnection(connectionId: number): Promise<void> {
    await this.securedAxios.delete(`/api/connections/${connectionId}`);
  }
}