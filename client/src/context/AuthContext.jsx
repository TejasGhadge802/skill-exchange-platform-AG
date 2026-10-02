import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  fbSignOut,
  fbResetPassword,
} from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync user profile from MongoDB backend
  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/auth/me');
      if (response.data.success) {
        setUserProfile(response.data.data);
      }
    } catch (error) {
      console.warn('[UserProfile Fetch Info]:', error.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const token = await user.getIdToken();
        localStorage.setItem('skill_exchange_token', token);
        await fetchUserProfile();
      } else {
        localStorage.removeItem('skill_exchange_token');
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithEmail = async (email, password) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const token = await cred.user.getIdToken();
      localStorage.setItem('skill_exchange_token', token);
      await fetchUserProfile();
      return { success: true, user: cred.user };
    } catch (error) {
      // Dev mock login fallback if Firebase project is not linked
      if (error.code === 'auth/invalid-api-key' || error.code === 'auth/network-request-failed') {
        const mockUid = `mock_${btoa(email).substring(0, 10)}`;
        localStorage.setItem('skill_exchange_token', mockUid);
        const mockUser = { uid: mockUid, email, displayName: email.split('@')[0] };
        setCurrentUser(mockUser);
        await fetchUserProfile();
        return { success: true, user: mockUser };
      }
      return { success: false, error: error.message };
    }
  };

  const registerWithEmail = async (email, password, displayName, role = 'requester') => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const token = await cred.user.getIdToken();
      localStorage.setItem('skill_exchange_token', token);
      await fetchUserProfile();
      if (role && role !== 'requester') {
        await api.put('/auth/profile', { displayName, role });
      }
      return { success: true, user: cred.user };
    } catch (error) {
      if (error.code === 'auth/invalid-api-key' || error.code === 'auth/network-request-failed') {
        const mockUid = `mock_${btoa(email).substring(0, 10)}`;
        localStorage.setItem('skill_exchange_token', mockUid);
        const mockUser = { uid: mockUid, email, displayName };
        setCurrentUser(mockUser);
        await fetchUserProfile();
        await api.put('/auth/profile', { displayName, role });
        return { success: true, user: mockUser };
      }
      return { success: false, error: error.message };
    }
  };

  const loginWithGoogle = async () => {
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const token = await cred.user.getIdToken();
      localStorage.setItem('skill_exchange_token', token);
      await fetchUserProfile();
      return { success: true, user: cred.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await fbSignOut(auth);
    } catch (e) {
      // Fallback
    }
    localStorage.removeItem('skill_exchange_token');
    setCurrentUser(null);
    setUserProfile(null);
  };

  const resetPassword = async (email) => {
    try {
      await fbResetPassword(auth, email);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const refreshProfile = async () => {
    await fetchUserProfile();
  };

  const value = {
    currentUser,
    userProfile,
    loading,
    loginWithEmail,
    registerWithEmail,
    loginWithGoogle,
    logout,
    resetPassword,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

