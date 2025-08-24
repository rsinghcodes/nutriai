import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useEffect, useState } from 'react';
import client from '../api/client';

type User = {
  id: number;
  email: string;
  name: string;
  is_onboarded: boolean;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType>(
  {} as AuthContextType
);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const loadAuth = async () => {
      const storedToken = await AsyncStorage.getItem('token');
      const storedUser = await AsyncStorage.getItem('user');
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    };
    loadAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await client.post('/auth/login', { email, password });
    setToken(res.data.access_token);
    setUser(res.data.user);

    await AsyncStorage.setItem('token', res.data.access_token);
    await AsyncStorage.setItem('user', JSON.stringify(res.data.user));
  };

  const register = async (email: string, name: string, password: string) => {
    const res = await client.post('/auth/register', {
      email,
      name,
      password,
    });
    setToken(res.data.access_token);
    setUser(res.data.user);

    await AsyncStorage.setItem('token', res.data.access_token);
    await AsyncStorage.setItem('user', JSON.stringify(res.data.user));
  };

  const logout = async () => {
    setToken(null);
    setUser(null);
    await AsyncStorage.multiRemove(['token', 'user']);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
