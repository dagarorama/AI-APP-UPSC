import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useAuthStore } from '../src/stores/authStore';
import { usePlannerStore } from '../src/stores/plannerStore';
import { useAnalyticsStore } from '../src/stores/analyticsStore';
import { Card } from '../src/components/ui/Card';
import { ProgressRing } from '../src/components/ui/ProgressRing';
import { QuickActions } from '../src/components/home/QuickActions';
import { TodaysPlan } from '../src/components/home/TodaysPlan';
import { UpscDose } from '../src/components/home/UpscDose';

export default function HomeScreen() {
  const router = useRouter();
  const { user, isAuthenticated, profile } = useAuthStore();
  const { todayItems, updateItemProgress } = usePlannerStore();
  const { dashboardData } = useAnalyticsStore();
  const [isLoading, setIsLoading] = useState(false);

  // Redirect to onboarding if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/auth/onboarding');
    }
  }, [isAuthenticated]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const calculateTodayProgress = () => {
    if (!todayItems || todayItems.length === 0) return 0;
    const completed = todayItems.filter(item => item.status === 'done').length;
    return Math.round((completed / todayItems.length) * 100);
  };

  const getTodayMinutes = () => {
    if (!todayItems) return 0;
    return todayItems
      .filter(item => item.status === 'done')
      .reduce((sum, item) => sum + (item.actual_minutes || 0), 0);
  };

  // Show onboarding for non-authenticated users
  if (!isAuthenticated) {
    return (
      <View style={styles.centered}>
        <Text style={styles.loadingText}>Redirecting to onboarding...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerText}>
              <Text style={styles.greeting}>
                {getGreeting()}!
              </Text>
              <Text style={styles.userName}>
                {profile?.name || 'UPSC Aspirant'}
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.profileButton}
              onPress={() => router.push('/profile')}
            >
              <Ionicons name="person-outline" size={24} color="#4b5563" />
            </TouchableOpacity>
          </View>
          
          {/* Streak & Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.streakBadge}>
              <Ionicons name="flame" size={16} color="#f59e0b" />
              <Text style={styles.streakText}>
                {dashboardData?.streak_count || 0} day streak
              </Text>
            </View>
            <View style={styles.minutesBadge}>
              <Ionicons name="time" size={16} color="#10b981" />
              <Text style={styles.minutesText}>
                {getTodayMinutes()} min today
              </Text>
            </View>
          </View>
        </View>

        {/* Progress Ring */}
        <View style={styles.section}>
          <Card style={styles.progressCard}>
            <View style={styles.progressContent}>
              <View style={styles.progressTextContainer}>
                <Text style={styles.progressTitle}>
                  Today's Progress
                </Text>
                <Text style={styles.progressSubtitle}>
                  {todayItems?.filter(item => item.status === 'done').length || 0} of {todayItems?.length || 0} tasks completed
                </Text>
              </View>
              <ProgressRing 
                progress={calculateTodayProgress()}
                size={80}
                strokeWidth={8}
                color="#3b82f6"
              />
            </View>
          </Card>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Quick Actions
          </Text>
          <QuickActions />
        </View>

        {/* Today's Plan */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Today's Plan
            </Text>
            <Link href="/planner" asChild>
              <TouchableOpacity>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </Link>
          </View>
          <TodaysPlan items={todayItems} onUpdateProgress={updateItemProgress} />
        </View>

        {/* UPSC Dose */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Daily UPSC Dose
          </Text>
          <UpscDose />
        </View>

        {/* Analytics Preview */}
        {dashboardData && (
          <View style={styles.lastSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Your Progress
              </Text>
              <Link href="/profile/analytics" asChild>
                <TouchableOpacity>
                  <Text style={styles.viewAllText}>View Details</Text>
                </TouchableOpacity>
              </Link>
            </View>
            
            <Card style={styles.analyticsCard}>
              <View style={styles.analyticsStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {Math.round(dashboardData.completion_rate)}%
                  </Text>
                  <Text style={styles.statLabel}>Completion Rate</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {Math.round(dashboardData.total_study_minutes / 60)}h
                  </Text>
                  <Text style={styles.statLabel}>Total Hours</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {Object.keys(dashboardData.subject_stats || {}).length}
                  </Text>
                  <Text style={styles.statLabel}>Subjects</Text>
                </View>
              </View>
              
              <TouchableOpacity style={styles.analyticsButton}>
                <Text style={styles.analyticsButtonText}>
                  View Detailed Analytics
                </Text>
              </TouchableOpacity>
            </Card>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  centered: {
    flex: 1,
    backgroundColor: '#f9fafb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#6b7280',
    marginTop: 16,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerText: {
    flex: 1,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  userName: {
    fontSize: 18,
    color: '#6b7280',
    marginTop: 4,
  },
  profileButton: {
    width: 48,
    height: 48,
    backgroundColor: 'white',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 16,
  },
  streakText: {
    color: '#d97706',
    fontWeight: '600',
    marginLeft: 4,
  },
  minutesBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d1fae5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  minutesText: {
    color: '#065f46',
    fontWeight: '600',
    marginLeft: 4,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  lastSection: {
    paddingHorizontal: 24,
    marginBottom: 80,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  viewAllText: {
    color: '#2563eb',
    fontWeight: '500',
  },
  progressCard: {
    padding: 24,
  },
  progressContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressTextContainer: {
    flex: 1,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  progressSubtitle: {
    color: '#6b7280',
  },
  analyticsCard: {
    padding: 24,
  },
  analyticsStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  analyticsButton: {
    backgroundColor: '#eff6ff',
    padding: 12,
    borderRadius: 8,
  },
  analyticsButtonText: {
    color: '#2563eb',
    fontWeight: '500',
    textAlign: 'center',
  },
});