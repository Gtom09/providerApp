import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CreditCard, ArrowLeft } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';

export default function AadharVerification() {
  const [aadharNumber, setAadharNumber] = useState('');
  const [aadharOtp, setAadharOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const router = useRouter();
  const { phone, isLogin, fullName, email } = useLocalSearchParams();
  const { login } = useAuth();

  const handleSendAadharOTP = () => {
    if (aadharNumber.length !== 12) {
      Alert.alert('Error', 'Please enter a valid 12-digit Aadhar number');
      return;
    }

    setShowOtpInput(true);
    Alert.alert('OTP Sent', 'OTP has been sent to your registered mobile number with Aadhar');
  };

  const handleVerifyAadhar = async () => {
    if (aadharOtp.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP');
      return;
    }

    setIsVerifying(true);

    // Mock Aadhar verification (in real app, verify with backend)
    setTimeout(async () => {
      setIsVerifying(false);
      
      // Create user and login
      const userData = {
        id: Date.now().toString(),
        phone: phone as string,
        aadharNumber,
        isAdmin: false,
        registeredServices: [],
        fullName: fullName as string || '',
        email: email as string || '',
      };

      await login(userData);
      router.replace('/(tabs)');
    }, 2000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>

        <View style={styles.header}>
          <CreditCard size={48} color="#3B82F6" />
          <Text style={styles.title}>Aadhar Verification</Text>
          <Text style={styles.subtitle}>
            Enter your 12-digit Aadhar number for verification
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Aadhar Number</Text>
          <TextInput
            style={styles.aadharInput}
            value={aadharNumber}
            onChangeText={setAadharNumber}
            placeholder="Enter 12-digit Aadhar number"
            keyboardType="numeric"
            maxLength={12}
            editable={!showOtpInput}
          />

          {!showOtpInput ? (
            <TouchableOpacity 
              style={styles.primaryButton} 
              onPress={handleSendAadharOTP}
            >
              <Text style={styles.primaryButtonText}>Send OTP</Text>
            </TouchableOpacity>
          ) : (
            <>
              <Text style={styles.label}>Aadhar OTP</Text>
              <TextInput
                style={styles.otpInput}
                value={aadharOtp}
                onChangeText={setAadharOtp}
                placeholder="Enter 6-digit OTP"
                keyboardType="numeric"
                maxLength={6}
                textAlign="center"
              />

              <TouchableOpacity 
                style={[styles.primaryButton, isVerifying && styles.disabledButton]} 
                onPress={handleVerifyAadhar}
                disabled={isVerifying}
              >
                <Text style={styles.primaryButtonText}>
                  {isVerifying ? 'Verifying...' : 'Verify Aadhar'}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <View style={styles.securityNote}>
          <Text style={styles.securityText}>
            🔒 Your Aadhar information is encrypted and securely stored
          </Text>
        </View>

        {showOtpInput && (
          <View style={styles.hint}>
            <Text style={styles.hintText}>Use OTP: 123456 for demo</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  backButton: {
    marginBottom: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    marginBottom: 32,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    marginBottom: 8,
  },
  aadharInput: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 24,
  },
  otpInput: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#374151',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    paddingVertical: 16,
    marginBottom: 24,
    letterSpacing: 4,
  },
  primaryButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  primaryButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  securityNote: {
    backgroundColor: '#F0FDF4',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  securityText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#166534',
    textAlign: 'center',
  },
  hint: {
    backgroundColor: '#F0F9FF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  hintText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#1E40AF',
  },
});