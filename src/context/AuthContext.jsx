'use client';

import { createContext, useState, useEffect } from 'react';
import { apiPost } from '../lib/api-client';
import {
  getToken, setToken, removeToken,
  getUser, setUser, removeUser,
} from '../lib/auth';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = getUser();
    const token = getToken();
    if (savedUser && token) {
      setUserState(savedUser);
    }
    setLoading(false);
  }, []);

  async function login(email, password) {
    const data = await apiPost('/api/auth/login', { email, password });
    setToken(data.access_token);
    setUser(data.user);
    setUserState(data.user);
    return data.user;
  }

  async function register(email, password, role = 'user') {
    const data = await apiPost('/api/auth/register', { email, password, role });
    return data;
  }

  function logout() {
    removeToken();
    removeUser();
    setUserState(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}
