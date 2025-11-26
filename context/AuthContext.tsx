import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User } from '../types';
import { DataService } from '../services/dataService';

interface AuthContextType {
  user: User | null;
  login: (email: string, pass: string, refCode?: string) => Promise<boolean>;
  register: (data: any) => Promise<boolean>;
  logout: () => void;
  updateUserSession: (data: Partial<User>) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('clinic_user_session');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, pass: string, refCode?: string): Promise<boolean> => {
    try {
      const userFound = await DataService.login(email, pass, refCode);
      if (userFound) {
        setUser(userFound);
        localStorage.setItem('clinic_user_session', JSON.stringify(userFound));
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  const register = async (data: any): Promise<boolean> => {
    try {
      const newUser = await DataService.register(data);
      if (newUser) {
        setUser(newUser);
        localStorage.setItem('clinic_user_session', JSON.stringify(newUser));
        return true;
      }
    } catch(e) {
      console.error(e);
    }
    return false;
  }

  const logout = () => {
    setUser(null);
    localStorage.removeItem('clinic_user_session');
  };

  const updateUserSession = (data: Partial<User>) => {
    if (user) {
      const updated = { ...user, ...data };
      setUser(updated);
      localStorage.setItem('clinic_user_session', JSON.stringify(updated));
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUserSession, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};