import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../api/axios';

const AuthContext = createContext(null);

// Helper: decode token and extract user info
function parseToken(token) {
  try {
    const decoded = jwtDecode(token);
    return {
      email: decoded.sub || decoded.email || decoded.username || '',
      name:  decoded.name || decoded.fullName || decoded.given_name || '',
      phone: decoded.phone || decoded.phoneNumber || '',
    };
  } catch { return { email: '', name: '', phone: '' }; }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token    = localStorage.getItem('token');
    const role     = localStorage.getItem('role');
    const userId   = localStorage.getItem('userId');
    if (token && role && userId) {
      const claims = parseToken(token);
      // Prefer explicit signup fields stored in localStorage (most reliable)
      setUser({
        token, role, id: Number(userId),
        email: localStorage.getItem('signupEmail') || claims.email,
        name:  localStorage.getItem('signupName')  || claims.name,
        phone: localStorage.getItem('signupPhone') || claims.phone,
      });
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await api.post('/auth/login', { username, password });
      const { token, userId, role } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      localStorage.setItem('userId', String(userId));
      const claims = parseToken(token);
      setUser({ token, role, id: userId, email: claims.email, name: claims.name, phone: claims.phone });
      return { success: true, role };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const logout = () => {
    ['token','role','userId','signupName','signupEmail','signupPhone'].forEach(k => localStorage.removeItem(k));
    setUser(null);
  };

  const verifyOtp = async (email, otp) => {
    const response = await api.post('/auth/verify-otp', { email, otp });
    return response.data;
  };

  const signup = async (username, password, fullName, phone) => {
    const response = await api.post('/auth/signup', { username, password, fullName, phone });
    // Persist for auto-fill on CreateProfile (read-only display)
    localStorage.setItem('signupName',  fullName);
    localStorage.setItem('signupEmail', username);
    localStorage.setItem('signupPhone', phone);
    return response.data;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, verifyOtp, signup }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
