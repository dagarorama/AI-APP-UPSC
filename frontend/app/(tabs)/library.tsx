import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Card } from '../../src/components/ui/Card';
import { apiClient } from '../../src/services/apiClient';

interface Resource {
  id: string;
  title: string;
  kind: 'pdf' | 'image' | 'youtube' | 'link' | 'note';
  status: 'uploaded' | 'parsed' | 'indexed';
  created_at: string;
  content?: string;
  url?: string;
}

export default function LibraryScreen() {
  const router = useRouter();
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    loadResources();
  }, []);
  
  const loadResources = async () => {
    try {
      const response = await apiClient.get('/resources');
      setResources(response.data.resources || []);
    } catch (error) {
      console.error('Error loading resources:', error);
      // Mock data for demo
      setResources([
        {
          id: '1',
          title: 'Indian Polity Notes',
          kind: 'pdf',
          status: 'indexed',
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Geography Handwritten Notes',
          kind: 'image',
          status: 'parsed',
          created_at: new Date().toISOString()
        },
        {
          id: '3',
          title: 'Current Affairs - YouTube Lecture',
          kind: 'youtube',
          status: 'uploaded',
          created_at: new Date().toISOString(),
          url: 'https://youtube.com/watch?v=example'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddResource = () => {
    Alert.alert(
      'Add Resource',
      'Choose the type of resource to add',
      [
        { text: 'PDF Document', onPress: () => pickDocument() },
        { text: 'Image/Photo', onPress: () => pickImage() },
        { text: 'YouTube Link', onPress: () => addYouTubeLink() },
        { text: 'Web Link', onPress: () => addWebLink() },
        { text: 'Create Note', onPress: () => createNote() },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };
  
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true
      });
      
      if (!result.canceled && result.assets[0]) {
        const file = result.assets[0];
        await uploadResource({
          title: file.name || 'Untitled Document',
          kind: 'pdf',
          content: file.uri // In real app, would convert to base64
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick document');
    }
  };
  
  const pickImage = async () => {
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
        await uploadResource({
          title: 'Image - ' + new Date().toLocaleDateString(),
          kind: 'image',
          content: image.base64 ? `data:image/jpeg;base64,${image.base64}` : image.uri
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };
  
  const addYouTubeLink = () => {
    Alert.prompt(
      'YouTube Link',
      'Enter the YouTube video URL',
      [{ text: 'Cancel' }, { text: 'Add', onPress: (url) => url && uploadResource({
        title: 'YouTube Video',
        kind: 'youtube',
        url
      })}]
    );
  };
  
  const addWebLink = () => {
    Alert.prompt(
      'Web Link',
      'Enter the website URL',
      [{ text: 'Cancel' }, { text: 'Add', onPress: (url) => url && uploadResource({
        title: 'Web Resource',
        kind: 'link',
        url
      })}]
    );
  };
  
  const createNote = () => {
    Alert.prompt(
      'Create Note',
      'Enter note title',
      [{ text: 'Cancel' }, { text: 'Create', onPress: (title) => title && uploadResource({
        title,
        kind: 'note',
        content: ''
      })}]
    );
  };
  
  const uploadResource = async (resourceData: Partial<Resource>) => {
    try {
      const response = await apiClient.post('/resources', resourceData);
      setResources(prev => [response.data, ...prev]);
      Alert.alert('Success', 'Resource added successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'Failed to add resource');
    }
  };
  
  const getResourceIcon = (kind: string) => {
    switch (kind) {
      case 'pdf': return 'document-text';
      case 'image': return 'image';
      case 'youtube': return 'logo-youtube';
      case 'link': return 'link';
      case 'note': return 'create';
      default: return 'document';
    }
  };
  
  const getResourceColor = (kind: string) => {
    switch (kind) {
      case 'pdf': return '#dc2626';
      case 'image': return '#059669';
      case 'youtube': return '#dc2626';
      case 'link': return '#3b82f6';
      case 'note': return '#7c3aed';
      default: return '#6b7280';
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'uploaded': return '#f59e0b';
      case 'parsed': return '#3b82f6';
      case 'indexed': return '#10b981';
      default: return '#6b7280';
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Resource Library</Text>
        <Text style={styles.headerSubtitle}>Manage your study materials</Text>
        
        <TouchableOpacity style={styles.addButton} onPress={handleAddResource}>
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Quick Stats */}
        <Card style={styles.statsCard}>
          <View style={styles.statsContent}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{resources.length}</Text>
              <Text style={styles.statLabel}>Resources</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{resources.filter(r => r.status === 'indexed').length}</Text>
              <Text style={styles.statLabel}>Indexed</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{resources.filter(r => r.kind === 'pdf').length}</Text>
              <Text style={styles.statLabel}>Documents</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{resources.filter(r => r.kind === 'image').length}</Text>
              <Text style={styles.statLabel}>Images</Text>
            </View>
          </View>
        </Card>
        
        {/* Resources List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Resources</Text>
            <Text style={styles.sectionCount}>{resources.length} items</Text>
          </View>
          
          {isLoading ? (
            <Card style={styles.loadingCard}>
              <Text style={styles.loadingText}>Loading resources...</Text>
            </Card>
          ) : resources.length === 0 ? (
            <Card style={styles.emptyCard}>
              <View style={styles.emptyContent}>
                <Ionicons name="library-outline" size={48} color="#9ca3af" />
                <Text style={styles.emptyTitle}>No resources yet</Text>
                <Text style={styles.emptySubtitle}>Add your first study material to get started</Text>
                
                <TouchableOpacity style={styles.emptyButton} onPress={handleAddResource}>
                  <Ionicons name="add" size={20} color="white" />
                  <Text style={styles.emptyButtonText}>Add Resource</Text>
                </TouchableOpacity>
              </View>
            </Card>
          ) : (
            resources.map((resource) => (
              <Card key={resource.id} style={styles.resourceCard}>
                <View style={styles.resourceContent}>
                  <View style={[styles.resourceIcon, { backgroundColor: `${getResourceColor(resource.kind)}20` }]}>
                    <Ionicons 
                      name={getResourceIcon(resource.kind) as any} 
                      size={24} 
                      color={getResourceColor(resource.kind)} 
                    />
                  </View>
                  
                  <View style={styles.resourceInfo}>
                    <Text style={styles.resourceTitle} numberOfLines={2}>
                      {resource.title}
                    </Text>
                    <Text style={styles.resourceMeta}>
                      {resource.kind.toUpperCase()} • {new Date(resource.created_at).toLocaleDateString()}
                    </Text>
                    
                    <View style={styles.resourceStatus}>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(resource.status) }]}>
                        <Text style={styles.statusText}>{resource.status.toUpperCase()}</Text>
                      </View>
                    </View>
                  </View>
                  
                  <TouchableOpacity style={styles.resourceActions}>
                    <Ionicons name="ellipsis-vertical" size={20} color="#6b7280" />
                  </TouchableOpacity>
                </View>
                
                {/* Quick Actions */}
                <View style={styles.quickResourceActions}>
                  <TouchableOpacity style={styles.quickAction}>
                    <Ionicons name="chatbubble" size={16} color="#3b82f6" />
                    <Text style={styles.quickActionText}>Ask AI</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.quickAction}>
                    <Ionicons name="help-circle" size={16} color="#10b981" />
                    <Text style={styles.quickActionText}>5 MCQs</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.quickAction}>
                    <Ionicons name="flash" size={16} color="#f59e0b" />
                    <Text style={styles.quickActionText}>Flashcards</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.quickAction}>
                    <Ionicons name="document-text" size={16} color="#8b5cf6" />
                    <Text style={styles.quickActionText}>Summary</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            ))
          )}
        </View>
        
        {/* Resource Tips */}
        <Card style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <Ionicons name="bulb" size={20} color="#f59e0b" />
            <Text style={styles.tipsTitle}>Pro Tips</Text>
          </View>
          
          <View style={styles.tipsList}>
            <Text style={styles.tipText}>• Upload PDFs for AI-powered question answering</Text>
            <Text style={styles.tipText}>• Add images of handwritten notes for OCR processing</Text>
            <Text style={styles.tipText}>• YouTube links are automatically transcribed</Text>
            <Text style={styles.tipText}>• Generate MCQs and flashcards from any resource</Text>
          </View>
        </Card>
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
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  addButton: {
    position: 'absolute',
    right: 24,
    top: 24,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  content: {
    flex: 1,
  },
  statsCard: {
    margin: 16,
    padding: 20,
  },
  statsContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  sectionCount: {
    fontSize: 14,
    color: '#6b7280',
  },
  loadingCard: {
    padding: 32,
  },
  loadingText: {
    textAlign: 'center',
    color: '#6b7280',
  },
  emptyCard: {
    padding: 32,
  },
  emptyContent: {
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
    textAlign: 'center',
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
  },
  emptyButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  resourceCard: {
    padding: 16,
    marginBottom: 12,
  },
  resourceContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  resourceIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  resourceInfo: {
    flex: 1,
  },
  resourceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  resourceMeta: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  resourceStatus: {
    flexDirection: 'row',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
  },
  resourceActions: {
    padding: 8,
  },
  quickResourceActions: {
    flexDirection: 'row',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    gap: 12,
  },
  quickAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 6,
    gap: 4,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
  },
  tipsCard: {
    margin: 16,
    padding: 16,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  tipsList: {
    gap: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
});