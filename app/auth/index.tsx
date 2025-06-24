import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Phone, Users, ArrowRight, Shield, Eye, EyeOff } from 'lucide-react-native';
import { SafeView } from '@/components/SafeView';
import { useAuth } from '@/context/AuthContext';

export default function AuthScreen() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showAdminCredentials, setShowAdminCredentials] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async () => {
    if (phone.length !== 10) {
      Alert.alert('Invalid Number', 'Please enter a valid 10-digit mobile number');
      return;
    }

    if (!password) {
      Alert.alert('Missing Password', 'Please enter your password');
      return;
    }

    setIsLoading(true);

    // Check if admin credentials
    if (phone === '1234567890' && password === 'admin123') {
      setShowAdminCredentials(true);
      
      // Auto-redirect to admin dashboard after showing credentials
      setTimeout(async () => {
        const adminUser = {
          id: 'admin',
          phone: '',
          aadharNumber: '',
          isAdmin: true,
          registeredServices: [],
        };

        await login(adminUser);
        router.replace('/admin/dashboard');
      }, 2000);
      
      setIsLoading(false);
      return;
    }

    // Simulate regular user login
    setTimeout(async () => {
      setIsLoading(false);
      
      // Mock user data - in real app, this would come from backend
      const userData = {
        id: Date.now().toString(),
        phone: phone,
        aadharNumber: '',
        isAdmin: false,
        registeredServices: ['plumber', 'engineer-interior'], // Simulate existing services
      };
      
      await login(userData);
      router.replace('/(tabs)');
    }, 1500);
  };

  const handleSignUp = () => {
    console.log('Sign up button pressed'); // Debug log
    router.push('/auth/signup');
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
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Users size={56} color="#3B82F6" />
            </View>
            <Text style={styles.title}>Service Provider</Text>
            <Text style={styles.subtitle}>
              Welcome back! Sign in to your account
            </Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Mobile Number</Text>
            <View style={styles.phoneContainer}>
              <View style={styles.countryCodeContainer}>
                <Text style={styles.countryCode}>🇮🇳 +91</Text>
              </View>
              <TextInput
                style={styles.phoneInput}
                value={phone}
                onChangeText={setPhone}
                placeholder="Enter 10-digit mobile number"
                keyboardType="numeric"
                maxLength={10}
                autoFocus={false}
                returnKeyType="next"
              />
            </View>

            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                secureTextEntry={!showPassword}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity 
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff size={20} color="#6B7280" />
                ) : (
                  <Eye size={20} color="#6B7280" />
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={[styles.primaryButton, isLoading && styles.disabledButton]} 
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Phone size={20} color="#FFFFFF" />
              <Text style={styles.primaryButtonText}>
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Text>
              <ArrowRight size={20} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Admin Credentials Display */}
            {showAdminCredentials && (
              <View style={styles.adminCredentialsDisplay}>
                <Shield size={24} color="#DC2626" />
                <Text style={styles.adminCredentialsTitle}>Admin Credentials Detected</Text>
                <Text style={styles.adminCredentialsText}>Phone: {phone}</Text>
                <Text style={styles.adminCredentialsText}>Password: {password}</Text>
                <Text style={styles.adminCredentialsNote}>
                  Redirecting to Admin Dashboard...
                </Text>
              </View>
            )}

            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <TouchableOpacity 
                onPress={handleSignUp}
                style={styles.signupButton}
                activeOpacity={0.7}
              >
                <Text style={styles.signupLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.adminHint}>
            <Text style={styles.adminHintTitle}>Admin Access:</Text>
            <Text style={styles.adminHintText}>Phone: 1234567890</Text>
            <Text style={styles.adminHintText}>Password: admin123</Text>
          </View>

          <View style={styles.features}>
            <View style={styles.feature}>
              <View style={styles.featureIcon}>
                <Text style={styles.featureEmoji}>🔒</Text>
              </View>
              <Text style={styles.featureText}>Secure Login</Text>
            </View>
            <View style={styles.feature}>
              <View style={styles.featureIcon}>
                <Text style={styles.featureEmoji}>✅</Text>
              </View>
              <Text style={styles.featureText}>Verified Platform</Text>
            </View>
            <View style={styles.feature}>
              <View style={styles.featureIcon}>
                <Text style={styles.featureEmoji}>💰</Text>
              </View>
              <Text style={styles.featureText}>Earn More</Text>
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
    paddingHorizontal: 24,
    paddingVertical: 20,
    justifyContent: 'center',
    minHeight: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
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
    fontSize: 36,
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
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  form: {
    marginBottom: 32,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginBottom: 12,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  countryCodeContainer: {
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  countryCode: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  eyeButton: {
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 18,
    borderRadius: 16,
    marginBottom: 20,
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
  adminCredentialsDisplay: {
    backgroundColor: '#FEF2F2',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FECACA',
    alignItems: 'center',
  },
  adminCredentialsTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#DC2626',
    marginTop: 8,
    marginBottom: 12,
  },
  adminCredentialsText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#DC2626',
    marginBottom: 4,
  },
  adminCredentialsNote: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#DC2626',
    fontStyle: 'italic',
    marginTop: 8,
    textAlign: 'center',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  signupText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  signupButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  signupLink: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#3B82F6',
    textDecorationLine: 'underline',
  },
  adminHint: {
    backgroundColor: '#F0F9FF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    alignItems: 'center',
  },
  adminHintTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1E40AF',
    marginBottom: 8,
  },
  adminHintText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#1E40AF',
    marginBottom: 4,
  },
  features: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
  },
  feature: {
    alignItems: 'center',
    flex: 1,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureEmoji: {
    fontSize: 20,
  },
  featureText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    textAlign: 'center',
  },
});