import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MessageSquare, ArrowLeft } from 'lucide-react-native';

export default function OTPVerification() {
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(30);
  const router = useRouter();
  const { phone, isLogin, fullName, email } = useLocalSearchParams();

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleVerifyOTP = () => {
    if (otp.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP');
      return;
    }

    // Mock OTP verification (in real app, verify with backend)
    if (otp === '123456') {
      router.push({
        pathname: '/auth/aadhar',
        params: { phone, isLogin, fullName, email }
      });
    } else {
      Alert.alert('Error', 'Invalid OTP. Please try again.');
    }
  };

  const handleResendOTP = () => {
    if (timer === 0) {
      setTimer(30);
      Alert.alert('Success', 'OTP sent successfully');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>

        <View style={styles.header}>
          <MessageSquare size={48} color="#3B82F6" />
          <Text style={styles.title}>OTP Verification</Text>
          <Text style={styles.subtitle}>
            Enter the 6-digit code sent to{'\n'}+91 {phone}
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>OTP Code</Text>
          <TextInput
            style={styles.otpInput}
            value={otp}
            onChangeText={setOtp}
            placeholder="Enter 6-digit OTP"
            keyboardType="numeric"
            maxLength={6}
            textAlign="center"
          />

          <TouchableOpacity style={styles.primaryButton} onPress={handleVerifyOTP}>
            <Text style={styles.primaryButtonText}>Verify OTP</Text>
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

        <View style={styles.hint}>
          <Text style={styles.hintText}>Use OTP: 123456 for demo</Text>
        </View>
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
    textAlign: 'center',
  },
  otpInput: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#374151',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    paddingVertical: 20,
    marginBottom: 24,
    letterSpacing: 8,
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
    marginBottom: 24,
  },
  primaryButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
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
    fontFamily: 'Inter-Medium',
    color: '#3B82F6',
  },
  resendDisabled: {
    color: '#9CA3AF',
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