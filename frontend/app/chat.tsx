import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../src/components/ui/Card';
import { apiClient } from '../src/services/apiClient';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  mode: 'general' | 'rag' | 'planner';
}

export default function ChatScreen() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your UPSC AI assistant. I can help you with general UPSC queries, study planning, and answer questions based on your uploaded resources. How can I help you today?',
      timestamp: new Date(),
      mode: 'general'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [currentMode, setCurrentMode] = useState<'general' | 'rag' | 'planner'>('general');
  const [isLoading, setIsLoading] = useState(false);
  const sessionId = useRef(`session-${Date.now()}`).current;
  
  const modes = [
    { key: 'general' as const, label: 'General', icon: 'chatbubble', color: '#3b82f6' },
    { key: 'rag' as const, label: 'Resources', icon: 'library', color: '#10b981' },
    { key: 'planner' as const, label: 'Planner', icon: 'calendar', color: '#8b5cf6' },
  ];
  
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);
  
  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date(),
      mode: currentMode
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    
    try {
      const response = await apiClient.post('/chat/message', {
        session_id: sessionId,
        message: userMessage.content,
        mode: currentMode,
        context: {}
      });
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.data.response,
        timestamp: new Date(),
        mode: currentMode
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I\'m having trouble connecting right now. Please try again.',
        timestamp: new Date(),
        mode: currentMode
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const getModeDescription = () => {
    switch (currentMode) {
      case 'general':
        return 'Ask me anything about UPSC preparation, syllabus, current affairs, or study strategies.';
      case 'rag':
        return 'I can answer questions based on your uploaded PDFs, notes, and study materials.';
      case 'planner':
        return 'Get help with creating study schedules, managing time, and tracking progress.';
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#4b5563" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>UPSC AI Assistant</Text>
          <Text style={styles.headerSubtitle}>{getModeDescription()}</Text>
        </View>
      </View>
      
      {/* Mode Selector */}
      <View style={styles.modeSelector}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.modesContainer}
        >
          {modes.map(mode => (
            <TouchableOpacity
              key={mode.key}
              style={[
                styles.modeButton,
                currentMode === mode.key && { backgroundColor: mode.color }
              ]}
              onPress={() => setCurrentMode(mode.key)}
            >
              <Ionicons 
                name={mode.icon as any} 
                size={16} 
                color={currentMode === mode.key ? 'white' : mode.color} 
              />
              <Text style={[
                styles.modeButtonText,
                currentMode === mode.key && { color: 'white' }
              ]}>
                {mode.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      {/* Messages */}
      <KeyboardAvoidingView 
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={100}
      >
        <ScrollView 
          ref={scrollViewRef}
          style={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.messagesContent}
        >
          {messages.map(message => (
            <View key={message.id} style={[
              styles.messageContainer,
              message.role === 'user' ? styles.userMessage : styles.assistantMessage
            ]}>
              <Card style={[
                styles.messageBubble,
                message.role === 'user' ? styles.userBubble : styles.assistantBubble
              ]}>
                <Text style={[
                  styles.messageText,
                  message.role === 'user' && styles.userMessageText
                ]}>
                  {message.content}
                </Text>
                <Text style={[
                  styles.messageTime,
                  message.role === 'user' && styles.userMessageTime
                ]}>
                  {message.timestamp.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Text>
              </Card>
            </View>
          ))}
          
          {isLoading && (
            <View style={[styles.messageContainer, styles.assistantMessage]}>
              <Card style={[styles.messageBubble, styles.assistantBubble]}>
                <View style={styles.typingIndicator}>
                  <View style={[styles.typingDot, styles.typingDot1]} />
                  <View style={[styles.typingDot, styles.typingDot2]} />
                  <View style={[styles.typingDot, styles.typingDot3]} />
                </View>
              </Card>
            </View>
          )}
        </ScrollView>
        
        {/* Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder={`Ask about ${currentMode === 'general' ? 'UPSC topics' : currentMode === 'rag' ? 'your resources' : 'study planning'}...`}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
            />
            <TouchableOpacity 
              style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
              onPress={sendMessage}
              disabled={!inputText.trim() || isLoading}
            >
              <Ionicons name="send" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
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
  modeSelector: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  modeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    gap: 6,
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  messageContainer: {
    marginBottom: 16,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  assistantMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
  },
  userBubble: {
    backgroundColor: '#3b82f6',
  },
  assistantBubble: {
    backgroundColor: 'white',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    color: '#111827',
  },
  userMessageText: {
    color: 'white',
  },
  messageTime: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 4,
    textAlign: 'right',
  },
  userMessageTime: {
    color: '#bfdbfe',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#9ca3af',
  },
  typingDot1: {
    // animation would go here
  },
  typingDot2: {
    // animation would go here
  },
  typingDot3: {
    // animation would go here
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#f9fafb',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    maxHeight: 100,
    paddingVertical: 4,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
});