import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from '../src/components/ui/Card';
import { apiClient } from '../src/services/apiClient';
import { Subject } from '../src/stores/plannerStore';

interface MCQQuestion {
  id: string;
  stem: string;
  options: string[];
  answer_index: number;
  explanation: string;
}

interface MCQSession {
  questions: MCQQuestion[];
  currentIndex: number;
  selectedAnswer: number | null;
  showAnswer: boolean;
  score: number;
  isCompleted: boolean;
}

export default function MCQScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [session, setSession] = useState<MCQSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  
  useEffect(() => {
    generateMCQSession();
  }, []);
  
  const generateMCQSession = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.post('/mcq/generate', {
        subject: 'gs1',
        topic: 'General Studies',
        count: 5
      });
      
      const questions = response.data.questions || [];
      setSession({
        questions,
        currentIndex: 0,
        selectedAnswer: null,
        showAnswer: false,
        score: 0,
        isCompleted: false
      });
      setStartTime(new Date());
    } catch (error) {
      console.error('Error generating MCQs:', error);
      Alert.alert('Error', 'Failed to load questions. Please try again.');
      // Mock data for demo
      const mockQuestions: MCQQuestion[] = [
        {
          id: '1',
          stem: 'Which of the following is the largest state in India by area?',
          options: ['Rajasthan', 'Madhya Pradesh', 'Maharashtra', 'Uttar Pradesh'],
          answer_index: 0,
          explanation: 'Rajasthan is the largest state in India by area, covering approximately 342,239 square kilometers.'
        },
        {
          id: '2',
          stem: 'The Indian Constitution was adopted on which date?',
          options: ['15 August 1947', '26 January 1950', '26 November 1949', '2 October 1948'],
          answer_index: 2,
          explanation: 'The Indian Constitution was adopted by the Constituent Assembly on 26 November 1949 and came into effect on 26 January 1950.'
        }
      ];
      
      setSession({
        questions: mockQuestions,
        currentIndex: 0,
        selectedAnswer: null,
        showAnswer: false,
        score: 0,
        isCompleted: false
      });
      setStartTime(new Date());
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleOptionSelect = (optionIndex: number) => {
    if (session && !session.showAnswer) {
      setSession({
        ...session,
        selectedAnswer: optionIndex
      });
    }
  };
  
  const handleShowAnswer = () => {
    if (!session || session.selectedAnswer === null) {
      Alert.alert('Please select an answer', 'Choose one option before revealing the answer.');
      return;
    }
    
    const isCorrect = session.selectedAnswer === session.questions[session.currentIndex].answer_index;
    const newScore = isCorrect ? session.score + 1 : session.score;
    
    setSession({
      ...session,
      showAnswer: true,
      score: newScore
    });
  };
  
  const handleNextQuestion = () => {
    if (!session) return;
    
    const nextIndex = session.currentIndex + 1;
    
    if (nextIndex >= session.questions.length) {
      // Session completed
      setSession({
        ...session,
        isCompleted: true
      });
    } else {
      setSession({
        ...session,
        currentIndex: nextIndex,
        selectedAnswer: null,
        showAnswer: false
      });
    }
  };
  
  const handleRestart = () => {
    generateMCQSession();
  };
  
  const getElapsedTime = () => {
    if (!startTime) return '00:00';
    const now = new Date();
    const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Generating MCQ questions...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  if (!session) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load questions</Text>
          <TouchableOpacity style={styles.retryButton} onPress={generateMCQSession}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  const currentQuestion = session.questions[session.currentIndex];
  const isCorrect = session.selectedAnswer === currentQuestion?.answer_index;
  
  if (session.isCompleted) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        
        <ScrollView style={styles.completedContainer}>
          <LinearGradient
            colors={['#10b981', '#059669']}
            style={styles.completedHeader}
          >
            <Ionicons name="checkmark-circle" size={64} color="white" />
            <Text style={styles.completedTitle}>Quiz Completed!</Text>
            <Text style={styles.completedSubtitle}>
              Great job on completing the MCQ session
            </Text>
          </LinearGradient>
          
          <View style={styles.completedContent}>
            <Card style={styles.resultCard}>
              <Text style={styles.resultTitle}>Your Results</Text>
              
              <View style={styles.resultStats}>
                <View style={styles.resultStatItem}>
                  <Text style={styles.resultStatValue}>{session.score}</Text>
                  <Text style={styles.resultStatLabel}>Correct</Text>
                </View>
                <View style={styles.resultStatItem}>
                  <Text style={styles.resultStatValue}>{session.questions.length - session.score}</Text>
                  <Text style={styles.resultStatLabel}>Incorrect</Text>
                </View>
                <View style={styles.resultStatItem}>
                  <Text style={styles.resultStatValue}>{Math.round((session.score / session.questions.length) * 100)}%</Text>
                  <Text style={styles.resultStatLabel}>Score</Text>
                </View>
                <View style={styles.resultStatItem}>
                  <Text style={styles.resultStatValue}>{getElapsedTime()}</Text>
                  <Text style={styles.resultStatLabel}>Time</Text>
                </View>
              </View>
            </Card>
            
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.actionButton} onPress={handleRestart}>
                <Ionicons name="refresh" size={20} color="#3b82f6" />
                <Text style={styles.actionButtonText}>Try Again</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionButton} onPress={() => router.back()}>
                <Ionicons name="home" size={20} color="#10b981" />
                <Text style={styles.actionButtonText}>Back to Home</Text>
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
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#4b5563" />
        </TouchableOpacity>
        
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>MCQ Practice</Text>
          <Text style={styles.headerProgress}>
            Question {session.currentIndex + 1} of {session.questions.length}
          </Text>
        </View>
        
        <View style={styles.timer}>
          <Ionicons name="time" size={16} color="#6b7280" />
          <Text style={styles.timerText}>{getElapsedTime()}</Text>
        </View>
      </View>
      
      {/* Progress Bar */}
      <View style={styles.progressBar}>
        <View 
          style={[
            styles.progressFill, 
            { width: `${((session.currentIndex + 1) / session.questions.length) * 100}%` }
          ]} 
        />
      </View>
      
      <ScrollView style={styles.content}>
        {/* Question */}
        <Card style={styles.questionCard}>
          <Text style={styles.questionText}>{currentQuestion?.stem}</Text>
        </Card>
        
        {/* Options */}
        <View style={styles.optionsContainer}>
          {currentQuestion?.options.map((option, index) => {
            let optionStyle = styles.option;
            let textStyle = styles.optionText;
            
            if (session.showAnswer) {
              if (index === currentQuestion.answer_index) {
                optionStyle = styles.correctOption;
                textStyle = styles.correctOptionText;
              } else if (index === session.selectedAnswer) {
                optionStyle = styles.incorrectOption;
                textStyle = styles.incorrectOptionText;
              }
            } else if (session.selectedAnswer === index) {
              optionStyle = styles.selectedOption;
              textStyle = styles.selectedOptionText;
            }
            
            return (
              <TouchableOpacity
                key={index}
                style={optionStyle}
                onPress={() => handleOptionSelect(index)}
                disabled={session.showAnswer}
              >
                <View style={styles.optionContent}>
                  <View style={styles.optionIndex}>
                    <Text style={styles.optionIndexText}>
                      {String.fromCharCode(65 + index)}
                    </Text>
                  </View>
                  <Text style={textStyle}>{option}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
        
        {/* Explanation */}
        {session.showAnswer && currentQuestion && (
          <Card style={styles.explanationCard}>
            <View style={styles.explanationHeader}>
              <Ionicons 
                name={isCorrect ? "checkmark-circle" : "close-circle"} 
                size={24} 
                color={isCorrect ? "#10b981" : "#ef4444"} 
              />
              <Text style={[styles.explanationTitle, { color: isCorrect ? "#10b981" : "#ef4444" }]}>
                {isCorrect ? "Correct!" : "Incorrect"}
              </Text>
            </View>
            <Text style={styles.explanationText}>{currentQuestion.explanation}</Text>
          </Card>
        )}
        
        {/* Action Button */}
        <View style={styles.actionContainer}>
          {!session.showAnswer ? (
            <TouchableOpacity 
              style={[styles.actionBtn, session.selectedAnswer === null && styles.disabledBtn]} 
              onPress={handleShowAnswer}
              disabled={session.selectedAnswer === null}
            >
              <Text style={styles.actionBtnText}>Show Answer</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.actionBtn} onPress={handleNextQuestion}>
              <Text style={styles.actionBtnText}>
                {session.currentIndex + 1 >= session.questions.length ? 'Finish' : 'Next Question'}
              </Text>
              <Ionicons name="arrow-forward" size={20} color="white" />
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  errorText: {
    fontSize: 18,
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  headerProgress: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  timer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timerText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e5e7eb',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  questionCard: {
    padding: 20,
    marginBottom: 20,
  },
  questionText: {
    fontSize: 18,
    lineHeight: 24,
    color: '#111827',
    fontWeight: '500',
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  option: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    padding: 16,
  },
  selectedOption: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
  },
  correctOption: {
    backgroundColor: '#ecfdf5',
    borderColor: '#10b981',
  },
  incorrectOption: {
    backgroundColor: '#fef2f2',
    borderColor: '#ef4444',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIndex: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optionIndexText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  selectedOptionText: {
    color: '#1d4ed8',
  },
  correctOptionText: {
    color: '#065f46',
  },
  incorrectOptionText: {
    color: '#dc2626',
  },
  explanationCard: {
    padding: 20,
    marginBottom: 20,
    backgroundColor: '#f8fafc',
  },
  explanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  explanationText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#4b5563',
  },
  actionContainer: {
    marginBottom: 32,
  },
  actionBtn: {
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  disabledBtn: {
    backgroundColor: '#9ca3af',
  },
  actionBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // Completion styles
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
    color: '#d1fae5',
    marginTop: 8,
    textAlign: 'center',
  },
  completedContent: {
    padding: 24,
  },
  resultCard: {
    padding: 24,
    marginBottom: 24,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  resultStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  resultStatItem: {
    alignItems: 'center',
  },
  resultStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  resultStatLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
});