import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../ui/Card';
import { PlanItem, Subject, PlanItemStatus } from '../../stores/plannerStore';

interface TodaysPlanProps {
  items: PlanItem[];
  onUpdateProgress: (itemId: string, minutes: number, status: PlanItemStatus) => Promise<void>;
}

const subjectColors: Record<Subject, { bg: string; text: string; border: string }> = {
  gs1: { bg: '#eff6ff', text: '#1d4ed8', border: '#3b82f6' },
  gs2: { bg: '#f0fdfa', text: '#0f766e', border: '#14b8a6' },
  gs3: { bg: '#faf5ff', text: '#7c3aed', border: '#8b5cf6' },
  gs4: { bg: '#fffbeb', text: '#d97706', border: '#f59e0b' },
  essay: { bg: '#fdf2f8', text: '#be185d', border: '#ec4899' },
  optional: { bg: '#ecfeff', text: '#0891b2', border: '#06b6d4' },
  csat: { bg: '#f7fee7', text: '#65a30d', border: '#84cc16' }
};

export function TodaysPlan({ items = [], onUpdateProgress }: TodaysPlanProps) {
  if (!items || items.length === 0) {
    return (
      <Card className="p-6">
        <View className="items-center">
          <Ionicons name="calendar-outline" size={48} color="#9ca3af" />
          <Text className="text-gray-500 text-center mt-3">
            No study plan for today.
          </Text>
          <Text className="text-gray-400 text-center mt-1">
            Create a plan to get started!
          </Text>
        </View>
      </Card>
    );
  }
  
  const handleMarkDone = async (item: PlanItem) => {
    try {
      const minutes = item.target_minutes; // Use target minutes as actual for quick completion
      await onUpdateProgress(item.id, minutes, 'done');
    } catch (error) {
      console.error('Error marking item as done:', error);
    }
  };
  
  const handleMarkSkipped = async (item: PlanItem) => {
    try {
      await onUpdateProgress(item.id, 0, 'skipped');
    } catch (error) {
      console.error('Error marking item as skipped:', error);
    }
  };
  
  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      className="-mx-2"
      contentContainerStyle={{ paddingHorizontal: 8 }}
    >
      <View className="flex-row space-x-4">
        {items.map((item) => {
          const subjectStyle = subjectColors[item.subject];
          const isCompleted = item.status === 'done';
          const isSkipped = item.status === 'skipped';
          
          return (
            <Card key={item.id} className="w-72 p-4">
              {/* Subject Badge */}
              <View className="flex-row items-center justify-between mb-3">
                <View 
                  className="px-3 py-1 rounded-full"
                  style={{ backgroundColor: subjectStyle.bg }}
                >
                  <Text 
                    className="text-xs font-semibold uppercase"
                    style={{ color: subjectStyle.text }}
                  >
                    {item.subject}
                  </Text>
                </View>
                
                {isCompleted && (
                  <View className="w-6 h-6 bg-green-500 rounded-full items-center justify-center">
                    <Ionicons name="checkmark" size={16} color="white" />
                  </View>
                )}
                
                {isSkipped && (
                  <View className="w-6 h-6 bg-orange-500 rounded-full items-center justify-center">
                    <Ionicons name="remove" size={16} color="white" />
                  </View>
                )}
              </View>
              
              {/* Topic */}
              <Text className="font-semibold text-gray-900 mb-2" numberOfLines={2}>
                {item.topic}
              </Text>
              
              {/* Duration */}
              <View className="flex-row items-center mb-4">
                <Ionicons name="time-outline" size={16} color="#6b7280" />
                <Text className="text-gray-600 text-sm ml-1">
                  {item.target_minutes} minutes
                </Text>
                {item.actual_minutes > 0 && (
                  <Text className="text-green-600 text-sm ml-2">
                    ({item.actual_minutes} completed)
                  </Text>
                )}
              </View>
              
              {/* Actions */}
              {!isCompleted && !isSkipped && (
                <View className="flex-row space-x-2">
                  <TouchableOpacity 
                    className="flex-1 bg-green-100 p-3 rounded-lg items-center"
                    onPress={() => handleMarkDone(item)}
                  >
                    <Text className="text-green-700 font-medium">Mark Done</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    className="flex-1 bg-gray-100 p-3 rounded-lg items-center"
                    onPress={() => handleMarkSkipped(item)}
                  >
                    <Text className="text-gray-600 font-medium">Skip</Text>
                  </TouchableOpacity>
                </View>
              )}
              
              {isCompleted && (
                <View className="bg-green-50 p-3 rounded-lg">
                  <Text className="text-green-700 font-medium text-center">
                    ✓ Completed
                  </Text>
                </View>
              )}
              
              {isSkipped && (
                <View className="bg-orange-50 p-3 rounded-lg">
                  <Text className="text-orange-700 font-medium text-center">
                    Skipped - Will reschedule
                  </Text>
                </View>
              )}
            </Card>
          );
        })}
      </View>
    </ScrollView>
  );
}
