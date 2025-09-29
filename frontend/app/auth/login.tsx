import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from '../../src/components/ui/Card';
import { useAuthStore } from '../../src/stores/authStore';

export default function LoginScreen() {
  const router = useRouter();
  const { authenticate } = useAuthStore();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  
  const handleSendOTP = async () => {
    if (!phone || phone.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }
    
    setIsLoading(true);
    // Simulate OTP send
    setTimeout(() => {
      setOtpSent(true);
      setIsLoading(false);
      Alert.alert('OTP Sent!', 'Use 123456 as OTP for demo purposes');
    }, 1000);
  };
  
  const handleVerifyOTP = async () => {
    if (!otp || otp.length < 6) {
      Alert.alert('Error', 'Please enter a valid OTP');
      return;
    }
    
    setIsLoading(true);
    try {
      const success = await authenticate(phone, otp);
      if (success) {
        router.replace('/auth/profile-setup');
      } else {
        Alert.alert('Error', 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <KeyboardAvoidingView 
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#4b5563" />
        </TouchableOpacity>
        
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back!</Text>
          <Text style={styles.subtitle}>
            {!otpSent 
              ? 'Enter your phone number to get started'
              : 'Enter the OTP sent to your phone'}
          </Text>
        </View>
        
        <View style={styles.form}>
          {!otpSent ? (
            <>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Phone Number</Text>
                <View style={styles.phoneInputContainer}>
                  <Text style={styles.countryCode}>+91</Text>
                  <TextInput
                    style={styles.phoneInput}
                    placeholder="Enter phone number"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="numeric"
                    maxLength={10}
                  />
                </View>
              </View>
              
              <TouchableOpacity 
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleSendOTP}
                disabled={isLoading}
              >
                <LinearGradient
                  colors={isLoading ? ['#9ca3af', '#6b7280'] : ['#3b82f6', '#1d4ed8']}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.buttonText}>
                    {isLoading ? 'Sending...' : 'Send OTP'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Enter OTP</Text>
                <TextInput
                  style={styles.otpInput}
                  placeholder="123456"
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="numeric"
                  maxLength={6}
                  textAlign="center"
                />
              </View>
              
              <TouchableOpacity 
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleVerifyOTP}
                disabled={isLoading}
              >
                <LinearGradient
                  colors={isLoading ? ['#9ca3af', '#6b7280'] : ['#3b82f6', '#1d4ed8']}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.buttonText}>
                    {isLoading ? 'Verifying...' : 'Verify OTP'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.resendButton}
                onPress={() => setOtpSent(false)}
              >
                <Text style={styles.resendText}>Didn't receive OTP? Try again</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
        
        <Text style={styles.disclaimer}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    marginTop: 40,
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 16,
  },
  countryCode: {
    fontSize: 16,
    color: '#374151',
    marginRight: 12,
    fontWeight: '500',
  },
  phoneInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#111827',
  },
  otpInput: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 4,
  },
  button: {
    marginTop: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  resendButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  resendText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
  disclaimer: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 18,
  },
});