import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from '../ui/Card';
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
        className="rounded-2xl p-6"
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <View className="flex-row items-center mb-2">
              <View className="w-3 h-3 bg-orange-400 rounded-full animate-pulse" />
              <Text className="text-white font-semibold ml-2">
                Daily Dose Available
              </Text>
            </View>
            
            <Text className="text-white text-lg font-bold mb-2">
              Your Quick UPSC Boost
            </Text>
            
            <Text className="text-blue-100 text-sm mb-4">
              5 mins • MCQs + Current Affairs + Essay Topic
            </Text>
            
            <View className="flex-row items-center">
              <View className="bg-white/20 px-3 py-1 rounded-full mr-2">
                <Text className="text-white text-xs font-medium">
                  🔥 Maintain Streak
                </Text>
              </View>
              <View className="bg-white/20 px-3 py-1 rounded-full">
                <Text className="text-white text-xs font-medium">
                  ⚡ Quick Practice
                </Text>
              </View>
            </View>
          </View>
          
          <View className="items-center">
            <View className="w-16 h-16 bg-white/20 rounded-full items-center justify-center mb-2">
              <Ionicons name="flash" size={32} color="white" />
            </View>
            <Text className="text-white text-xs font-medium">
              START NOW
            </Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}
