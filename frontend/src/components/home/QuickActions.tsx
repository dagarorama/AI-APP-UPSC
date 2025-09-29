import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Card } from '../ui/Card';

const quickActions = [
  {
    id: 1,
    title: 'Ask AI',
    subtitle: 'Get instant help',
    icon: 'chatbubble-ellipses',
    color: '#3b82f6',
    bgColor: '#eff6ff',
    route: '/chat'
  },
  {
    id: 2,
    title: 'Add Resource',
    subtitle: 'Upload study material',
    icon: 'add-circle',
    color: '#10b981',
    bgColor: '#ecfdf5',
    route: '/library/add'
  },
  {
    id: 3,
    title: 'Practice MCQs',
    subtitle: 'Test your knowledge',
    icon: 'help-circle',
    color: '#8b5cf6',
    bgColor: '#f3e8ff',
    route: '/mcq'
  },
  {
    id: 4,
    title: 'Answer Writing',
    subtitle: 'Improve your answers',
    icon: 'document-text',
    color: '#f59e0b',
    bgColor: '#fffbeb',
    route: '/evaluation'
  }
];

export function QuickActions() {
  const router = useRouter();
  
  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      className="-mx-2"
      contentContainerStyle={{ paddingHorizontal: 8 }}
    >
      <View className="flex-row space-x-3">
        {quickActions.map((action) => (
          <TouchableOpacity
            key={action.id}
            onPress={() => router.push(action.route as any)}
            className="mr-3 last:mr-0"
          >
            <Card className="w-36 p-4">
              <View 
                className="w-12 h-12 rounded-full items-center justify-center mb-3"
                style={{ backgroundColor: action.bgColor }}
              >
                <Ionicons 
                  name={action.icon as any} 
                  size={24} 
                  color={action.color} 
                />
              </View>
              
              <Text className="font-semibold text-gray-900 mb-1">
                {action.title}
              </Text>
              <Text className="text-sm text-gray-600">
                {action.subtitle}
              </Text>
            </Card>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}
