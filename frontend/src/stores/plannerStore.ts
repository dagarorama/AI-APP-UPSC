import { create } from 'zustand';
import { apiClient } from '../services/apiClient';

export type Subject = 'gs1' | 'gs2' | 'gs3' | 'gs4' | 'essay' | 'optional' | 'csat';
export type PlanItemStatus = 'pending' | 'done' | 'skipped';

interface PlanItem {
  id: string;
  plan_id: string;
  user_id: string;
  date: string;
  subject: Subject;
  topic: string;
  target_minutes: number;
  actual_minutes: number;
  status: PlanItemStatus;
  created_at: string;
}

interface StudyPlan {
  id: string;
  user_id: string;
  name: string;
  start_date: string;
  end_date?: string;
  created_at: string;
}

interface PlannerState {
  plans: StudyPlan[];
  allItems: PlanItem[];
  todayItems: PlanItem[];
  currentWeekItems: PlanItem[];
  isLoading: boolean;
  
  // Actions
  loadPlans: () => Promise<void>;
  loadTodayItems: () => Promise<void>;
  loadWeekItems: (startDate: string) => Promise<void>;
  loadAllItems: () => Promise<void>;
  generatePlan: (data: any) => Promise<void>;
  updateItemProgress: (itemId: string, minutes: number, status: PlanItemStatus) => Promise<void>;
  rescheduleItem: (itemId: string, newDate: string) => Promise<void>;
}

export const usePlannerStore = create<PlannerState>()((set, get) => ({
  plans: [],
  allItems: [],
  todayItems: [],
  currentWeekItems: [],
  isLoading: false,
  
  loadPlans: async () => {
    try {
      set({ isLoading: true });
      // API call would go here - using mock data for now
      set({ plans: [] });
    } catch (error) {
      console.error('Error loading plans:', error);
    } finally {
      set({ isLoading: false });
    }
  },
  
  loadTodayItems: async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await apiClient.get(`/planner/items?date=${today}`);
      set({ todayItems: response.data.items || [] });
    } catch (error) {
      console.error('Error loading today items:', error);
      // Mock data for demo
      set({ 
        todayItems: [
          {
            id: '1',
            plan_id: 'plan1',
            user_id: 'user1',
            date: new Date().toISOString().split('T')[0],
            subject: 'gs1',
            topic: 'Indian Heritage & Culture',
            target_minutes: 90,
            actual_minutes: 0,
            status: 'pending',
            created_at: new Date().toISOString()
          },
          {
            id: '2',
            plan_id: 'plan1',
            user_id: 'user1',
            date: new Date().toISOString().split('T')[0],
            subject: 'gs2',
            topic: 'Constitutional Framework',
            target_minutes: 120,
            actual_minutes: 0,
            status: 'pending',
            created_at: new Date().toISOString()
          }
        ] 
      });
    }
  },
  
  loadWeekItems: async (startDate) => {
    try {
      set({ isLoading: true });
      const response = await apiClient.get('/planner/items');
      set({ currentWeekItems: response.data.items || [] });
    } catch (error) {
      console.error('Error loading week items:', error);
      set({ currentWeekItems: [] });
    } finally {
      set({ isLoading: false });
    }
  },
  
  loadAllItems: async () => {
    try {
      const response = await apiClient.get('/planner/items');
      set({ allItems: response.data.items || [] });
    } catch (error) {
      console.error('Error loading all items:', error);
    }
  },
  
  generatePlan: async (data) => {
    try {
      set({ isLoading: true });
      await apiClient.post('/planner/generate', data);
      // Reload items after generation
      await get().loadTodayItems();
      await get().loadAllItems();
    } catch (error) {
      console.error('Error generating plan:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
  
  updateItemProgress: async (itemId, minutes, status) => {
    try {
      await apiClient.post('/planner/log', {
        plan_item_id: itemId,
        minutes,
        status
      });
      
      // Update local state
      const updateItems = (items: PlanItem[]) =>
        items.map(item => 
          item.id === itemId 
            ? { ...item, actual_minutes: minutes, status }
            : item
        );
      
      set(state => ({
        todayItems: updateItems(state.todayItems),
        allItems: updateItems(state.allItems),
        currentWeekItems: updateItems(state.currentWeekItems)
      }));
    } catch (error) {
      console.error('Error updating item progress:', error);
      throw error;
    }
  },
  
  rescheduleItem: async (itemId, newDate) => {
    try {
      // API call would go here
      // For now, just update local state
      const updateItems = (items: PlanItem[]) =>
        items.map(item => 
          item.id === itemId 
            ? { ...item, date: newDate }
            : item
        );
      
      set(state => ({
        todayItems: updateItems(state.todayItems),
        allItems: updateItems(state.allItems),
        currentWeekItems: updateItems(state.currentWeekItems)
      }));
    } catch (error) {
      console.error('Error rescheduling item:', error);
      throw error;
    }
  }
}));
