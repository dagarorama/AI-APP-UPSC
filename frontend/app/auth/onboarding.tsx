import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Card } from '../../src/components/ui/Card';

export default function OnboardingScreen() {
  const router = useRouter();
  
  const handleGetStarted = () => {
    router.push('/auth/login');
  };
  
  const features = [
    {
      icon: 'brain',
      title: 'AI-Powered Learning',
      description: 'Get personalized study recommendations and instant doubt resolution'
    },
    {
      icon: 'calendar',
      title: 'Smart Study Planner',
      description: 'Adaptive scheduling that adjusts to your progress and exam timeline'
    },
    {
      icon: 'library',
      title: 'Resource Management',
      description: 'Upload PDFs, images, and notes with AI-powered search and insights'
    },
    {
      icon: 'analytics',
      title: 'Progress Analytics',
      description: 'Track your performance with detailed analytics and weak area identification'
    }
  ];
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <LinearGradient
        colors={['#3b82f6', '#1d4ed8']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.title}>UPSC AI Companion</Text>
          <Text style={styles.subtitle}>
            Your intelligent study partner for UPSC success
          </Text>
          
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <Ionicons name="school" size={48} color="white" />
            </View>
          </View>
        </View>
      </LinearGradient>
      
      <View style={styles.content}>
        <Text style={styles.featuresTitle}>Everything you need to ace UPSC</Text>
        
        <View style={styles.features}>
          {features.map((feature, index) => (
            <Card key={index} style={styles.featureCard}>
              <View style={styles.featureIcon}>
                <Ionicons name={feature.icon as any} size={24} color="#3b82f6" />
              </View>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDescription}>{feature.description}</Text>
            </Card>
          ))}
        </View>
        
        <TouchableOpacity style={styles.getStartedButton} onPress={handleGetStarted}>
          <LinearGradient
            colors={['#3b82f6', '#1d4ed8']}
            style={styles.buttonGradient}
          >
            <Text style={styles.buttonText}>Get Started</Text>
            <Ionicons name="arrow-forward" size={20} color="white" />
          </LinearGradient>
        </TouchableOpacity>
        
        <Text style={styles.disclaimer}>
          Join thousands of UPSC aspirants who trust our AI-powered platform
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  headerContent: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#bfdbfe',
    textAlign: 'center',
    marginBottom: 24,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 24,
  },
  features: {
    flex: 1,
    gap: 16,
  },
  featureCard: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#eff6ff',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
    flex: 1,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
  },
  getStartedButton: {
    marginTop: 24,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  disclaimer: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
});