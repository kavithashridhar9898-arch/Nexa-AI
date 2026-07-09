import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  apiFetch: <T = any>(endpoint: string, options?: RequestInit) => Promise<T>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('nx_token'));
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage if exists
  useEffect(() => {
    const storedUser = localStorage.getItem('nx_user');
    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse stored user profile', e);
        logout();
      }
    }
    setIsLoading(false);
  }, [token]);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('nx_token', newToken);
    localStorage.setItem('nx_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('nx_token');
    localStorage.removeItem('nx_user');
    setToken(null);
    setUser(null);
  };

  const API_URL = import.meta.env.VITE_API_URL || '/api';

  const apiFetch = async <T = any>(endpoint: string, options: RequestInit = {}): Promise<T> => {
    const headers = new Headers(options.headers || {});
    
    // Add content type if not set and body is present
    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    // Add JWT authorization header
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Something went wrong with the request.');
    }

    return data as T;
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated, isLoading, login, logout, apiFetch }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
