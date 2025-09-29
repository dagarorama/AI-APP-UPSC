import { create } from 'zustand';
import { apiClient } from '../services/apiClient';

interface AnalyticsData {
  total_study_minutes: number;
  streak_count: number;
  completion_rate: number;
  subject_stats: Record<string, {
    minutes: number;
    completed: number;
    total: number;
  }>;
  weekly_minutes: number[];
}

interface AnalyticsState {
  dashboardData: AnalyticsData | null;
  isLoading: boolean;
  
  loadDashboardData: () => Promise<void>;
}

export const useAnalyticsStore = create<AnalyticsState>()((set) => ({
  dashboardData: null,
  isLoading: false,
  
  loadDashboardData: async () => {
    try {
      set({ isLoading: true });
      const response = await apiClient.get('/analytics/dashboard');
      set({ dashboardData: response.data });
    } catch (error) {
      console.error('Error loading analytics:', error);
      // Mock data for demo
      set({ 
        dashboardData: {
          total_study_minutes: 1260,
          streak_count: 7,
          completion_rate: 78,
          subject_stats: {
            gs1: { minutes: 300, completed: 5, total: 7 },
            gs2: { minutes: 280, completed: 4, total: 6 },
            gs3: { minutes: 320, completed: 6, total: 8 },
            gs4: { minutes: 210, completed: 3, total: 5 },
            essay: { minutes: 150, completed: 2, total: 3 }
          },
          weekly_minutes: [180, 210, 190, 240, 220, 180, 200]
        }
      });
    } finally {
      set({ isLoading: false });
    }
  }
}));
