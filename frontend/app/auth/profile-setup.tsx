import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Card } from '../../src/components/ui/Card';
import { useAuthStore } from '../../src/stores/authStore';
import { Subject } from '../../src/stores/plannerStore';

interface ProfileData {
  name: string;
  examDate?: Date;
  optionalSubject?: string;
  hoursPerDay: number;
  subjects: Subject[];
}

export default function ProfileSetupScreen() {
  const router = useRouter();
  const { setupProfile } = useAuthStore();
  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    hoursPerDay: 6,
    subjects: ['gs1', 'gs2', 'gs3', 'gs4', 'essay', 'csat']
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const subjectOptions: { key: Subject; label: string }[] = [
    { key: 'gs1', label: 'General Studies - I' },
    { key: 'gs2', label: 'General Studies - II' },
    { key: 'gs3', label: 'General Studies - III' },
    { key: 'gs4', label: 'General Studies - IV' },
    { key: 'essay', label: 'Essay' },
    { key: 'optional', label: 'Optional Subject' },
    { key: 'csat', label: 'CSAT' },
  ];
  
  const handleSubjectToggle = (subject: Subject) => {
    setProfileData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
    }));
  };
  
  const handleSaveProfile = async () => {
    if (!profileData.name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }
    
    if (profileData.subjects.length === 0) {
      Alert.alert('Error', 'Please select at least one subject');
      return;
    }
    
    setIsLoading(true);
    try {
      await setupProfile({
        name: profileData.name,
        exam_date: profileData.examDate?.toISOString().split('T')[0],
        optional_subject: profileData.optionalSubject,
        hours_per_day: profileData.hoursPerDay
      });
      
      router.replace('/');
    } catch (error) {
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <KeyboardAvoidingView 
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Set Up Your Profile</Text>
            <Text style={styles.subtitle}>
              Help us personalize your UPSC preparation journey
            </Text>
          </View>
          
          {/* Name Input */}
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Full Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                value={profileData.name}
                onChangeText={(name) => setProfileData(prev => ({ ...prev, name }))}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Target Exam Date (Optional)</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={profileData.examDate ? styles.dateText : styles.datePlaceholder}>
                  {profileData.examDate 
                    ? profileData.examDate.toDateString()
                    : 'Select exam date'
                  }
                </Text>
                <Ionicons name="calendar-outline" size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>
            
            {profileData.subjects.includes('optional') && (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Optional Subject</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., History, Geography, etc."
                  value={profileData.optionalSubject || ''}
                  onChangeText={(optionalSubject) => 
                    setProfileData(prev => ({ ...prev, optionalSubject }))
                  }
                />
              </View>
            )}
          </Card>
          
          {/* Study Preferences */}
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Study Preferences</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Daily Study Hours</Text>
              <View style={styles.hoursContainer}>
                {[4, 6, 8, 10, 12].map(hours => (
                  <TouchableOpacity
                    key={hours}
                    style={[
                      styles.hourButton,
                      profileData.hoursPerDay === hours && styles.hourButtonActive
                    ]}
                    onPress={() => setProfileData(prev => ({ ...prev, hoursPerDay: hours }))}
                  >
                    <Text style={[
                      styles.hourButtonText,
                      profileData.hoursPerDay === hours && styles.hourButtonTextActive
                    ]}>
                      {hours}h
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Subjects to Focus On *</Text>
              <View style={styles.subjectsContainer}>
                {subjectOptions.map(subject => (
                  <TouchableOpacity
                    key={subject.key}
                    style={[
                      styles.subjectChip,
                      profileData.subjects.includes(subject.key) && styles.subjectChipActive
                    ]}
                    onPress={() => handleSubjectToggle(subject.key)}
                  >
                    <Text style={[
                      styles.subjectChipText,
                      profileData.subjects.includes(subject.key) && styles.subjectChipTextActive
                    ]}>
                      {subject.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </Card>
          
          <TouchableOpacity 
            style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
            onPress={handleSaveProfile}
            disabled={isLoading}
          >
            <LinearGradient
              colors={isLoading ? ['#9ca3af', '#6b7280'] : ['#3b82f6', '#1d4ed8']}
              style={styles.saveButtonGradient}
            >
              <Text style={styles.saveButtonText}>
                {isLoading ? 'Saving...' : 'Complete Setup'}
              </Text>
              <Ionicons name="checkmark-circle" size={20} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
      
      {showDatePicker && (
        <DateTimePicker
          value={profileData.examDate || new Date()}
          mode="date"
          display="default"
          minimumDate={new Date()}
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              setProfileData(prev => ({ ...prev, examDate: selectedDate }));
            }
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    flex: 1,
  },
  header: {
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  section: {
    margin: 16,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  dateText: {
    fontSize: 16,
    color: '#111827',
  },
  datePlaceholder: {
    fontSize: 16,
    color: '#9ca3af',
  },
  hoursContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  hourButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  hourButtonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  hourButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  hourButtonTextActive: {
    color: 'white',
  },
  subjectsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  subjectChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  subjectChipActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  subjectChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
  },
  subjectChipTextActive: {
    color: 'white',
  },
  saveButton: {
    margin: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
});