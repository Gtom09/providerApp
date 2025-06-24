import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, TriangleAlert as AlertTriangle, Upload, Camera, FileText } from 'lucide-react-native';
import { SafeView } from '@/components/SafeView';
import { useAuth } from '@/context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ReportData {
  customerName: string;
  incidentDate: string;
  incidentTime: string;
  incidentType: string;
  description: string;
  evidence: string[];
}

const INCIDENT_TYPES = [
  'Inappropriate Behavior',
  'Policy Violation',
  'Payment Issues',
  'Harassment',
  'Spam/Unwanted Contact',
  'Safety Concerns',
  'Fraudulent Activity',
  'Other'
];

export default function ReportCustomerScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState<ReportData>({
    customerName: '',
    incidentDate: '',
    incidentTime: '',
    incidentType: '',
    description: '',
    evidence: [],
  });

  const handleInputChange = (field: keyof ReportData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddEvidence = () => {
    if (formData.evidence.length >= 3) {
      Alert.alert('Limit Reached', 'You can only add up to 3 pieces of evidence');
      return;
    }
    
    // Mock evidence URLs for demonstration
    const mockEvidence = [
      'https://images.pexels.com/photos/5668858/pexels-photo-5668858.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/6474471/pexels-photo-6474471.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/5691654/pexels-photo-5691654.jpeg?auto=compress&cs=tinysrgb&w=400',
    ];
    
    const randomEvidence = mockEvidence[Math.floor(Math.random() * mockEvidence.length)];
    setFormData(prev => ({
      ...prev,
      evidence: [...prev.evidence, randomEvidence]
    }));
  };

  const handleRemoveEvidence = (index: number) => {
    setFormData(prev => ({
      ...prev,
      evidence: prev.evidence.filter((_, i) => i !== index)
    }));
  };

  const handleSubmitReport = async () => {
    // Validate required fields
    if (!formData.customerName || !formData.incidentDate || !formData.incidentType || !formData.description) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }

    setIsLoading(true);

    try {
      // Create report object
      const report = {
        id: `report_${Date.now()}`,
        reporterId: user?.id,
        reporterPhone: user?.phone,
        customerName: formData.customerName,
        incidentDate: formData.incidentDate,
        incidentTime: formData.incidentTime || 'Not specified',
        incidentType: formData.incidentType,
        description: formData.description,
        evidence: formData.evidence,
        status: 'open',
        submittedAt: new Date().toISOString(),
      };

      // Save to AsyncStorage (in real app, this would be sent to backend)
      const existingReports = await AsyncStorage.getItem('customer_reports');
      const reports = existingReports ? JSON.parse(existingReports) : [];
      reports.push(report);
      await AsyncStorage.setItem('customer_reports', JSON.stringify(reports));

      Alert.alert(
        'Report Submitted',
        'Your customer report has been submitted successfully. Our team will review it and take appropriate action.',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to submit report. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeView backgroundColor="#FFFFFF">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Report Customer</Text>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <AlertTriangle size={48} color="#DC2626" />
            </View>
            
            <Text style={styles.title}>Report a Customer Issue</Text>
            <Text style={styles.subtitle}>
              Help us maintain a safe and professional environment by reporting any issues with customers
            </Text>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Customer Name/ID *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.customerName}
                  onChangeText={(value) => handleInputChange('customerName', value)}
                  placeholder="Enter customer name or ID"
                  returnKeyType="next"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Incident Date *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.incidentDate}
                  onChangeText={(value) => handleInputChange('incidentDate', value)}
                  placeholder="DD/MM/YYYY"
                  returnKeyType="next"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Incident Time</Text>
                <TextInput
                  style={styles.input}
                  value={formData.incidentTime}
                  onChangeText={(value) => handleInputChange('incidentTime', value)}
                  placeholder="HH:MM AM/PM (optional)"
                  returnKeyType="next"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Type of Incident *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.incidentTypesContainer}>
                  {INCIDENT_TYPES.map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.incidentTypeButton,
                        formData.incidentType === type && styles.selectedIncidentType
                      ]}
                      onPress={() => handleInputChange('incidentType', type)}
                    >
                      <Text style={[
                        styles.incidentTypeText,
                        formData.incidentType === type && styles.selectedIncidentTypeText
                      ]}>
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Detailed Description *</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.description}
                  onChangeText={(value) => handleInputChange('description', value)}
                  placeholder="Please provide a detailed description of the incident, including what happened, when it occurred, and any relevant context..."
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                  returnKeyType="done"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Supporting Evidence (Optional)</Text>
                <Text style={styles.helperText}>
                  Upload screenshots, photos, or documents that support your report (Max 3 files)
                </Text>
                
                <View style={styles.evidenceContainer}>
                  {formData.evidence.map((evidence, index) => (
                    <View key={index} style={styles.evidenceItem}>
                      <FileText size={20} color="#3B82F6" />
                      <Text style={styles.evidenceText}>Evidence {index + 1}</Text>
                      <TouchableOpacity 
                        style={styles.removeEvidenceButton}
                        onPress={() => handleRemoveEvidence(index)}
                      >
                        <Text style={styles.removeEvidenceText}>×</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                  
                  {formData.evidence.length < 3 && (
                    <TouchableOpacity style={styles.addEvidenceButton} onPress={handleAddEvidence}>
                      <Upload size={20} color="#3B82F6" />
                      <Text style={styles.addEvidenceText}>Add Evidence</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              <View style={styles.warningBox}>
                <AlertTriangle size={20} color="#F59E0B" />
                <Text style={styles.warningText}>
                  Please ensure all information provided is accurate. False reports may result in account suspension.
                </Text>
              </View>

              <TouchableOpacity 
                style={[styles.submitButton, isLoading && styles.disabledButton]}
                onPress={handleSubmitReport}
                disabled={isLoading}
              >
                <AlertTriangle size={20} color="#FFFFFF" />
                <Text style={styles.submitButtonText}>
                  {isLoading ? 'Submitting Report...' : 'Submit Report'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
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
  content: {
    padding: 24,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  form: {
    marginBottom: 32,
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
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  incidentTypesContainer: {
    flexDirection: 'row',
  },
  incidentTypeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedIncidentType: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  incidentTypeText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  selectedIncidentTypeText: {
    color: '#FFFFFF',
  },
  evidenceContainer: {
    gap: 12,
  },
  evidenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  evidenceText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#1E40AF',
    marginLeft: 8,
    flex: 1,
  },
  removeEvidenceButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeEvidenceText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  addEvidenceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#3B82F6',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 8,
  },
  addEvidenceText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#3B82F6',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFBEB',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 24,
  },
  warningText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#92400E',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DC2626',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    gap: 8,
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