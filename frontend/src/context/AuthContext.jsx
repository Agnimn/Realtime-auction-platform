import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get('/auth/profile');
        if (res.data.success) {
          setUser(res.data.user);
        }
      } catch (error) {
        console.error('Auth error:', error);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        toast.success('Logged in successfully!');
        return { success: true };
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      return { success: false, message: error.response?.data?.message };
    }
  };

  const register = async (userData) => {
    try {
      const res = await api.post('/auth/register', userData);
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        toast.success('Registered successfully!');
        return { success: true };
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
      return { success: false, message: error.response?.data?.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
