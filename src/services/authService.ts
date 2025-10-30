const API_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
  lastLogin?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data?: {
    user: User;
    token: string;
  };
  error?: string;
}

export interface APIKey {
  id: string;
  userId: string;
  name: string;
  isActive: boolean;
  lastUsed: string | null;
  usageCount: number;
  permissions: {
    analyze: boolean;
    riskScore: boolean;
    fullAnalysis: boolean;
    batch: boolean;
    registration: boolean;
  };
  rateLimit: {
    requestsPerDay: number;
    requestsPerMinute: number;
  };
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface APIKeyCreateResponse {
  success: boolean;
  message?: string;
  data?: {
    apiKey: string; // Full key only shown once
    name: string;
    id: string;
    permissions: any;
    expiresAt: string | null;
    createdAt: string;
  };
  warning?: string;
  error?: string;
}

export interface APIKeyListResponse {
  success: boolean;
  count: number;
  data: APIKey[];
  error?: string;
}

class AuthService {
  // Register new user
  async register(username: string, email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (data.success && data.data?.token) {
        this.setToken(data.data.token);
        this.setUser(data.data.user);
      }

      return data;
    } catch (error) {
      return {
        success: false,
        error: 'Network error. Please try again.',
      };
    }
  }

  // Login user
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success && data.data?.token) {
        this.setToken(data.data.token);
        this.setUser(data.data.user);
      }

      return data;
    } catch (error) {
      return {
        success: false,
        error: 'Network error. Please try again.',
      };
    }
  }

  // Logout user
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // Get current user
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  // Get token
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Set token
  setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  // Set user
  setUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token;
  }

  // Create API key
  async createAPIKey(name: string, expiresInDays?: number): Promise<APIKeyCreateResponse> {
    try {
      const token = this.getToken();
      if (!token) {
        return {
          success: false,
          error: 'Not authenticated',
        };
      }

      const response = await fetch(`${API_URL}/auth/api-keys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name, expiresInDays }),
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: 'Network error. Please try again.',
      };
    }
  }

  // Get all API keys
  async getAPIKeys(): Promise<APIKeyListResponse> {
    try {
      const token = this.getToken();
      if (!token) {
        return {
          success: false,
          count: 0,
          data: [],
          error: 'Not authenticated',
        };
      }

      const response = await fetch(`${API_URL}/auth/api-keys`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        count: 0,
        data: [],
        error: 'Network error. Please try again.',
      };
    }
  }

  // Delete API key
  async deleteAPIKey(keyId: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const token = this.getToken();
      if (!token) {
        return {
          success: false,
          error: 'Not authenticated',
        };
      }

      const response = await fetch(`${API_URL}/auth/api-keys/${keyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: 'Network error. Please try again.',
      };
    }
  }

  // Update API key
  async updateAPIKey(keyId: string, updates: { name?: string; isActive?: boolean }): Promise<{ success: boolean; data?: APIKey; error?: string }> {
    try {
      const token = this.getToken();
      if (!token) {
        return {
          success: false,
          error: 'Not authenticated',
        };
      }

      const response = await fetch(`${API_URL}/auth/api-keys/${keyId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: 'Network error. Please try again.',
      };
    }
  }
}

export default new AuthService();
