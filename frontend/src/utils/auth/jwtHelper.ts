const JWT_TOKEN_KEY = 'my_interests_jwt_token';
const REFRESH_TOKEN_KEY = 'my_interests_refresh_token';
const WALLET_ADDRESS_KEY = 'my_interests_wallet_address';

export const jwtHelper = {
  getJWTToken(): string | null {
    return localStorage.getItem(JWT_TOKEN_KEY);
  },

  setJWTToken(token: string): void {
    localStorage.setItem(JWT_TOKEN_KEY, token);
  },

  removeJWTToken(): void {
    localStorage.removeItem(JWT_TOKEN_KEY);
  },

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  setRefreshToken(token: string): void {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  },

  removeRefreshToken(): void {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  getWalletAddress(): string | null {
    return localStorage.getItem(WALLET_ADDRESS_KEY);
  },

  setWalletAddress(address: string): void {
    localStorage.setItem(WALLET_ADDRESS_KEY, address);
  },

  removeWalletAddress(): void {
    localStorage.removeItem(WALLET_ADDRESS_KEY);
  },

  clearAll(): void {
    this.removeJWTToken();
    this.removeRefreshToken();
    this.removeWalletAddress();
  },

  isTokenExpired(token: string | null): boolean {
    if (!token) return true;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Date.now() / 1000;
      return payload.exp < now;
    } catch {
      return true;
    }
  }
};