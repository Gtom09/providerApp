import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, ShieldCheck, CheckCircle, Shield } from 'lucide-react-native';
import { SafeView } from '@/components/SafeView';
import { useAuth } from '@/context/AuthContext';

export default function OTPVerification() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const router = useRouter();
  const { phone, password, isNewUser } = useLocalSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleOtpChange = (value: string, idx: number) => {
    if (/^\d?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[idx] = value;
      setOtp(newOtp);
      if (value && idx < 5) {
        inputRefs.current[idx + 1]?.focus?.();
      }
      if (!value && idx > 0) {
        inputRefs.current[idx - 1]?.focus?.();
      }
    }
  };

  const handleVerifyOTP = async () => {
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter a valid 6-digit OTP');
      return;
    }
    setIsLoading(true);
    setTimeout(async () => {
      setIsLoading(false);
      if (isNewUser === 'true') {
        router.push({ pathname: '/auth/terms', params: { phone, password } });
      } else {
        const userData = {
          id: Date.now().toString(),
          phone: phone as string,
          aadharNumber: '',
          isAdmin: false,
          registeredServices: ['plumber', 'engineer-interior'],
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
          <View style={styles.topBar}>
            <View style={{ width: 32 }} />
            <Text style={styles.screenTitle}>Mobile Number Verification</Text>
            <View style={{ width: 32 }} />
          </View>

          <View style={styles.cardWrapper}>
            <View style={styles.card}>
              <View style={styles.iconContainer}>
                <Shield size={48} color="#3B82F6" />
              </View>
              <Text style={styles.cardTitle}>Verify Your Identity</Text>
              <Text style={styles.cardSubtitle}>
                Please enter your OTP sent to +{phone}
              </Text>
              <View style={styles.successBox}>
                <CheckCircle size={20} color="#22C55E" />
                <Text style={styles.successText}>OTP sent successfully!</Text>
              </View>
              <Text style={styles.otpLabel}>Enter 6-digit OTP</Text>
              <View style={styles.otpBoxesContainer}>
                {otp.map((digit, idx) => (
                  <TextInput
                    key={idx}
                    ref={ref => { inputRefs.current[idx] = ref; }}
                    style={styles.otpBox}
                    value={digit}
                    onChangeText={value => handleOtpChange(value, idx)}
                    keyboardType="numeric"
                    maxLength={1}
                    returnKeyType="done"
                    autoFocus={idx === 0}
                  />
                ))}
              </View>
              <TouchableOpacity onPress={handleResendOTP} disabled={timer > 0}>
                <Text style={[styles.resendText, timer > 0 && styles.resendDisabled]}>
                  {timer > 0 ? `Resend OTP in ${timer}s` : 'Resend OTP'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.primaryButton, isLoading && styles.disabledButton]} 
                onPress={handleVerifyOTP}
                disabled={isLoading}
              >
                <Text style={styles.primaryButtonText}>
                  {isLoading ? 'Verifying...' : 'Verify & Continue'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.securityNoteWrapper}>
            <View style={styles.securityNote}>
              <ShieldCheck size={16} color="#64748B" style={{ marginRight: 6 }} />
              <Text style={styles.securityText}>
                Your number is encrypted and secure
              </Text>
            </View>
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
    paddingHorizontal: 16,
    paddingTop: 0,
    paddingBottom: 16,
    justifyContent: 'center',
    minHeight: '100%',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
    gap: 8,
  },
  screenTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    flex: 1,
    textAlign: 'center',
  },
  cardWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 0,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EBF8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 22,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 18,
  },
  successText: {
    color: '#22C55E',
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  otpLabel: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginBottom: 10,
    textAlign: 'center',
  },
  otpBoxesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  otpBox: {
    width: 44,
    height: 48,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    fontSize: 22,
    fontFamily: 'Inter-Bold',
    color: '#374151',
    textAlign: 'center',
  },
  resendText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#3B82F6',
    marginBottom: 16,
    textAlign: 'center',
  },
  resendDisabled: {
    color: '#9CA3AF',
  },
  primaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 4,
    marginBottom: 0,
    width: '100%',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
  primaryButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  disabledButton: {
    opacity: 0.6,
  },
  securityNoteWrapper: {
    alignItems: 'center',
    marginTop: 8,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    justifyContent: 'center',
  },
  securityText: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
    textAlign: 'center',
  },
});