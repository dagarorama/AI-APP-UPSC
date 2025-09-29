import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { apiClient } from '../services/apiClient';

interface User {
  id: string;
  email?: string;
  phone?: string;
  name?: string;
  created_at: string;
}

interface Profile {
  user_id: string;
  name: string;
  exam_date?: string;
  optional_subject?: string;
  hours_per_day?: number;
  streak_count: number;
  total_study_minutes: number;
  updated_at: string;
}

interface AuthState {
  user: User | null;
  profile: Profile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  setUser: (user: User) => void;
  setProfile: (profile: Profile) => void;
  setToken: (token: string) => void;
  logout: () => void;
  loadUserData: () => Promise<void>;
  setupProfile: (data: any) => Promise<void>;
  authenticate: (phone: string, otp: string) => Promise<boolean>;
}

// Platform-specific secure storage
const secureStore = {
  getItemAsync: async (key: string): Promise<string | null> => {
    try {
      if (Platform.OS === 'web') {
        return localStorage.getItem(key);
      }
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  setItemAsync: async (key: string, value: string): Promise<void> => {
    try {
      if (Platform.OS === 'web') {
        localStorage.setItem(key, value);
        return;
      }
      await SecureStore.setItemAsync(key, value);
    } catch {
      // Ignore errors
    }
  },
  deleteItemAsync: async (key: string): Promise<void> => {
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem(key);
        return;
      }
      await SecureStore.deleteItemAsync(key);
    } catch {
      // Ignore errors
    }
  }
};

export const useAuthStore = create<AuthState>(
  (set, get) => ({
    user: null,
    profile: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,

    setUser: (user) => set({ user }),
    
    setProfile: (profile) => set({ profile }),
    
    setToken: async (token) => {
      await secureStore.setItemAsync('auth_token', token);
      set({ token, isAuthenticated: true });
    },
    
    logout: async () => {
      await secureStore.deleteItemAsync('auth_token');
      set({ 
        user: null, 
        profile: null, 
        token: null, 
        isAuthenticated: false 
      });
    },
    
    loadUserData: async () => {
      try {
        set({ isLoading: true });
        const token = await secureStore.getItemAsync('auth_token');
        
        if (!token) {
          set({ isAuthenticated: false, isLoading: false });
          return;
        }
        
        const response = await apiClient.get('/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        set({ 
          user: response.data.user,
          profile: response.data.profile,
          token,
          isAuthenticated: true 
        });
      } catch (error) {
        console.error('Error loading user data:', error);
        await get().logout();
      } finally {
        set({ isLoading: false });
      }
    },
    
    setupProfile: async (data) => {
      try {
        const { token } = get();
        await apiClient.post('/profile/setup', data, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Reload user data to get updated profile
        await get().loadUserData();
      } catch (error) {
        console.error('Error setting up profile:', error);
        throw error;
      }
    },
    
    authenticate: async (phone, otp) => {
      try {
        const response = await apiClient.post('/auth/verify', { phone, otp });
        const { token, user_id } = response.data;
        
        await get().setToken(token);
        await get().loadUserData();
        
        return true;
      } catch (error) {
        console.error('Authentication error:', error);
        return false;
      }
    },
  })
);

// Initialize auth state on app start (skip on web for now)
const initializeAuth = async () => {
  try {
    if (Platform.OS !== 'web') {
      const token = await secureStore.getItemAsync('auth_token');
      if (token) {
        useAuthStore.getState().loadUserData();
      }
    }
  } catch (error) {
    console.log('Auth initialization skipped:', error);
  }
};

initializeAuth();
