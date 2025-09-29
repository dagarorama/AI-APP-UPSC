import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from '../../src/components/ui/Card';
import { useAuthStore } from '../../src/stores/authStore';
import { useAnalyticsStore } from '../../src/stores/analyticsStore';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, profile, logout } = useAuthStore();
  const { dashboardData } = useAnalyticsStore();
  const [showAnalytics, setShowAnalytics] = useState(false);
  
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/auth/onboarding');
          }
        }
      ]
    );
  };
  
  const profileSettings = [
    {
      id: 'notifications',
      title: 'Notifications',
      subtitle: 'Manage your study reminders',
      icon: 'notifications',
      color: '#f59e0b',
      action: () => Alert.alert('Coming Soon', 'Notification settings will be available soon')
    },
    {
      id: 'study-preferences',
      title: 'Study Preferences',
      subtitle: 'Customize your learning experience',
      icon: 'settings',
      color: '#8b5cf6',
      action: () => Alert.alert('Coming Soon', 'Study preferences will be available soon')
    },
    {
      id: 'data-sync',
      title: 'Data & Sync',
      subtitle: 'Backup and sync your progress',
      icon: 'cloud',
      color: '#3b82f6',
      action: () => Alert.alert('Coming Soon', 'Data sync will be available soon')
    },
    {
      id: 'help',
      title: 'Help & Support',
      subtitle: 'Get help and send feedback',
      icon: 'help-circle',
      color: '#10b981',
      action: () => Alert.alert('Help', 'For support, please contact: support@upscai.com')
    },
    {
      id: 'about',
      title: 'About',
      subtitle: 'App version and credits',
      icon: 'information-circle',
      color: '#6b7280',
      action: () => Alert.alert('UPSC AI Companion', 'Version 1.0.0\n\nBuilt with ❤️ for UPSC aspirants')
    }
  ];
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <LinearGradient
        colors={['#3b82f6', '#1d4ed8']}
        style={styles.header}
      >
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {profile?.name ? profile.name.charAt(0).toUpperCase() : 'U'}
              </Text>
            </View>
          </View>
          
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{profile?.name || 'UPSC Aspirant'}</Text>
            <Text style={styles.profileEmail}>{user?.phone || user?.email || 'Not set'}</Text>
            
            <View style={styles.profileStats}>
              <View style={styles.statBadge}>
                <Ionicons name="flame" size={14} color="#f59e0b" />
                <Text style={styles.statBadgeText}>{dashboardData?.streak_count || 0} day streak</Text>
              </View>
              
              <View style={styles.statBadge}>
                <Ionicons name="trophy" size={14} color="#10b981" />
                <Text style={styles.statBadgeText}>
                  {Math.round((dashboardData?.total_study_minutes || 0) / 60)}h studied
                </Text>
              </View>
            </View>
          </View>
        </View>
      </LinearGradient>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Quick Stats */}
        <Card style={styles.quickStatsCard}>
          <View style={styles.quickStatsHeader}>
            <Text style={styles.quickStatsTitle}>Your Progress</Text>
            <TouchableOpacity 
              style={styles.analyticsButton}
              onPress={() => setShowAnalytics(!showAnalytics)}
            >
              <Text style={styles.analyticsButtonText}>View Details</Text>
              <Ionicons name="chevron-forward" size={16} color="#3b82f6" />
            </TouchableOpacity>
          </View>
          
          {showAnalytics && dashboardData && (
            <View style={styles.analyticsContent}>
              <View style={styles.analyticsGrid}>
                <View style={styles.analyticsItem}>
                  <Text style={styles.analyticsValue}>{Math.round(dashboardData.completion_rate)}%</Text>
                  <Text style={styles.analyticsLabel}>Completion Rate</Text>
                </View>
                <View style={styles.analyticsItem}>
                  <Text style={styles.analyticsValue}>{Object.keys(dashboardData.subject_stats).length}</Text>
                  <Text style={styles.analyticsLabel}>Active Subjects</Text>
                </View>
                <View style={styles.analyticsItem}>
                  <Text style={styles.analyticsValue}>{dashboardData.weekly_minutes.reduce((a, b) => a + b, 0)}</Text>
                  <Text style={styles.analyticsLabel}>Weekly Minutes</Text>
                </View>
              </View>
              
              <View style={styles.subjectBreakdown}>
                <Text style={styles.subjectTitle}>Subject Performance</Text>
                {Object.entries(dashboardData.subject_stats).map(([subject, stats]) => (
                  <View key={subject} style={styles.subjectItem}>
                    <View style={styles.subjectInfo}>
                      <Text style={styles.subjectName}>{subject.toUpperCase()}</Text>
                      <Text style={styles.subjectMinutes}>{stats.minutes}min</Text>
                    </View>
                    <View style={styles.subjectProgress}>
                      <View 
                        style={[
                          styles.subjectProgressBar, 
                          { width: `${(stats.completed / stats.total) * 100}%` }
                        ]} 
                      />
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}
        </Card>
        
        {/* Study Preferences */}
        {profile && (
          <Card style={styles.preferencesCard}>
            <Text style={styles.sectionTitle}>Study Preferences</Text>
            
            <View style={styles.preferencesList}>
              <View style={styles.preferenceItem}>
                <Text style={styles.preferenceLabel}>Target Exam Date</Text>
                <Text style={styles.preferenceValue}>
                  {profile.exam_date 
                    ? new Date(profile.exam_date).toLocaleDateString()
                    : 'Not set'
                  }
                </Text>
              </View>
              
              <View style={styles.preferenceItem}>
                <Text style={styles.preferenceLabel}>Daily Study Hours</Text>
                <Text style={styles.preferenceValue}>{profile.hours_per_day || 6} hours</Text>
              </View>
              
              {profile.optional_subject && (
                <View style={styles.preferenceItem}>
                  <Text style={styles.preferenceLabel}>Optional Subject</Text>
                  <Text style={styles.preferenceValue}>{profile.optional_subject}</Text>
                </View>
              )}
            </View>
          </Card>
        )}
        
        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          {profileSettings.map((setting) => (
            <TouchableOpacity
              key={setting.id}
              style={styles.settingItem}
              onPress={setting.action}
            >
              <Card style={styles.settingCard}>
                <View style={styles.settingContent}>
                  <View style={[styles.settingIcon, { backgroundColor: `${setting.color}20` }]}>
                    <Ionicons name={setting.icon as any} size={24} color={setting.color} />
                  </View>
                  
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingTitle}>{setting.title}</Text>
                    <Text style={styles.settingSubtitle}>{setting.subtitle}</Text>
                  </View>
                  
                  <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </View>
        
        {/* App Info */}
        <Card style={styles.appInfoCard}>
          <View style={styles.appInfoContent}>
            <Ionicons name="school" size={32} color="#3b82f6" />
            <View style={styles.appInfo}>
              <Text style={styles.appName}>UPSC AI Companion</Text>
              <Text style={styles.appVersion}>Version 1.0.0</Text>
              <Text style={styles.appDescription}>
                Your intelligent study partner for UPSC success.
                Built with AI-powered features to enhance your preparation.
              </Text>
            </View>
          </View>
        </Card>
        
        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
          <Ionicons name="log-out" size={20} color="#dc2626" />
        </TouchableOpacity>
        
        <View style={styles.bottomSpacer} />
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
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#bfdbfe',
    marginBottom: 8,
  },
  profileStats: {
    flexDirection: 'row',
    gap: 12,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statBadgeText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  quickStatsCard: {
    margin: 16,
    padding: 20,
  },
  quickStatsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  quickStatsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  analyticsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  analyticsButtonText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
  analyticsContent: {
    marginTop: 16,
  },
  analyticsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  analyticsItem: {
    alignItems: 'center',
  },
  analyticsValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  analyticsLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  subjectBreakdown: {
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 16,
  },
  subjectTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  subjectItem: {
    marginBottom: 12,
  },
  subjectInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  subjectName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
  },
  subjectMinutes: {
    fontSize: 12,
    color: '#9ca3af',
  },
  subjectProgress: {
    height: 4,
    backgroundColor: '#f3f4f6',
    borderRadius: 2,
    overflow: 'hidden',
  },
  subjectProgressBar: {
    height: '100%',
    backgroundColor: '#3b82f6',
  },
  preferencesCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
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
  preferencesList: {
    gap: 16,
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  preferenceLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  preferenceValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  settingItem: {
    marginBottom: 8,
  },
  settingCard: {
    padding: 16,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 12,
    color: '#6b7280',
  },
  appInfoCard: {
    margin: 16,
    padding: 20,
  },
  appInfoContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  appInfo: {
    marginLeft: 12,
    flex: 1,
  },
  appName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  appVersion: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  appDescription: {
    fontSize: 12,
    color: '#9ca3af',
    lineHeight: 18,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
    gap: 8,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#dc2626',
  },
  bottomSpacer: {
    height: 32,
  },
});