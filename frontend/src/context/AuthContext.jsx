// import React, { createContext, useContext, useState, useEffect } from 'react';
// import { authAPI } from '../services/api';
// import socketService from '../services/socket';
// import toast from 'react-hot-toast';
// import { useToast } from "./ToastContext";

// const AuthContext = createContext();

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within AuthProvider');
//   }
//   return context;
// };

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [token, setToken] = useState(localStorage.getItem('token'));
//   const toast = useToast();

//   useEffect(() => {
//     if (token) {
//       fetchUser();
//       socketService.connect(token);
//     } else {
//       setLoading(false);
//     }
//   }, [token]);

//   const fetchUser = async () => {
//     try {
//       const response = await authAPI.getMe();
//       setUser(response.data.data);
//     } catch (error) {
//       console.error('Failed to fetch user:', error);
//       logout();
//     } finally {
//       setLoading(false);
//     }
//   };

//   const register = async (data) => {
//     try {
//       const response = await authAPI.register(data);
//       const { token: newToken, ...userData } = response.data.data;
      
//       localStorage.setItem('token', newToken);
//       setToken(newToken);
//       setUser(userData);
      
//       socketService.connect(newToken);
//       toast.success('Registration successful!');
//       return { success: true };
//     } catch (error) {
//       const message = error.response?.data?.message || 'Registration failed';
//       toast.error(message);
//       return { success: false, message };
//     }
//   };

//   const login = async (data) => {
//     try {
//       const response = await authAPI.login(data);
//       const { token: newToken, ...userData } = response.data.data;
      
//       localStorage.setItem('token', newToken);
//       setToken(newToken);
//       setUser(userData);
      
//       socketService.connect(newToken);
//       toast.success('Login successful!');
//       return { success: true };
//     } catch (error) {
//       const message = error.response?.data?.message || 'Login failed';
//       toast.error(message);
//       return { success: false, message };
//     }
//   };

//   const logout = async () => {
//     try {
//       await authAPI.logout();
//     } catch (error) {
//       console.error('Logout error:', error);
//     } finally {
//       localStorage.removeItem('token');
//       setToken(null);
//       setUser(null);
//       socketService.disconnect();
//       toast.success('Logged out successfully');
//     }
//   };

//   const updateUser = (updatedData) => {
//     setUser(prev => ({ ...prev, ...updatedData }));
//   };

//   const value = {
//     user,
//     loading,
//     register,
//     login,
//     logout,
//     updateUser,
//   };

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// };

import React, { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../services/api";
import socketService from "../services/socket";
import { toast } from '@/hooks/use-toast';
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const navigate = useNavigate()

  useEffect(() => {
    if (token) {
      fetchUser();
      socketService.connect(token);
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const response = await authAPI.getMe();
      setUser(response.data.data);
    } catch (error) {
      console.error("Failed to fetch user:", error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const register = async (data) => {
    try {
      const response = await authAPI.register(data);
      const { token: newToken, ...userData } = response.data.data;
      localStorage.setItem("token", newToken);
      setToken(newToken);
      setUser(userData);
      socketService.connect(newToken);
      toast({ title: "Registration Successful", description: "Welcome aboard!", variant: "default" });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Registration failed";
      toast({ title: "Registration Failed", description: message, variant: "destructive" });
      return { success: false, message };
    }
  };

  const login = async (data) => {
    try {
      const response = await authAPI.login(data);
      const { token: newToken, ...userData } = response.data.data;
      localStorage.setItem("token", newToken);
      setToken(newToken);
      setUser(userData);
      socketService.connect(newToken);
      toast({ title: "Login Successful", description: `Welcome back, ${userData.username || "User"}!`, variant: "default" });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Login failed";
      toast({ title: "Login Failed", description: message, variant: "destructive" });
      return { success: false, message };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
      navigate('/')
      socketService.disconnect();
      toast({ title: "Logged Out", description: "You have successfully logged out.", variant: "default" });
    }
  };

  const updateUser = (updatedData) => setUser(prev => ({ ...prev, ...updatedData }));

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
