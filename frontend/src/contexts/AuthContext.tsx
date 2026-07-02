import React, { createContext, useState, useEffect, useContext } from 'react';
import { apiCall } from '../utils/api';

export type UserRole = 'ADMIN' | 'STUDENT' | 'FACULTY' | 'RECRUITER';

export interface UserSession {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  profileId: string | null; // e.g. student.id or faculty.id
  details?: {
    rollNo?: string;
    departmentId?: string;
    cgpa?: number;
    companyId?: string;
    companyName?: string;
    designation?: string;
  };
}

interface AuthContextType {
  user: UserSession | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<UserSession>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('cc_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkSession() {
      const savedToken = localStorage.getItem('cc_token');
      if (!savedToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await apiCall<{ user: UserSession }>('/auth/me');
        setUser(response.user);
      } catch (err) {
        console.error('Session restore failed:', err);
        logout();
      } finally {
        setLoading(false);
      }
    }
    checkSession();
  }, []);

  const login = async (email: string, password: string): Promise<UserSession> => {
    try {
      const response = await apiCall<{ token: string; user: UserSession }>('/auth/login', 'POST', { email, password });
      localStorage.setItem('cc_token', response.token);
      setToken(response.token);
      setUser(response.user);
      return response.user;
    } catch (err: any) {
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('cc_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
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
