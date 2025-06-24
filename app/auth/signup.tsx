import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView, Linking } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, UserPlus, Eye, EyeOff, ArrowRight, User, Mail, Phone, Lock } from 'lucide-react-native';
import { SafeView } from '@/components/SafeView';

export default function SignUpScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const params = useLocalSearchParams();

  React.useEffect(() => {
    if (params.phone) {
      setPhone(params.phone as string);
    }
  }, [params.phone]);

  const handleCreateAccount = async () => {
    if (!fullName.trim()) {
      Alert.alert('Missing Name', 'Please enter your full name.');
      return;
    }
    if (!email.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }
    if (phone.length !== 10) {
      Alert.alert('Invalid Number', 'Please enter a valid 10-digit mobile number');
      return;
    }
    if (!password || password.length < 6) {
      Alert.alert('Invalid Password', 'Password must be at least 6 characters long');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match. Please try again.');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      router.push({
        pathname: '/auth/otp',
        params: { phone, password, isNewUser: 'true' }
      });
    }, 1000);
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
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              Join our construction marketplace
            </Text>
          </View>

          <View style={styles.form}>
            {/* Full Name */}
            <View style={styles.inputContainer}>
              <User size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Full Name"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="words"
                returnKeyType="next"
              />
            </View>
            {/* Email */}
            <View style={styles.inputContainer}>
              <Mail size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Email address"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
              />
            </View>
            {/* Phone */}
            <View style={styles.inputContainer}>
              <Phone size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="Phone Number"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                maxLength={10}
                returnKeyType="next"
              />
            </View>
            {/* Password */}
            <View style={styles.inputContainer}>
              <Lock size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showPassword}
                returnKeyType="next"
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
            {/* Confirm Password */}
            <View style={styles.inputContainer}>
              <Lock size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm Password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showConfirmPassword}
                returnKeyType="done"
                onSubmitEditing={handleCreateAccount}
              />
              <TouchableOpacity 
                style={styles.eyeButton}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} color="#6B7280" />
                ) : (
                  <Eye size={20} color="#6B7280" />
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={[styles.primaryButton, isLoading && styles.disabledButton]} 
              onPress={handleCreateAccount}
              disabled={isLoading}
            >
              <Text style={styles.primaryButtonText}>
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Text>
            </TouchableOpacity>

            <Text style={styles.termsText}>
              By creating an account, you agree to our{' '}
              <Text style={styles.link} onPress={() => Linking.openURL('https://example.com/terms')}>Terms of Service</Text> and{' '}
              <Text style={styles.link} onPress={() => Linking.openURL('https://example.com/privacy')}>Privacy Policy</Text>
            </Text>
          </View>

          <View style={styles.orDividerContainer}>
            <View style={styles.orDivider} />
            <Text style={styles.orText}>or</Text>
            <View style={styles.orDivider} />
          </View>

          <View style={styles.loginContainerBottom}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity 
              onPress={() => router.back()}
              style={styles.loginButton}
              activeOpacity={0.7}
            >
              <Text style={styles.loginLink}>Sign In</Text>
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 40,
    justifyContent: 'flex-start',
    minHeight: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 0,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 8,
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
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    paddingVertical: 16,
  },
  eyeButton: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  primaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
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
  termsText: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 8,
    marginTop: 4,
  },
  link: {
    color: '#3B82F6',
    textDecorationLine: 'underline',
  },
  orDividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
    justifyContent: 'center',
  },
  orDivider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 8,
  },
  orText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
  },
  loginContainerBottom: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  loginText: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  loginButton: {
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  loginLink: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    color: '#3B82F6',
    textDecorationLine: 'underline',
  },
});