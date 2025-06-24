import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MessageSquare, ArrowLeft, Smartphone, CircleCheck as CheckCircle } from 'lucide-react-native';
import { SafeView } from '@/components/SafeView';
import { useAuth } from '@/context/AuthContext';

export default function OTPVerification() {
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(30);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { phone, password, isNewUser } = useLocalSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);

    // Simulate OTP verification
    setTimeout(async () => {
      setIsLoading(false);
      
      if (isNewUser === 'true') {
        // New user - show terms and conditions
        router.push({
          pathname: '/auth/terms',
          params: { phone, password }
        });
      } else {
        // Existing user - direct login
        const userData = {
          id: Date.now().toString(),
          phone: phone as string,
          aadharNumber: '',
          isAdmin: false,
          registeredServices: ['plumber', 'engineer-interior'], // Simulate existing services
        };
        
        await login(userData);
        router.replace('/(tabs)');
      }
    }, 1500);
  };

  const handleResendOTP = () => {
    if (timer === 0) {
      setTimer(30);
      Alert.alert('OTP Sent', 'A new verification code has been sent to your mobile number');
    }
  };

  return (
    <SafeView backgroundColor="#F8FAFC">
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#374151" />
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Smartphone size={48} color="#3B82F6" />
            </View>
            <Text style={styles.title}>Verify Mobile Number</Text>
            <Text style={styles.subtitle}>
              Enter the 6-digit verification code sent to
            </Text>
            <Text style={styles.phoneNumber}>+91 {phone}</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Verification Code</Text>
            <TextInput
              style={styles.otpInput}
              value={otp}
              onChangeText={setOtp}
              placeholder="000000"
              keyboardType="numeric"
              maxLength={6}
              textAlign="center"
              autoFocus={false}
              returnKeyType="done"
            />

            <TouchableOpacity 
              style={[styles.primaryButton, isLoading && styles.disabledButton]} 
              onPress={handleVerifyOTP}
              disabled={isLoading}
            >
              <CheckCircle size={20} color="#FFFFFF" />
              <Text style={styles.primaryButtonText}>
                {isLoading ? 'Verifying...' : 'Verify OTP'}
              </Text>
            </TouchableOpacity>

            <View style={styles.resendContainer}>
              <Text style={styles.resendText}>Didn't receive the code? </Text>
              <TouchableOpacity onPress={handleResendOTP} disabled={timer > 0}>
                <Text style={[styles.resendButton, timer > 0 && styles.resendDisabled]}>
                  {timer > 0 ? `Resend in ${timer}s` : 'Resend OTP'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.securityNote}>
            <Text style={styles.securityText}>
              🔒 Your phone number is secure and will only be used for verification
            </Text>
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
    justifyContent: 'center',
    minHeight: '100%',
  },
  backButton: {
    marginBottom: 32,
    padding: 8,
    alignSelf: 'flex-start',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EBF8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  phoneNumber: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#3B82F6',
  },
  form: {
    marginBottom: 32,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginBottom: 12,
    textAlign: 'center',
  },
  otpInput: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#374151',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
    marginBottom: 32,
    letterSpacing: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 18,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  disabledButton: {
    opacity: 0.6,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  resendButton: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#3B82F6',
  },
  resendDisabled: {
    color: '#9CA3AF',
  },
  securityNote: {
    backgroundColor: '#F0FDF4',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  securityText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#166534',
    textAlign: 'center',
  },
});