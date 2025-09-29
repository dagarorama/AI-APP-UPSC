import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';

export function UpscDose() {
  const router = useRouter();
  const [isCompleted, setIsCompleted] = useState(false);
  
  const handleStartDose = () => {
    Alert.alert(
      'Daily UPSC Dose',
      'Ready for today\'s quick practice session?\n\n• 5 Quick MCQs\n• 1 Current Affairs Update\n• 1 Essay Topic',
      [
        { text: 'Later', style: 'cancel' },
        { 
          text: 'Start Now', 
          onPress: () => {
            // Would navigate to dose session
            router.push('/dose');
          }
        }
      ]
    );
  };
  
  return (
    <TouchableOpacity onPress={handleStartDose}>
      <LinearGradient
        colors={['#3b82f6', '#1d4ed8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <View style={styles.content}>
          <View style={styles.leftContent}>
            <View style={styles.header}>
              <View style={styles.indicator} />
              <Text style={styles.availableText}>
                Daily Dose Available
              </Text>
            </View>
            
            <Text style={styles.title}>
              Your Quick UPSC Boost
            </Text>
            
            <Text style={styles.subtitle}>
              5 mins • MCQs + Current Affairs + Essay Topic
            </Text>
            
            <View style={styles.badges}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  🔥 Maintain Streak
                </Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  ⚡ Quick Practice
                </Text>
              </View>
            </View>
          </View>
          
          <View style={styles.rightContent}>
            <View style={styles.iconContainer}>
              <Ionicons name="flash" size={32} color="white" />
            </View>
            <Text style={styles.startText}>
              START NOW
            </Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 24,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftContent: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  indicator: {
    width: 12,
    height: 12,
    backgroundColor: '#f59e0b',
    borderRadius: 6,
  },
  availableText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#bfdbfe',
    fontSize: 14,
    marginBottom: 16,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  rightContent: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  startText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
});