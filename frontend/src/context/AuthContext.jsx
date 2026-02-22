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

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authAPI, userAPI } from "../services/api";
import socketService from "../services/socket";
import { toast } from '@/hooks/use-toast';
import { useNavigate } from "react-router-dom";
import { generateKeyPair, getMyPublicKey } from "../utils/crypto";

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



  const fetchUser = useCallback(async () => {
    try {
      const response = await authAPI.getMe();
      const userData = response.data.data;
      setUser(userData);

      // Check for E2EE keys
      let pubKey = getMyPublicKey();
      if (!pubKey) {
        pubKey = await generateKeyPair();
      }

      // Sync public key to server if not already set or different
      if (pubKey && (!userData.settings?.publicKey || userData.settings?.publicKey !== JSON.stringify(pubKey))) {
        await userAPI.updateSettings({ settings: { publicKey: JSON.stringify(pubKey) } });
      }

    } catch (error) {
      console.error("Failed to fetch user:", error);
      if (error.response?.status === 401) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchUser();
      socketService.connect(token);
    } else {
      setLoading(false);
    }
  }, [token, fetchUser]);

  const register = useCallback(async (data) => {
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
  }, []);

  const login = useCallback(async (data) => {
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
  }, []);

  const loginWithToken = useCallback(async (newToken, userData) => {
    try {
      localStorage.setItem("token", newToken);
      setToken(newToken);
      setUser(userData);
      socketService.connect(newToken);
      toast({ title: "Login Successful", description: `Welcome back, ${userData.name || "User"}!`, variant: "default" });
      return true;
    } catch (error) {
      console.error("Token login error:", error);
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
      navigate('/login');
      socketService.disconnect();
      toast({ title: "Logged Out", description: "You have successfully logged out.", variant: "default" });
    }
  }, [navigate]);

  const updateUser = useCallback((updatedData) => setUser(prev => ({ ...prev, ...updatedData })), []);

  const updateProfile = useCallback(async (data) => {
    try {
      const response = await userAPI.updateProfile(data);
      if (response.data.success) {
        setUser(response.data.data);
        toast({ title: "Profile Updated", description: "Your profile has been successfully updated.", variant: "default" });
        return { success: true };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      console.error("Profile update error:", error);
      toast({ title: "Update Failed", description: error.response?.data?.message || "Something went wrong", variant: "destructive" });
      return { success: false };
    }
  }, []);

  const updateSettings = useCallback(async (settings) => {
    try {
      const response = await userAPI.updateSettings({ settings });
      if (response.data.success) {
        setUser(response.data.data);
        toast({ title: "Settings Saved", description: "Your preferences have been saved.", variant: "default" });
        return { success: true };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      console.error("Settings update error:", error);
      toast({ title: "Save Failed", description: error.response?.data?.message || "Something went wrong", variant: "destructive" });
      return { success: false };
    }
  }, []);

  const syncContacts = useCallback(async (contacts) => {
    try {
      const response = await userAPI.syncContacts(contacts);
      if (response.data.success) {
        toast({ title: "Contacts Synced", description: "Your contacts have been successfully synchronized.", variant: "default" });
        return { success: true };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      console.error("Contact sync error:", error);
      toast({ title: "Sync Failed", description: error.response?.data?.message || "Something went wrong", variant: "destructive" });
      return { success: false };
    }
  }, []);

  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    if (user?.appLock?.enabled) {
      setIsLocked(true);
    }
  }, [user?.appLock?.enabled]);

  const updateAppLock = useCallback(async (data) => {
    try {
      const response = await userAPI.updateAppLock(data);
      if (response.data.success) {
        setUser(prev => ({ ...prev, appLock: response.data.data }));
        toast({ title: "Security Updated", description: "App lock settings saved.", variant: "default" });
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      toast({ title: "Update Failed", description: error.response?.data?.message || "Something went wrong", variant: "destructive" });
      return { success: false };
    }
  }, []);

  const unlockApp = useCallback(() => setIsLocked(false), []);

  const value = React.useMemo(() => ({
    user, loading, token, register, login, loginWithToken, logout, updateUser, updateProfile, updateSettings, syncContacts,
    isLocked, updateAppLock, unlockApp
  }), [user, loading, token, register, login, loginWithToken, logout, updateUser, updateProfile, updateSettings, syncContacts,
    isLocked, updateAppLock, unlockApp]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
