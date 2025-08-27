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

export interface RegisterData {
  walletAddress: string;
  handle: string;
  signature: string;
  message: string;
  countryId?: number;
  locationTags?: string[];
  interestIds: number[];
}

export interface AuthResponse {
  success: boolean;
  message: string;
  accessToken?: string;
  refreshToken?: string;
  walletAddress?: string;
  handle?: string;
}

export interface ChallengeResponse {
  message: string;
  walletAddress: string;
}

export class AuthService {
  // private securedAxios: AxiosInstance; // For authenticated requests (future use)
  private unsecuredAxios: AxiosInstance;
  
  constructor(_securedAxios: AxiosInstance, unsecuredAxios: AxiosInstance) {
    // this.securedAxios = securedAxios; // Will be used for authenticated requests
    this.unsecuredAxios = unsecuredAxios;
  }

  async getChallenge(walletAddress: string): Promise<ChallengeResponse> {
    const response = await this.unsecuredAxios.get(`/api/auth/challenge/${walletAddress}`);
    return response.data;
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await this.unsecuredAxios.post('/api/auth/register', data);
    return response.data;
  }

  async login(walletAddress: string, signature: string, message: string): Promise<AuthResponse> {
    const response = await this.unsecuredAxios.post('/api/auth/login', {
      walletAddress,
      signature,
      message
    });
    return response.data;
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await this.unsecuredAxios.post('/api/auth/refresh', {
      refreshToken
    });
    return response.data;
  }
}

export class DataService {
  private unsecuredAxios: AxiosInstance;
  
  constructor(unsecuredAxios: AxiosInstance) {
    this.unsecuredAxios = unsecuredAxios;
  }

  async getCountries(): Promise<Country[]> {
    const response = await this.unsecuredAxios.get('/api/countries');
    return response.data;
  }

  async getInterestTags(): Promise<InterestTag[]> {
    const response = await this.unsecuredAxios.get('/api/interest-tags');
    return response.data;
  }

  async searchInterestTags(query: string): Promise<InterestTag[]> {
    const response = await this.unsecuredAxios.get(`/api/interest-tags/search?query=${encodeURIComponent(query)}`);
    return response.data;
  }
}