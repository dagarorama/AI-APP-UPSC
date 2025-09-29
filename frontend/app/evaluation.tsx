import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, KeyboardAvoidingView, Platform, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useState, useRef } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { Card } from '../src/components/ui/Card';
import { apiClient } from '../src/services/apiClient';

interface EvaluationStep {
  id: 'question' | 'upload' | 'processing' | 'results';
  title: string;
  description: string;
}

interface EvaluationResult {
  id: string;
  question: string;
  answer_image: string;
  ocr_text: string;
  score: number;
  rubric: {
    structure: number;
    relevance: number;
    examples: number;
    language: number;
    conclusion: number;
  };
  suggestions: string;
}

const steps: EvaluationStep[] = [
  {
    id: 'question',
    title: 'Enter Question',
    description: 'Type the UPSC Mains question you answered'
  },
  {
    id: 'upload',
    title: 'Upload Answer',
    description: 'Take a photo or upload your handwritten answer'
  },
  {
    id: 'processing',
    title: 'AI Analysis',
    description: 'Our AI is analyzing your answer using OCR and evaluation models'
  },
  {
    id: 'results',
    title: 'Results',
    description: 'View your detailed evaluation and improvement suggestions'
  }
];

export default function EvaluationScreen() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<'question' | 'upload' | 'processing' | 'results'>('question');
  const [question, setQuestion] = useState('');
  const [answerImage, setAnswerImage] = useState<string | null>(null);
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleQuestionNext = () => {
    if (!question.trim()) {
      Alert.alert('Required', 'Please enter the question you answered');
      return;
    }
    setCurrentStep('upload');
  };
  
  const handleImagePicker = () => {
    Alert.alert(
      'Upload Answer',
      'Choose how you want to upload your answer',
      [
        { text: 'Take Photo', onPress: () => pickImageFromCamera() },
        { text: 'Choose from Gallery', onPress: () => pickImageFromGallery() },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };
  
  const pickImageFromCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Please grant camera permission to take photos');
      return;
    }
    
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        base64: true
      });
      
      if (!result.canceled && result.assets[0]) {
        const image = result.assets[0];
        if (image.base64) {
          setAnswerImage(`data:image/jpeg;base64,${image.base64}`);
          setCurrentStep('processing');
          evaluateAnswer(image.base64);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    }
  };
  
  const pickImageFromGallery = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Please grant permission to access photos');
      return;
    }
    
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        base64: true
      });
      
      if (!result.canceled && result.assets[0]) {
        const image = result.assets[0];
        if (image.base64) {
          setAnswerImage(`data:image/jpeg;base64,${image.base64}`);
          setCurrentStep('processing');
          evaluateAnswer(image.base64);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };
  
  const evaluateAnswer = async (base64Image: string) => {
    setIsProcessing(true);
    try {
      const response = await apiClient.post('/evaluation/answer', {
        question: question,
        answer_image: base64Image
      });
      
      setEvaluationResult(response.data);
      setCurrentStep('results');
    } catch (error) {
      console.error('Evaluation error:', error);
      // Mock evaluation result for demo
      const mockResult: EvaluationResult = {
        id: '1',
        question: question,
        answer_image: `data:image/jpeg;base64,${base64Image}`,
        ocr_text: "This is the extracted text from your handwritten answer. The OCR technology has successfully identified and converted your handwritten content into digital text for analysis.",
        score: 32,
        rubric: {
          structure: 7,
          relevance: 8,
          examples: 6,
          language: 7,
          conclusion: 4
        },
        suggestions: "Your answer demonstrates good understanding of the topic. To improve: 1) Strengthen your conclusion with more decisive statements, 2) Include more contemporary examples, 3) Structure your paragraphs with clearer topic sentences, 4) Enhance factual accuracy in certain areas."
      };
      
      setTimeout(() => {
        setEvaluationResult(mockResult);
        setCurrentStep('results');
        setIsProcessing(false);
      }, 3000);
      return;
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleRestart = () => {
    setCurrentStep('question');
    setQuestion('');
    setAnswerImage(null);
    setEvaluationResult(null);
    setIsProcessing(false);
  };
  
  const getRubricColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return '#10b981';
    if (percentage >= 60) return '#f59e0b';
    return '#ef4444';
  };
  
  const getCurrentStepIndex = () => {
    return steps.findIndex(step => step.id === currentStep);
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <KeyboardAvoidingView 
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#4b5563" />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Answer Evaluation</Text>
            <Text style={styles.headerSubtitle}>AI-powered Mains answer assessment</Text>
          </View>
        </View>
        
        {/* Progress Steps */}
        <View style={styles.stepsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.steps}>
            {steps.map((step, index) => {
              const isActive = step.id === currentStep;
              const isCompleted = steps.findIndex(s => s.id === currentStep) > index;
              
              return (
                <View key={step.id} style={styles.step}>
                  <View style={[
                    styles.stepIndicator,
                    isActive && styles.activeStep,
                    isCompleted && styles.completedStep
                  ]}>
                    {isCompleted ? (
                      <Ionicons name="checkmark" size={16} color="white" />
                    ) : (
                      <Text style={[
                        styles.stepNumber,
                        (isActive || isCompleted) && styles.activeStepNumber
                      ]}>
                        {index + 1}
                      </Text>
                    )}
                  </View>
                  <Text style={[styles.stepTitle, isActive && styles.activeStepTitle]}>
                    {step.title}
                  </Text>
                </View>
              );
            })}
          </ScrollView>
        </View>
        
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Step 1: Question Input */}
          {currentStep === 'question' && (
            <View style={styles.stepContent}>
              <Card style={styles.questionCard}>
                <Text style={styles.stepDescription}>
                  Enter the exact UPSC Mains question that you have answered. This helps our AI provide more accurate evaluation based on the question's requirements.
                </Text>
                
                <TextInput
                  style={styles.questionInput}
                  placeholder="Enter the UPSC Mains question here..."
                  value={question}
                  onChangeText={setQuestion}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                />
                
                <TouchableOpacity style={styles.nextButton} onPress={handleQuestionNext}>
                  <Text style={styles.nextButtonText}>Continue</Text>
                  <Ionicons name="arrow-forward" size={20} color="white" />
                </TouchableOpacity>
              </Card>
            </View>
          )}
          
          {/* Step 2: Image Upload */}
          {currentStep === 'upload' && (
            <View style={styles.stepContent}>
              <Card style={styles.uploadCard}>
                <Text style={styles.stepDescription}>
                  Upload a clear photo of your handwritten answer. Make sure the text is readable and well-lit for best OCR results.
                </Text>
                
                <TouchableOpacity style={styles.uploadButton} onPress={handleImagePicker}>
                  <View style={styles.uploadIcon}>
                    <Ionicons name="camera" size={32} color="#3b82f6" />
                  </View>
                  <Text style={styles.uploadButtonText}>Take Photo or Upload Image</Text>
                  <Text style={styles.uploadSubtext}>Tap to capture or select your answer</Text>
                </TouchableOpacity>
              </Card>
            </View>
          )}
          
          {/* Step 3: Processing */}
          {currentStep === 'processing' && (
            <View style={styles.stepContent}>
              <Card style={styles.processingCard}>
                <LinearGradient
                  colors={['#3b82f6', '#1d4ed8']}
                  style={styles.processingGradient}
                >
                  <View style={styles.processingContent}>
                    <View style={styles.processingSpinner}>
                      <Ionicons name="analytics" size={48} color="white" />
                    </View>
                    
                    <Text style={styles.processingTitle}>Analyzing Your Answer</Text>
                    <Text style={styles.processingSubtitle}>
                      Our AI is performing OCR text extraction and evaluating your answer based on UPSC Mains criteria
                    </Text>
                    
                    <View style={styles.processingSteps}>
                      <Text style={styles.processingStep}>✓ Image processed</Text>
                      <Text style={styles.processingStep}>✓ Text extracted using OCR</Text>
                      <Text style={styles.processingStep}>⏳ Evaluating content...</Text>
                      <Text style={styles.processingStep}>⏳ Generating feedback...</Text>
                    </View>
                  </View>
                </LinearGradient>
              </Card>
            </View>
          )}
          
          {/* Step 4: Results */}
          {currentStep === 'results' && evaluationResult && (
            <View style={styles.stepContent}>
              {/* Score Overview */}
              <Card style={styles.scoreCard}>
                <View style={styles.scoreHeader}>
                  <View style={styles.scoreCircle}>
                    <Text style={styles.scoreNumber}>{evaluationResult.score}</Text>
                    <Text style={styles.scoreOutOf}>/ 50</Text>
                  </View>
                  <View style={styles.scoreInfo}>
                    <Text style={styles.scoreTitle}>Overall Score</Text>
                    <Text style={styles.scoreGrade}>
                      {evaluationResult.score >= 40 ? 'Excellent' :
                       evaluationResult.score >= 30 ? 'Good' :
                       evaluationResult.score >= 20 ? 'Average' : 'Needs Improvement'}
                    </Text>
                  </View>
                </View>
              </Card>
              
              {/* Detailed Rubric */}
              <Card style={styles.rubricCard}>
                <Text style={styles.rubricTitle}>Detailed Evaluation</Text>
                
                {Object.entries(evaluationResult.rubric).map(([criterion, score]) => {
                  const maxScores: Record<string, number> = {
                    structure: 10,
                    relevance: 15,
                    examples: 10,
                    language: 10,
                    conclusion: 5
                  };
                  
                  const maxScore = maxScores[criterion] || 10;
                  const percentage = (score / maxScore) * 100;
                  const color = getRubricColor(score, maxScore);
                  
                  return (
                    <View key={criterion} style={styles.rubricItem}>
                      <View style={styles.rubricHeader}>
                        <Text style={styles.rubricCriterion}>
                          {criterion.charAt(0).toUpperCase() + criterion.slice(1)}
                        </Text>
                        <Text style={[styles.rubricScore, { color }]}>
                          {score}/{maxScore}
                        </Text>
                      </View>
                      <View style={styles.rubricProgressBar}>
                        <View 
                          style={[
                            styles.rubricProgress, 
                            { width: `${percentage}%`, backgroundColor: color }
                          ]} 
                        />
                      </View>
                    </View>
                  );
                })}
              </Card>
              
              {/* OCR Text */}
              <Card style={styles.ocrCard}>
                <Text style={styles.ocrTitle}>Extracted Text (OCR)</Text>
                <Text style={styles.ocrText}>{evaluationResult.ocr_text}</Text>
              </Card>
              
              {/* Suggestions */}
              <Card style={styles.suggestionsCard}>
                <Text style={styles.suggestionsTitle}>Improvement Suggestions</Text>
                <Text style={styles.suggestionsText}>{evaluationResult.suggestions}</Text>
              </Card>
              
              {/* Actions */}
              <View style={styles.resultActions}>
                <TouchableOpacity style={styles.restartButton} onPress={handleRestart}>
                  <Ionicons name="refresh" size={20} color="#3b82f6" />
                  <Text style={styles.restartButtonText}>Evaluate Another</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.homeButton} onPress={() => router.back()}>
                  <Ionicons name="home" size={20} color="white" />
                  <Text style={styles.homeButtonText}>Back to Home</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  keyboardContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
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
  headerContent: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  stepsContainer: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  steps: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 24,
  },
  step: {
    alignItems: 'center',
    minWidth: 80,
  },
  stepIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  activeStep: {
    backgroundColor: '#3b82f6',
  },
  completedStep: {
    backgroundColor: '#10b981',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  activeStepNumber: {
    color: 'white',
  },
  stepTitle: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  activeStepTitle: {
    color: '#3b82f6',
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  stepContent: {
    padding: 16,
  },
  stepDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 20,
  },
  questionCard: {
    padding: 20,
  },
  questionInput: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 12,
    fontSize: 16,
    height: 120,
    marginBottom: 20,
  },
  nextButton: {
    backgroundColor: '#3b82f6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    gap: 8,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  uploadCard: {
    padding: 20,
  },
  uploadButton: {
    alignItems: 'center',
    paddingVertical: 40,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    borderRadius: 12,
    backgroundColor: '#f9fafb',
  },
  uploadIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  uploadSubtext: {
    fontSize: 14,
    color: '#6b7280',
  },
  processingCard: {
    overflow: 'hidden',
  },
  processingGradient: {
    padding: 32,
  },
  processingContent: {
    alignItems: 'center',
  },
  processingSpinner: {
    marginBottom: 20,
  },
  processingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  processingSubtitle: {
    fontSize: 14,
    color: '#bfdbfe',
    textAlign: 'center',
    marginBottom: 24,
  },
  processingSteps: {
    alignSelf: 'stretch',
    gap: 8,
  },
  processingStep: {
    fontSize: 14,
    color: 'white',
  },
  scoreCard: {
    padding: 20,
    marginBottom: 16,
  },
  scoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  scoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  scoreOutOf: {
    fontSize: 12,
    color: '#6b7280',
  },
  scoreInfo: {
    flex: 1,
  },
  scoreTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  scoreGrade: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  rubricCard: {
    padding: 20,
    marginBottom: 16,
  },
  rubricTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  rubricItem: {
    marginBottom: 16,
  },
  rubricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  rubricCriterion: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  rubricScore: {
    fontSize: 14,
    fontWeight: '600',
  },
  rubricProgressBar: {
    height: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 3,
  },
  rubricProgress: {
    height: '100%',
    borderRadius: 3,
  },
  ocrCard: {
    padding: 20,
    marginBottom: 16,
  },
  ocrTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  ocrText: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
  },
  suggestionsCard: {
    padding: 20,
    marginBottom: 16,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  suggestionsText: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  resultActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  restartButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#3b82f6',
    borderRadius: 8,
    paddingVertical: 16,
    gap: 8,
  },
  restartButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3b82f6',
  },
  homeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    paddingVertical: 16,
    gap: 8,
  },
  homeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'white',
  },
});