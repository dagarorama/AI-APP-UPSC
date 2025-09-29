import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from '../../src/components/ui/Card';
import { usePlannerStore, Subject, PlanItemStatus } from '../../src/stores/plannerStore';
import { TodaysPlan } from '../../src/components/home/TodaysPlan';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function PlannerScreen() {
  const router = useRouter();
  const { todayItems, currentWeekItems, loadTodayItems, loadWeekItems, updateItemProgress, generatePlan } = usePlannerStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'today' | 'week'>('today');
  const [isGenerating, setIsGenerating] = useState(false);
  
  useEffect(() => {
    loadTodayItems();
  }, []);
  
  const getWeekDates = () => {
    const startOfWeek = new Date(currentDate);
    const dayOfWeek = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek);
    
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      weekDates.push(date);
    }
    return weekDates;
  };
  
  const handleGeneratePlan = () => {
    Alert.alert(
      'Generate Study Plan',
      'This will create a personalized study plan based on your profile. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Generate',
          onPress: async () => {
            setIsGenerating(true);
            try {
              await generatePlan({
                exam_date: '2024-06-15', // Mock date
                hours_per_day: 6,
                subjects: ['gs1', 'gs2', 'gs3', 'gs4', 'essay', 'csat'],
                weak_areas: []
              });
              Alert.alert('Success', 'Your study plan has been generated!');
            } catch (error) {
              Alert.alert('Error', 'Failed to generate plan. Please try again.');
            } finally {
              setIsGenerating(false);
            }
          }
        }
      ]
    );
  };
  
  const getTodayStats = () => {
    if (!todayItems || todayItems.length === 0) {
      return { completed: 0, total: 0, minutes: 0, targetMinutes: 0 };
    }
    
    const completed = todayItems.filter(item => item.status === 'done').length;
    const total = todayItems.length;
    const minutes = todayItems
      .filter(item => item.status === 'done')
      .reduce((sum, item) => sum + item.actual_minutes, 0);
    const targetMinutes = todayItems.reduce((sum, item) => sum + item.target_minutes, 0);
    
    return { completed, total, minutes, targetMinutes };
  };
  
  const stats = getTodayStats();
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Study Planner</Text>
          <Text style={styles.headerDate}>
            {selectedDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Text>
        </View>
        
        <TouchableOpacity 
          style={styles.generateButton}
          onPress={handleGeneratePlan}
          disabled={isGenerating}
        >
          <Ionicons name="add" size={20} color="#3b82f6" />
        </TouchableOpacity>
      </View>
      
      {/* View Mode Toggle */}
      <View style={styles.viewToggle}>
        <TouchableOpacity
          style={[styles.toggleButton, viewMode === 'today' && styles.toggleButtonActive]}
          onPress={() => setViewMode('today')}
        >
          <Text style={[styles.toggleButtonText, viewMode === 'today' && styles.toggleButtonTextActive]}>
            Today
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, viewMode === 'week' && styles.toggleButtonActive]}
          onPress={() => setViewMode('week')}
        >
          <Text style={[styles.toggleButtonText, viewMode === 'week' && styles.toggleButtonTextActive]}>
            Week
          </Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats Card */}
        <Card style={styles.statsCard}>
          <LinearGradient
            colors={['#3b82f6', '#1d4ed8']}
            style={styles.statsGradient}
          >
            <View style={styles.statsContent}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.completed}/{stats.total}</Text>
                <Text style={styles.statLabel}>Tasks Done</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.minutes}</Text>
                <Text style={styles.statLabel}>Minutes</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{Math.round((stats.completed / Math.max(stats.total, 1)) * 100)}%</Text>
                <Text style={styles.statLabel}>Progress</Text>
              </View>
            </View>
          </LinearGradient>
        </Card>
        
        {viewMode === 'today' ? (
          <>
            {/* Today's Plan */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Today's Study Plan</Text>
              {todayItems && todayItems.length > 0 ? (
                <TodaysPlan 
                  items={todayItems} 
                  onUpdateProgress={updateItemProgress}
                />
              ) : (
                <Card style={styles.emptyCard}>
                  <View style={styles.emptyContent}>
                    <Ionicons name="calendar-outline" size={48} color="#9ca3af" />
                    <Text style={styles.emptyTitle}>No plan for today</Text>
                    <Text style={styles.emptySubtitle}>Generate a study plan to get started</Text>
                    
                    <TouchableOpacity 
                      style={styles.emptyButton}
                      onPress={handleGeneratePlan}
                      disabled={isGenerating}
                    >
                      <Text style={styles.emptyButtonText}>
                        {isGenerating ? 'Generating...' : 'Generate Plan'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </Card>
              )}
            </View>
          </>
        ) : (
          <>
            {/* Week View */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>This Week</Text>
              
              {/* Calendar Week */}
              <Card style={styles.calendarCard}>
                <View style={styles.weekHeader}>
                  <TouchableOpacity 
                    style={styles.navButton}
                    onPress={() => {
                      const newDate = new Date(currentDate);
                      newDate.setDate(currentDate.getDate() - 7);
                      setCurrentDate(newDate);
                    }}
                  >
                    <Ionicons name="chevron-back" size={20} color="#6b7280" />
                  </TouchableOpacity>
                  
                  <Text style={styles.weekTitle}>
                    {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </Text>
                  
                  <TouchableOpacity 
                    style={styles.navButton}
                    onPress={() => {
                      const newDate = new Date(currentDate);
                      newDate.setDate(currentDate.getDate() + 7);
                      setCurrentDate(newDate);
                    }}
                  >
                    <Ionicons name="chevron-forward" size={20} color="#6b7280" />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.weekDays}>
                  {getWeekDates().map((date, index) => {
                    const isToday = date.toDateString() === new Date().toDateString();
                    const isSelected = date.toDateString() === selectedDate.toDateString();
                    
                    return (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.dayButton,
                          isToday && styles.todayButton,
                          isSelected && styles.selectedDayButton
                        ]}
                        onPress={() => setSelectedDate(date)}
                      >
                        <Text style={[
                          styles.dayName,
                          (isToday || isSelected) && styles.dayNameActive
                        ]}>
                          {DAYS[date.getDay()]}
                        </Text>
                        <Text style={[
                          styles.dayNumber,
                          (isToday || isSelected) && styles.dayNumberActive
                        ]}>
                          {date.getDate()}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </Card>
              
              {/* Selected Date Items */}
              <View style={styles.selectedDateSection}>
                <Text style={styles.selectedDateTitle}>
                  {selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Text>
                
                <Card style={styles.noItemsCard}>
                  <Text style={styles.noItemsText}>No study items scheduled for this day</Text>
                </Card>
              </View>
            </View>
          </>
        )}
        
        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickAction} onPress={() => router.push('/chat')}>
              <Ionicons name="chatbubble" size={24} color="#3b82f6" />
              <Text style={styles.quickActionText}>Ask AI Planner</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickAction} onPress={() => router.push('/mcq')}>
              <Ionicons name="help-circle" size={24} color="#10b981" />
              <Text style={styles.quickActionText}>Practice MCQs</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickAction} onPress={() => router.push('/evaluation')}>
              <Ionicons name="document-text" size={24} color="#f59e0b" />
              <Text style={styles.quickActionText}>Answer Writing</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerDate: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  generateButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewToggle: {
    flexDirection: 'row',
    margin: 16,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  toggleButtonActive: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  toggleButtonTextActive: {
    color: '#3b82f6',
  },
  content: {
    flex: 1,
  },
  statsCard: {
    margin: 16,
    overflow: 'hidden',
  },
  statsGradient: {
    padding: 20,
  },
  statsContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  statLabel: {
    fontSize: 12,
    color: '#bfdbfe',
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  emptyCard: {
    padding: 32,
  },
  emptyContent: {
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
    textAlign: 'center',
  },
  emptyButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 16,
  },
  emptyButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  calendarCard: {
    padding: 16,
  },
  weekHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  navButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  weekDays: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  dayButton: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    minWidth: 40,
  },
  todayButton: {
    backgroundColor: '#fef3c7',
  },
  selectedDayButton: {
    backgroundColor: '#3b82f6',
  },
  dayName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 4,
  },
  dayNameActive: {
    color: 'white',
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  dayNumberActive: {
    color: 'white',
  },
  selectedDateSection: {
    marginTop: 20,
  },
  selectedDateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  noItemsCard: {
    padding: 20,
  },
  noItemsText: {
    textAlign: 'center',
    color: '#9ca3af',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickAction: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
  },
});