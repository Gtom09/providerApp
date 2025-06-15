import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { 
  User, 
  Phone, 
  CreditCard, 
  MapPin, 
  LogOut, 
  CircleHelp as HelpCircle,
  Settings,
  Bell,
  Shield,
  Globe,
  FileText,
  Star
} from 'lucide-react-native';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/auth');
          }
        }
      ]
    );
  };

  const handleSettingsAction = (action: string) => {
    switch (action) {
      case 'notifications':
        Alert.alert('Notifications', 'Notification settings will be available in the next update.');
        break;
      case 'privacy':
        Alert.alert('Privacy & Security', 'Privacy settings help you control your data and account security.');
        break;
      case 'language':
        Alert.alert('Language', 'Currently supporting English. More languages coming soon!');
        break;
      case 'help':
        Alert.alert('Help & Support', 'For support, please contact us at support@serviceapp.com or call +91-1234567890');
        break;
      case 'terms':
        Alert.alert('Terms & Conditions', 'By using this app, you agree to our terms of service and privacy policy.');
        break;
      case 'privacy-policy':
        Alert.alert('Privacy Policy', 'We respect your privacy and protect your personal information according to our privacy policy.');
        break;
      case 'rate':
        Alert.alert('Rate App', 'Thank you for using our app! Please rate us on the app store.');
        break;
      case 'edit-profile':
        Alert.alert('Edit Profile', 'Profile editing feature will be available in the next update.');
        break;
      default:
        break;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <View style={styles.profileIcon}>
            <User size={48} color="#3B82F6" />
          </View>
          <Text style={styles.welcomeText}>Service Provider Profile</Text>
        </View>

        <View style={styles.profileInfo}>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Phone size={20} color="#6B7280" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Phone Number</Text>
                <Text style={styles.infoValue}>{user?.phone}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <CreditCard size={20} color="#6B7280" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Aadhar Number</Text>
                <Text style={styles.infoValue}>
                  XXXX XXXX {user?.aadharNumber?.slice(-4)}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <MapPin size={20} color="#6B7280" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Registered Services</Text>
                <Text style={styles.infoValue}>
                  {user?.registeredServices?.length || 0} Services
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleSettingsAction('edit-profile')}
          >
            <User size={20} color="#6B7280" />
            <Text style={styles.actionButtonText}>Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleSettingsAction('notifications')}
          >
            <Bell size={20} color="#6B7280" />
            <Text style={styles.actionButtonText}>Notifications</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleSettingsAction('privacy')}
          >
            <Shield size={20} color="#6B7280" />
            <Text style={styles.actionButtonText}>Privacy & Security</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleSettingsAction('language')}
          >
            <Globe size={20} color="#6B7280" />
            <Text style={styles.actionButtonText}>Language</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleSettingsAction('help')}
          >
            <HelpCircle size={20} color="#6B7280" />
            <Text style={styles.actionButtonText}>Help & Support</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleSettingsAction('rate')}
          >
            <Star size={20} color="#6B7280" />
            <Text style={styles.actionButtonText}>Rate App</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleSettingsAction('terms')}
          >
            <FileText size={20} color="#6B7280" />
            <Text style={styles.actionButtonText}>Terms & Conditions</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleSettingsAction('privacy-policy')}
          >
            <Shield size={20} color="#6B7280" />
            <Text style={styles.actionButtonText}>Privacy Policy</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color="#EF4444" />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>

        <View style={styles.appInfo}>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
          <Text style={styles.copyright}>© 2024 Service Provider App</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#F0F9FF',
  },
  profileIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  welcomeText: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  profileInfo: {
    padding: 24,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoContent: {
    marginLeft: 16,
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#1F2937',
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  actionButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    marginLeft: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    marginHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  logoutButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#EF4444',
    marginLeft: 8,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 24,
  },
  appVersion: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#9CA3AF',
    marginBottom: 8,
  },
  copyright: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
});