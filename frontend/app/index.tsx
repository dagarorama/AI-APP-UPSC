import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import '../global.css';
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
  const { user, isAuthenticated, profile, loadUserData } = useAuthStore();
  const { todayItems, loadTodayItems, updateItemProgress } = usePlannerStore();
  const { dashboardData, loadDashboardData } = useAnalyticsStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      if (!isAuthenticated) {
        router.replace('/auth/onboarding');
        return;
      }
      
      await Promise.all([
        loadUserData(),
        loadTodayItems(),
        loadDashboardData()
      ]);
    } catch (error) {
      console.error('Error initializing app:', error);
      Alert.alert('Error', 'Failed to load app data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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

  if (!isAuthenticated) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-gray-600 mt-4">Loading...</Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-gray-600 mt-4">Preparing your dashboard...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="dark" />
      
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-6 py-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-2xl font-bold text-gray-900">
                {getGreeting()}!
              </Text>
              <Text className="text-lg text-gray-600 mt-1">
                {profile?.name || 'UPSC Aspirant'}
              </Text>
            </View>
            <TouchableOpacity 
              className="w-12 h-12 bg-white rounded-full items-center justify-center shadow-sm"
              onPress={() => router.push('/profile')}
            >
              <Ionicons name="person-outline" size={24} color="#4b5563" />
            </TouchableOpacity>
          </View>
          
          {/* Streak & Stats */}
          <View className="flex-row items-center mt-4 space-x-4">
            <View className="flex-row items-center bg-orange-100 px-3 py-2 rounded-full">
              <Ionicons name="flame" size={16} color="#f59e0b" />
              <Text className="text-orange-600 font-semibold ml-1">
                {dashboardData?.streak_count || 0} day streak
              </Text>
            </View>
            <View className="flex-row items-center bg-green-100 px-3 py-2 rounded-full">
              <Ionicons name="time" size={16} color="#10b981" />
              <Text className="text-green-600 font-semibold ml-1">
                {getTodayMinutes()} min today
              </Text>
            </View>
          </View>
        </View>

        {/* Progress Ring */}
        <View className="px-6 mb-6">
          <Card className="p-6">
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-lg font-semibold text-gray-900 mb-2">
                  Today's Progress
                </Text>
                <Text className="text-gray-600">
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
        <View className="px-6 mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Quick Actions
          </Text>
          <QuickActions />
        </View>

        {/* Today's Plan */}
        <View className="px-6 mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-semibold text-gray-900">
              Today's Plan
            </Text>
            <Link href="/planner" asChild>
              <TouchableOpacity>
                <Text className="text-blue-600 font-medium">View All</Text>
              </TouchableOpacity>
            </Link>
          </View>
          <TodaysPlan items={todayItems} onUpdateProgress={updateItemProgress} />
        </View>

        {/* UPSC Dose */}
        <View className="px-6 mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Daily UPSC Dose
          </Text>
          <UpscDose />
        </View>

        {/* Analytics Preview */}
        {dashboardData && (
          <View className="px-6 mb-20">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-semibold text-gray-900">
                Your Progress
              </Text>
              <Link href="/profile/analytics" asChild>
                <TouchableOpacity>
                  <Text className="text-blue-600 font-medium">View Details</Text>
                </TouchableOpacity>
              </Link>
            </View>
            
            <Card className="p-6">
              <View className="flex-row justify-between mb-4">
                <View className="items-center">
                  <Text className="text-2xl font-bold text-gray-900">
                    {Math.round(dashboardData.completion_rate)}%
                  </Text>
                  <Text className="text-sm text-gray-600">Completion Rate</Text>
                </View>
                <View className="items-center">
                  <Text className="text-2xl font-bold text-gray-900">
                    {Math.round(dashboardData.total_study_minutes / 60)}h
                  </Text>
                  <Text className="text-sm text-gray-600">Total Hours</Text>
                </View>
                <View className="items-center">
                  <Text className="text-2xl font-bold text-gray-900">
                    {Object.keys(dashboardData.subject_stats || {}).length}
                  </Text>
                  <Text className="text-sm text-gray-600">Subjects</Text>
                </View>
              </View>
              
              <TouchableOpacity className="bg-blue-50 p-3 rounded-lg">
                <Text className="text-blue-600 font-medium text-center">
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
