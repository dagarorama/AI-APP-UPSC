import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
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
      <Card style={styles.emptyCard}>
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={48} color="#9ca3af" />
          <Text style={styles.emptyTitle}>
            No study plan for today.
          </Text>
          <Text style={styles.emptySubtitle}>
            Create a plan to get started!
          </Text>
        </View>
      </Card>
    );
  }
  
  const handleMarkDone = async (item: PlanItem) => {
    try {
      const minutes = item.target_minutes;
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
      contentContainerStyle={styles.scrollContainer}
    >
      <View style={styles.container}>
        {items.map((item) => {
          const subjectStyle = subjectColors[item.subject];
          const isCompleted = item.status === 'done';
          const isSkipped = item.status === 'skipped';
          
          return (
            <Card key={item.id} style={styles.itemCard}>
              {/* Subject Badge */}
              <View style={styles.itemHeader}>
                <View 
                  style={[styles.subjectBadge, { backgroundColor: subjectStyle.bg }]}
                >
                  <Text 
                    style={[styles.subjectText, { color: subjectStyle.text }]}
                  >
                    {item.subject.toUpperCase()}
                  </Text>
                </View>
                
                {isCompleted && (
                  <View style={styles.completedIcon}>
                    <Ionicons name="checkmark" size={16} color="white" />
                  </View>
                )}
                
                {isSkipped && (
                  <View style={styles.skippedIcon}>
                    <Ionicons name="remove" size={16} color="white" />
                  </View>
                )}
              </View>
              
              {/* Topic */}
              <Text style={styles.topicText} numberOfLines={2}>
                {item.topic}
              </Text>
              
              {/* Duration */}
              <View style={styles.durationContainer}>
                <Ionicons name="time-outline" size={16} color="#6b7280" />
                <Text style={styles.durationText}>
                  {item.target_minutes} minutes
                </Text>
                {item.actual_minutes > 0 && (
                  <Text style={styles.actualMinutes}>
                    ({item.actual_minutes} completed)
                  </Text>
                )}
              </View>
              
              {/* Actions */}
              {!isCompleted && !isSkipped && (
                <View style={styles.actionsContainer}>
                  <TouchableOpacity 
                    style={styles.doneButton}
                    onPress={() => handleMarkDone(item)}
                  >
                    <Text style={styles.doneButtonText}>Mark Done</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.skipButton}
                    onPress={() => handleMarkSkipped(item)}
                  >
                    <Text style={styles.skipButtonText}>Skip</Text>
                  </TouchableOpacity>
                </View>
              )}
              
              {isCompleted && (
                <View style={styles.completedContainer}>
                  <Text style={styles.completedText}>
                    ✓ Completed
                  </Text>
                </View>
              )}
              
              {isSkipped && (
                <View style={styles.skippedContainer}>
                  <Text style={styles.skippedText}>
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

const styles = StyleSheet.create({
  scrollContainer: {
    paddingHorizontal: 8,
  },
  container: {
    flexDirection: 'row',
  },
  emptyCard: {
    padding: 24,
  },
  emptyContainer: {
    alignItems: 'center',
  },
  emptyTitle: {
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 12,
  },
  emptySubtitle: {
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 4,
  },
  itemCard: {
    width: 288,
    padding: 16,
    marginRight: 16,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  subjectBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  subjectText: {
    fontSize: 12,
    fontWeight: '600',
  },
  completedIcon: {
    width: 24,
    height: 24,
    backgroundColor: '#10b981',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skippedIcon: {
    width: 24,
    height: 24,
    backgroundColor: '#f59e0b',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topicText: {
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  durationText: {
    color: '#6b7280',
    fontSize: 14,
    marginLeft: 4,
  },
  actualMinutes: {
    color: '#10b981',
    fontSize: 14,
    marginLeft: 8,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  doneButton: {
    flex: 1,
    backgroundColor: '#d1fae5',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#065f46',
    fontWeight: '500',
  },
  skipButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#4b5563',
    fontWeight: '500',
  },
  completedContainer: {
    backgroundColor: '#d1fae5',
    padding: 12,
    borderRadius: 8,
  },
  completedText: {
    color: '#065f46',
    fontWeight: '500',
    textAlign: 'center',
  },
  skippedContainer: {
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 8,
  },
  skippedText: {
    color: '#92400e',
    fontWeight: '500',
    textAlign: 'center',
  },
});