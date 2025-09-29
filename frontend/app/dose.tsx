import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from '../src/components/ui/Card';

interface DoseItem {
  id: string;
  type: 'mcq' | 'current_affairs' | 'essay_topic';
  title: string;
  content: string;
  completed: boolean;
}

interface MCQItem extends DoseItem {
  type: 'mcq';
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  userAnswer?: number;
}

interface CurrentAffairsItem extends DoseItem {
  type: 'current_affairs';
  date: string;
  category: string;
  summary: string;
}

interface EssayTopicItem extends DoseItem {
  type: 'essay_topic';
  topic: string;
  hints: string[];
  wordLimit: number;
}

type DoseItemType = MCQItem | CurrentAffairsItem | EssayTopicItem;

const mockDoseContent: DoseItemType[] = [
  {
    id: '1',
    type: 'mcq',
    title: 'Quick MCQ - Indian Polity',
    content: 'Constitutional provision',
    question: 'Which Article of the Indian Constitution deals with the Right to Education?',
    options: ['Article 21', 'Article 21A', 'Article 22', 'Article 19'],
    correctAnswer: 1,
    explanation: 'Article 21A was inserted by the 86th Constitutional Amendment Act, 2002, which makes free and compulsory education a fundamental right for children aged 6-14 years.',
    completed: false
  },
  {
    id: '2',
    type: 'current_affairs',
    title: 'Today\'s Current Affairs',
    content: 'Recent developments',
    date: new Date().toISOString().split('T')[0],
    category: 'Economy',
    summary: 'India\'s GDP growth shows resilience amid global economic challenges. The latest quarterly figures indicate sustained economic momentum with focus on digital infrastructure and sustainable development initiatives.',
    completed: false
  },
  {
    id: '3',
    type: 'essay_topic',
    title: 'Essay Topic of the Day',
    content: 'Practice writing',
    topic: 'Digital India: Transforming Governance and Empowering Citizens',
    hints: [
      'Discuss digital infrastructure development',
      'Analyze e-governance initiatives',
      'Examine digital literacy programs',
      'Address challenges and solutions',
      'Conclude with future prospects'
    ],
    wordLimit: 250,
    completed: false
  }
];

export default function DoseScreen() {
  const router = useRouter();
  const [doseItems, setDoseItems] = useState<DoseItemType[]>(mockDoseContent);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  
  const currentItem = doseItems[currentItemIndex];
  const completedCount = doseItems.filter(item => item.completed).length;
  const totalCount = doseItems.length;
  
  useEffect(() => {
    if (completedCount === totalCount) {
      setIsCompleted(true);
    }
  }, [completedCount, totalCount]);
  
  const handleMCQAnswer = (answerIndex: number) => {
    if (currentItem.type === 'mcq') {
      const updatedItems = [...doseItems];
      (updatedItems[currentItemIndex] as MCQItem).userAnswer = answerIndex;
      (updatedItems[currentItemIndex] as MCQItem).completed = true;
      setDoseItems(updatedItems);
    }
  };
  
  const handleMarkComplete = () => {
    const updatedItems = [...doseItems];
    updatedItems[currentItemIndex].completed = true;
    setDoseItems(updatedItems);
  };
  
  const handleNext = () => {
    if (currentItemIndex < doseItems.length - 1) {
      setCurrentItemIndex(currentItemIndex + 1);
    }
  };
  
  const handleRestart = () => {
    setDoseItems(mockDoseContent.map(item => ({ ...item, completed: false })));
    setCurrentItemIndex(0);
    setIsCompleted(false);
  };
  
  if (isCompleted) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        
        <ScrollView style={styles.completedContainer}>
          <LinearGradient
            colors={['#f59e0b', '#d97706']}
            style={styles.completedHeader}
          >
            <Ionicons name="trophy" size={64} color="white" />
            <Text style={styles.completedTitle}>Daily Dose Complete!</Text>
            <Text style={styles.completedSubtitle}>
              Congratulations! You've completed today's UPSC dose
            </Text>
            
            <View style={styles.streakBadge}>
              <Ionicons name="flame" size={20} color="#f59e0b" />
              <Text style={styles.streakText}>Streak maintained!</Text>
            </View>
          </LinearGradient>
          
          <View style={styles.completedContent}>
            <Card style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Today's Summary</Text>
              
              <View style={styles.summaryItems}>
                <View style={styles.summaryItem}>
                  <Ionicons name="help-circle" size={24} color="#3b82f6" />
                  <Text style={styles.summaryItemText}>1 MCQ completed</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Ionicons name="newspaper" size={24} color="#10b981" />
                  <Text style={styles.summaryItemText}>Current affairs reviewed</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Ionicons name="create" size={24} color="#8b5cf6" />
                  <Text style={styles.summaryItemText}>Essay topic practiced</Text>
                </View>
              </View>
            </Card>
            
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.restartButton} onPress={handleRestart}>
                <Ionicons name="refresh" size={20} color="#f59e0b" />
                <Text style={styles.restartButtonText}>Practice Again</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.homeButton} onPress={() => router.back()}>
                <Ionicons name="home" size={20} color="white" />
                <Text style={styles.homeButtonText}>Back to Home</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <LinearGradient
        colors={['#f59e0b', '#d97706']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Daily UPSC Dose</Text>
            <Text style={styles.headerProgress}>
              {completedCount} of {totalCount} completed
            </Text>
          </View>
          
          <View style={styles.flameIcon}>
            <Ionicons name="flame" size={24} color="white" />
          </View>
        </View>
      </LinearGradient>
      
      {/* Progress Indicators */}
      <View style={styles.progressContainer}>
        <View style={styles.progressDots}>
          {doseItems.map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                index === currentItemIndex && styles.activeProgressDot,
                doseItems[index].completed && styles.completedProgressDot
              ]}
            />
          ))}
        </View>
      </View>
      
      <ScrollView style={styles.content}>
        {/* Current Item */}
        {currentItem.type === 'mcq' && (
          <View style={styles.mcqContainer}>
            <Card style={styles.mcqCard}>
              <View style={styles.mcqHeader}>
                <Ionicons name="help-circle" size={24} color="#3b82f6" />
                <Text style={styles.mcqTitle}>{currentItem.title}</Text>
              </View>
              
              <Text style={styles.mcqQuestion}>{currentItem.question}</Text>
              
              <View style={styles.mcqOptions}>
                {currentItem.options.map((option, index) => {
                  let optionStyle = styles.mcqOption;
                  let textStyle = styles.mcqOptionText;
                  
                  if (currentItem.userAnswer !== undefined) {
                    if (index === currentItem.correctAnswer) {
                      optionStyle = styles.correctOption;
                      textStyle = styles.correctOptionText;
                    } else if (index === currentItem.userAnswer) {
                      optionStyle = styles.incorrectOption;
                      textStyle = styles.incorrectOptionText;
                    }
                  }
                  
                  return (
                    <TouchableOpacity
                      key={index}
                      style={optionStyle}
                      onPress={() => handleMCQAnswer(index)}
                      disabled={currentItem.userAnswer !== undefined}
                    >
                      <Text style={textStyle}>
                        {String.fromCharCode(65 + index)}. {option}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              
              {currentItem.userAnswer !== undefined && (
                <Card style={styles.explanationCard}>
                  <Text style={styles.explanationTitle}>
                    {currentItem.userAnswer === currentItem.correctAnswer ? '✅ Correct!' : '❌ Incorrect'}
                  </Text>
                  <Text style={styles.explanationText}>{currentItem.explanation}</Text>
                </Card>
              )}
            </Card>
          </View>
        )}
        
        {currentItem.type === 'current_affairs' && (
          <View style={styles.currentAffairsContainer}>
            <Card style={styles.currentAffairsCard}>
              <View style={styles.currentAffairsHeader}>
                <Ionicons name="newspaper" size={24} color="#10b981" />
                <Text style={styles.currentAffairsTitle}>{currentItem.title}</Text>
              </View>
              
              <View style={styles.currentAffairsInfo}>
                <Text style={styles.currentAffairsDate}>{currentItem.date}</Text>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{currentItem.category}</Text>
                </View>
              </View>
              
              <Text style={styles.currentAffairsContent}>{currentItem.summary}</Text>
              
              {!currentItem.completed && (
                <TouchableOpacity style={styles.completeButton} onPress={handleMarkComplete}>
                  <Text style={styles.completeButtonText}>Mark as Read</Text>
                </TouchableOpacity>
              )}
            </Card>
          </View>
        )}
        
        {currentItem.type === 'essay_topic' && (
          <View style={styles.essayContainer}>
            <Card style={styles.essayCard}>
              <View style={styles.essayHeader}>
                <Ionicons name="create" size={24} color="#8b5cf6" />
                <Text style={styles.essayTitle}>{currentItem.title}</Text>
              </View>
              
              <Text style={styles.essayTopic}>{currentItem.topic}</Text>
              
              <View style={styles.essayInfo}>
                <Text style={styles.wordLimit}>Word Limit: {currentItem.wordLimit} words</Text>
              </View>
              
              <Text style={styles.hintsTitle}>Writing Hints:</Text>
              <View style={styles.hintsList}>
                {currentItem.hints.map((hint, index) => (
                  <Text key={index} style={styles.hintItem}>• {hint}</Text>
                ))}
              </View>
              
              {!currentItem.completed && (
                <TouchableOpacity style={styles.completeButton} onPress={handleMarkComplete}>
                  <Text style={styles.completeButtonText}>Mark as Reviewed</Text>
                </TouchableOpacity>
              )}
            </Card>
          </View>
        )}
        
        {/* Next Button */}
        {currentItem.completed && !isCompleted && (
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>
              {currentItemIndex === doseItems.length - 1 ? 'Finish' : 'Next Item'}
            </Text>
            <Ionicons name="arrow-forward" size={20} color="white" />
          </TouchableOpacity>
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
  header: {
    paddingVertical: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  headerProgress: {
    fontSize: 12,
    color: '#fef3c7',
    marginTop: 2,
  },
  flameIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    backgroundColor: 'white',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  progressDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#e5e7eb',
  },
  activeProgressDot: {
    backgroundColor: '#f59e0b',
  },
  completedProgressDot: {
    backgroundColor: '#10b981',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  // MCQ Styles
  mcqContainer: {
    marginBottom: 20,
  },
  mcqCard: {
    padding: 20,
  },
  mcqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  mcqTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  mcqQuestion: {
    fontSize: 16,
    color: '#111827',
    lineHeight: 24,
    marginBottom: 20,
  },
  mcqOptions: {
    gap: 12,
  },
  mcqOption: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
  },
  correctOption: {
    backgroundColor: '#ecfdf5',
    borderColor: '#10b981',
  },
  incorrectOption: {
    backgroundColor: '#fef2f2',
    borderColor: '#ef4444',
  },
  mcqOptionText: {
    fontSize: 14,
    color: '#374151',
  },
  correctOptionText: {
    color: '#065f46',
  },
  incorrectOptionText: {
    color: '#dc2626',
  },
  explanationCard: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#f8fafc',
  },
  explanationTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 13,
    color: '#4b5563',
    lineHeight: 18,
  },
  // Current Affairs Styles
  currentAffairsContainer: {
    marginBottom: 20,
  },
  currentAffairsCard: {
    padding: 20,
  },
  currentAffairsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  currentAffairsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  currentAffairsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  currentAffairsDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  categoryBadge: {
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#065f46',
  },
  currentAffairsContent: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 16,
  },
  // Essay Styles
  essayContainer: {
    marginBottom: 20,
  },
  essayCard: {
    padding: 20,
  },
  essayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  essayTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  essayTopic: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 12,
  },
  essayInfo: {
    marginBottom: 16,
  },
  wordLimit: {
    fontSize: 12,
    color: '#6b7280',
  },
  hintsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  hintsList: {
    marginBottom: 16,
  },
  hintItem: {
    fontSize: 13,
    color: '#4b5563',
    lineHeight: 20,
    marginBottom: 4,
  },
  // Common Styles
  completeButton: {
    backgroundColor: '#10b981',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  completeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  nextButton: {
    backgroundColor: '#f59e0b',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 32,
    gap: 8,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // Completion Styles
  completedContainer: {
    flex: 1,
  },
  completedHeader: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  completedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 16,
  },
  completedSubtitle: {
    fontSize: 16,
    color: '#fef3c7',
    marginTop: 8,
    textAlign: 'center',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 16,
    gap: 6,
  },
  streakText: {
    color: '#d97706',
    fontSize: 14,
    fontWeight: '600',
  },
  completedContent: {
    padding: 24,
  },
  summaryCard: {
    padding: 24,
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  summaryItems: {
    gap: 16,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  summaryItemText: {
    fontSize: 14,
    color: '#374151',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  restartButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#f59e0b',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
  },
  restartButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#d97706',
  },
  homeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f59e0b',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
  },
  homeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'white',
  },
});