import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Camera, X, Upload } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import { getServiceById } from '@/constants/serviceCategories';
import { SafeView } from '@/components/SafeView';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FormData {
  fullName: string;
  phone: string;
  state: string;
  address: string;
  experience: string;
  charges: string;
  description: string;
  photos: string[];
  engineeringCertificate?: string;
}

export default function ServiceRegistration() {
  const router = useRouter();
  const { category, mode } = useLocalSearchParams();
  const { user, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  const service = getServiceById(category as string);
  const isEditMode = mode === 'edit';
  const isEngineerOrInterior = category === 'engineer-interior';

  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    phone: user?.phone || '',
    state: '',
    address: '',
    experience: '',
    charges: '',
    description: '',
    photos: [],
    engineeringCertificate: undefined,
  });

  useEffect(() => {
    if (isEditMode) {
      loadExistingData();
    }
  }, []);

  const loadExistingData = async () => {
    try {
      const key = `service_${category}_${user?.id}`;
      const savedData = await AsyncStorage.getItem(key);
      if (savedData) {
        setFormData(JSON.parse(savedData));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddPhoto = () => {
    if (formData.photos.length >= 4) {
      Alert.alert('Limit Reached', 'You can only add up to 4 photos');
      return;
    }
    
    // Mock photo URLs for different services
    const mockPhotos = [
      'https://images.pexels.com/photos/1249611/pexels-photo-1249611.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/5691654/pexels-photo-5691654.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/6474471/pexels-photo-6474471.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/2219024/pexels-photo-2219024.jpeg?auto=compress&cs=tinysrgb&w=400',
    ];
    
    const randomPhoto = mockPhotos[Math.floor(Math.random() * mockPhotos.length)];
    setFormData(prev => ({
      ...prev,
      photos: [...prev.photos, randomPhoto]
    }));
  };

  const handleRemovePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const handleAddCertificate = () => {
    // Mock certificate URL
    const mockCertificate = 'https://images.pexels.com/photos/5668858/pexels-photo-5668858.jpeg?auto=compress&cs=tinysrgb&w=400';
    setFormData(prev => ({
      ...prev,
      engineeringCertificate: mockCertificate
    }));
  };

  const handleRemoveCertificate = () => {
    setFormData(prev => ({
      ...prev,
      engineeringCertificate: undefined
    }));
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.fullName || !formData.state || !formData.address || !formData.experience || !formData.charges) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }

    // Validate engineer/interior specific requirements
    if (isEngineerOrInterior && !formData.engineeringCertificate) {
      Alert.alert('Certificate Required', 'Engineering certificate is mandatory for engineers and interior designers');
      return;
    }

    // Validate other services photo requirements
    if (!isEngineerOrInterior && formData.photos.length === 0) {
      Alert.alert('Photos Required', 'Please upload at least one previous project photo');
      return;
    }

    setIsLoading(true);

    try {
      // Save form data
      const key = `service_${category}_${user?.id}`;
      await AsyncStorage.setItem(key, JSON.stringify(formData));

      if (!isEditMode) {
        // If it's a paid service, show payment screen
        if (service?.basePrice! > 0) {
          router.push({
            pathname: '/payment',
            params: { 
              serviceId: category,
              serviceName: service?.name,
              amount: service?.basePrice.toString()
            }
          });
        } else {
          // For free services (Labor), register directly
          await updateUser({
            registeredServices: [...(user?.registeredServices || []), category as string]
          });
          
          Alert.alert('Success', 'Registration completed successfully!', [
            { text: 'OK', onPress: () => router.push('/(tabs)') }
          ]);
        }
      } else {
        Alert.alert('Success', 'Information updated successfully!', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save information. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!service) {
    return (
      <SafeView>
        <Text>Service not found</Text>
      </SafeView>
    );
  }

  return (
    <SafeView backgroundColor="#FFFFFF">
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isEditMode ? 'Edit' : 'Register'} - {service.name}
          </Text>
        </View>

        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.fullName}
                onChangeText={(value) => handleInputChange('fullName', value)}
                placeholder="Enter your full name"
                returnKeyType="next"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number *</Text>
              <TextInput
                style={[styles.input, styles.disabledInput]}
                value={formData.phone}
                editable={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>State *</Text>
              <TextInput
                style={styles.input}
                value={formData.state}
                onChangeText={(value) => handleInputChange('state', value)}
                placeholder="Enter your state"
                returnKeyType="next"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Complete Address *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.address}
                onChangeText={(value) => handleInputChange('address', value)}
                placeholder="Enter your complete address with pincode"
                multiline
                numberOfLines={3}
                returnKeyType="next"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Years of Experience *</Text>
              <TextInput
                style={styles.input}
                value={formData.experience}
                onChangeText={(value) => handleInputChange('experience', value)}
                placeholder="e.g., 5 years"
                keyboardType="numeric"
                returnKeyType="next"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Service Charges *</Text>
              <TextInput
                style={styles.input}
                value={formData.charges}
                onChangeText={(value) => handleInputChange('charges', value)}
                placeholder="e.g., ₹500 per day or ₹15000 per project"
                returnKeyType="next"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Service Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(value) => handleInputChange('description', value)}
                placeholder="Describe your services, expertise, and what makes you unique"
                multiline
                numberOfLines={4}
                returnKeyType="done"
              />
            </View>

            {/* Engineering Certificate for Engineers/Interior Designers */}
            {isEngineerOrInterior && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Engineering Certificate *</Text>
                <Text style={styles.helperText}>
                  Upload your engineering degree or professional certification
                </Text>
                
                {formData.engineeringCertificate ? (
                  <View style={styles.certificateContainer}>
                    <Image 
                      source={{ uri: formData.engineeringCertificate }} 
                      style={styles.certificateImage} 
                    />
                    <TouchableOpacity 
                      style={styles.removeCertificateButton}
                      onPress={handleRemoveCertificate}
                    >
                      <X size={16} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity style={styles.uploadButton} onPress={handleAddCertificate}>
                    <Upload size={24} color="#3B82F6" />
                    <Text style={styles.uploadButtonText}>Upload Certificate</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Previous Project Photos for Other Services */}
            {!isEngineerOrInterior && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Previous Project Photos * (Max 4)</Text>
                <Text style={styles.helperText}>
                  Showcase your best work to attract more customers
                </Text>
                
                <View style={styles.photosContainer}>
                  {formData.photos.map((photo, index) => (
                    <View key={index} style={styles.photoContainer}>
                      <Image source={{ uri: photo }} style={styles.photo} />
                      <TouchableOpacity 
                        style={styles.removePhotoButton}
                        onPress={() => handleRemovePhoto(index)}
                      >
                        <X size={16} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  ))}
                  
                  {formData.photos.length < 4 && (
                    <TouchableOpacity style={styles.addPhotoButton} onPress={handleAddPhoto}>
                      <Camera size={24} color="#3B82F6" />
                      <Text style={styles.addPhotoText}>Add Photo</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}

            <TouchableOpacity 
              style={[styles.submitButton, isLoading && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              <Text style={styles.submitButtonText}>
                {isLoading ? 'Saving...' : isEditMode ? 'Update Information' : 'Continue to Payment'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginLeft: 16,
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    marginBottom: 8,
  },
  helperText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  input: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  disabledInput: {
    backgroundColor: '#F3F4F6',
    color: '#9CA3AF',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  photosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  photoContainer: {
    position: 'relative',
    width: 80,
    height: 80,
  },
  photo: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removePhotoButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPhotoButton: {
    width: 80,
    height: 80,
    borderWidth: 2,
    borderColor: '#3B82F6',
    borderStyle: 'dashed',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPhotoText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#3B82F6',
    marginTop: 4,
  },
  certificateContainer: {
    position: 'relative',
    alignSelf: 'flex-start',
  },
  certificateImage: {
    width: 120,
    height: 160,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  removeCertificateButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#3B82F6',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 16,
    gap: 8,
  },
  uploadButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#3B82F6',
  },
  submitButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0.1,
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});