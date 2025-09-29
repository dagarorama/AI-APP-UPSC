import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
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
      contentContainerStyle={styles.scrollContainer}
    >
      <View style={styles.container}>
        {quickActions.map((action) => (
          <TouchableOpacity
            key={action.id}
            onPress={() => router.push(action.route as any)}
            style={styles.actionItem}
          >
            <Card style={styles.actionCard}>
              <View 
                style={[styles.iconContainer, { backgroundColor: action.bgColor }]}
              >
                <Ionicons 
                  name={action.icon as any} 
                  size={24} 
                  color={action.color} 
                />
              </View>
              
              <Text style={styles.actionTitle}>
                {action.title}
              </Text>
              <Text style={styles.actionSubtitle}>
                {action.subtitle}
              </Text>
            </Card>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    paddingHorizontal: 8,
  },
  container: {
    flexDirection: 'row',
  },
  actionItem: {
    marginRight: 12,
  },
  actionCard: {
    width: 144,
    padding: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#6b7280',
  },
});