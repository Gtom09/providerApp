import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator, // Added for loading state
} from 'react-native';
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
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

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
      Alert.alert('Error', 'Failed to load previous data.');
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined })); // Clear error when typing
    }
  };

  const handleAddPhoto = () => {
    if (formData.photos.length >= 4) {
      Alert.alert('Limit Reached', 'You can only add up to 4 photos.');
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
    setFormData((prev) => ({
      ...prev,
      photos: [...prev.photos, randomPhoto],
    }));
    setErrors((prev) => ({ ...prev, photos: undefined })); // Clear photo error if any
  };

  const handleRemovePhoto = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  };

  const handleAddCertificate = () => {
    // Mock certificate URL
    const mockCertificate = 'https://images.pexels.com/photos/5668858/pexels-photo-5668858.jpeg?auto=compress&cs=tinysrgb&w=400';
    setFormData((prev) => ({
      ...prev,
      engineeringCertificate: mockCertificate,
    }));
    setErrors((prev) => ({ ...prev, engineeringCertificate: undefined })); // Clear cert error
  };

  const handleRemoveCertificate = () => {
    setFormData((prev) => ({
      ...prev,
      engineeringCertificate: undefined,
    }));
  };

  const handleSubmit = async () => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required.';
    if (!formData.state.trim()) newErrors.state = 'State is required.';
    if (!formData.address.trim()) newErrors.address = 'Address is required.';
    if (!formData.experience.trim()) newErrors.experience = 'Years of experience is required.';
    if (!formData.charges.trim()) newErrors.charges = 'Service charges are required.';

    if (isEngineerOrInterior && !formData.engineeringCertificate) {
      newErrors.engineeringCertificate = 'Engineering certificate is mandatory.';
    }

    if (!isEngineerOrInterior && formData.photos.length === 0) {
      newErrors.photos = 'Please upload at least one previous project photo.';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      Alert.alert('Missing Information', 'Please fill in all required fields and correct errors.');
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
              amount: service?.basePrice.toString(),
            },
          });
        } else {
          // For free services (Labor), register directly
          await updateUser({
            registeredServices: [...(user?.registeredServices || []), category as string],
          });

          Alert.alert('Success', 'Registration completed successfully!', [
            { text: 'OK', onPress: () => router.push('/(tabs)') },
          ]);
        }
      } else {
        Alert.alert('Success', 'Information updated successfully!', [{ text: 'OK', onPress: () => router.back() }]);
      }
    } catch (error) {
      console.error('Submission Error:', error);
      Alert.alert('Error', 'Failed to save information. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!service) {
    return (
      <SafeView style={styles.centerContent}>
        <Text style={styles.errorText}>Service not found</Text>
      </SafeView>
    );
  }

  return (
    <SafeView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isEditMode ? 'Edit' : 'Register'} - {service.name}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name *</Text>
              <TextInput
                style={[styles.input, errors.fullName && styles.inputError]}
                value={formData.fullName}
                onChangeText={(value) => handleInputChange('fullName', value)}
                placeholder="Enter your full name"
                placeholderTextColor="#9CA3AF"
                returnKeyType="next"
                clearButtonMode="while-editing" // iOS only
              />
              {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number *</Text>
              <TextInput
                style={[styles.input, styles.disabledInput]}
                value={formData.phone}
                editable={false}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>State *</Text>
              <TextInput
                style={[styles.input, errors.state && styles.inputError]}
                value={formData.state}
                onChangeText={(value) => handleInputChange('state', value)}
                placeholder="Enter your state"
                placeholderTextColor="#9CA3AF"
                returnKeyType="next"
                clearButtonMode="while-editing"
              />
              {errors.state && <Text style={styles.errorText}>{errors.state}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Complete Address *</Text>
              <TextInput
                style={[styles.input, styles.textArea, errors.address && styles.inputError]}
                value={formData.address}
                onChangeText={(value) => handleInputChange('address', value)}
                placeholder="Enter your complete address with pincode"
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
                returnKeyType="next"
                clearButtonMode="while-editing"
              />
              {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Years of Experience *</Text>
              <TextInput
                style={[styles.input, errors.experience && styles.inputError]}
                value={formData.experience}
                onChangeText={(value) => handleInputChange('experience', value)}
                placeholder="e.g., 5 years"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                returnKeyType="next"
                clearButtonMode="while-editing"
              />
              {errors.experience && <Text style={styles.errorText}>{errors.experience}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Service Charges *</Text>
              <TextInput
                style={[styles.input, errors.charges && styles.inputError]}
                value={formData.charges}
                onChangeText={(value) => handleInputChange('charges', value)}
                placeholder="e.g., ₹500 per day or ₹15000 per project"
                placeholderTextColor="#9CA3AF"
                returnKeyType="next"
                clearButtonMode="while-editing"
              />
              {errors.charges && <Text style={styles.errorText}>{errors.charges}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Service Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(value) => handleInputChange('description', value)}
                placeholder="Describe your services, expertise, and what makes you unique"
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={4}
                returnKeyType="done"
                clearButtonMode="while-editing"
              />
            </View>

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
                      resizeMode="cover"
                    />
                    <TouchableOpacity
                      style={styles.removeCertificateButton}
                      onPress={handleRemoveCertificate}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} // Increased touch area
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
                {errors.engineeringCertificate && (
                  <Text style={styles.errorText}>{errors.engineeringCertificate}</Text>
                )}
              </View>
            )}

            {!isEngineerOrInterior && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Previous Project Photos * (Max 4)</Text>
                <Text style={styles.helperText}>Showcase your best work to attract more customers</Text>

                <View style={styles.photosContainer}>
                  {formData.photos.map((photo, index) => (
                    <View key={index} style={styles.photoWrapper}>
                      <Image source={{ uri: photo }} style={styles.photo} resizeMode="cover" />
                      <TouchableOpacity
                        style={styles.removePhotoButton}
                        onPress={() => handleRemovePhoto(index)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} // Increased touch area
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
                {errors.photos && <Text style={styles.errorText}>{errors.photos}</Text>}
              </View>
            )}

            <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.submitButtonLoading]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {isEditMode ? 'Update Information' : `Continue to Payment ${service?.basePrice! > 0 ? `(₹${service?.basePrice})` : ''}`}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Ensures a clean background behind the content
  },
  container: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Distributes space
    paddingHorizontal: 16, // Reduced padding slightly for a tighter look
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    elevation: 2, // Subtle shadow for header on Android
    shadowColor: '#000', // Subtle shadow for header on iOS
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  backButton: {
    padding: 8, // Increased touch area for back button
  },
  headerTitle: {
    fontSize: 19, // Slightly larger font for prominence
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    flex: 1, // Allows title to take available space
    textAlign: 'center', // Center the title
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 30, // Extra padding at the bottom of the scroll view
  },
  form: {
    padding: 24,
  },
  inputGroup: {
    marginBottom: 20, // Reduced margin slightly for tighter grouping
  },
  label: {
    fontSize: 15, // Slightly smaller label font
    fontFamily: 'Inter-Medium',
    color: '#374151',
    marginBottom: 6, // Reduced margin
  },
  helperText: {
    fontSize: 13, // Slightly smaller helper text
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 10, // Reduced margin
    lineHeight: 18,
  },
  input: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1F2937', // Darker text for readability
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10, // Slightly less rounded corners
    backgroundColor: '#FFFFFF', // White background for inputs
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000', // Subtle shadow for inputs
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  inputError: {
    borderColor: '#EF4444', // Red border for error state
    borderWidth: 1.5, // Slightly thicker border for error
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#EF4444', // Red color for error messages
    marginTop: 4,
  },
  disabledInput: {
    backgroundColor: '#F3F4F6',
    color: '#9CA3AF',
  },
  textArea: {
    minHeight: 100, // Slightly taller text area
    textAlignVertical: 'top',
    paddingTop: 12, // Ensure text starts from top
  },
  photosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10, // Reduced gap slightly
  },
  photoWrapper: {
    position: 'relative',
    width: 85, // Slightly larger photo size
    height: 85,
    borderRadius: 10,
    overflow: 'hidden', // Ensures image respects border radius
    borderWidth: 1,
    borderColor: '#E5E7EB', // Border for consistency
  },
  photo: {
    width: '100%',
    height: '100%',
    borderRadius: 10, // Match wrapper border radius
  },
  removePhotoButton: {
    position: 'absolute',
    top: -6, // Adjusted position
    right: -6, // Adjusted position
    backgroundColor: '#EF4444',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1, // Ensure button is above image
  },
  addPhotoButton: {
    width: 85,
    height: 85,
    borderWidth: 2,
    borderColor: '#3B82F6',
    borderStyle: 'dashed',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F9FF', // Light blue background for add photo
  },
  addPhotoText: {
    fontSize: 11, // Slightly smaller text
    fontFamily: 'Inter-Medium',
    color: '#3B82F6',
    marginTop: 4,
  },
  certificateContainer: {
    position: 'relative',
    alignSelf: 'flex-start',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  certificateImage: {
    width: 120,
    height: 160,
    borderRadius: 10,
  },
  removeCertificateButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#3B82F6',
    borderStyle: 'dashed',
    borderRadius: 10, // Slightly less rounded
    paddingVertical: 18, // Slightly more vertical padding
    paddingHorizontal: 16,
    gap: 10, // Increased gap between icon and text
    backgroundColor: '#F0F9FF', // Light blue background
  },
  uploadButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold', // Stronger font for primary action
    color: '#3B82F6',
  },
  submitButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 15, // Slightly less vertical padding
    borderRadius: 10, // Less rounded
    alignItems: 'center',
    justifyContent: 'center', // Center content
    marginTop: 25, // Increased margin
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 }, // More pronounced shadow
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6, // Higher elevation
  },
  submitButtonLoading: {
    opacity: 0.7, // Only opacity change for loading
  },
  submitButtonText: {
    fontSize: 17, // Slightly larger font for CTA
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});