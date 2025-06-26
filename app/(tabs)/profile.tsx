import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { User, Phone, MapPin, LogOut, CreditCard as Edit, Bell, Shield, Globe, Palette, Volume2, CircleHelp as HelpCircle, FileText, Star, Settings, Award, TrendingUp, Calendar, CreditCard, TriangleAlert as AlertTriangle, Trash2 } from 'lucide-react-native';
import { SafeView } from '@/components/SafeView';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout from your account?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              router.replace('/auth');
            } catch (error) {
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              Alert.alert('Account Deleted', 'Your account has been deleted.');
              router.replace('/auth');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete account. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleReportCustomer = () => {
    router.push('/report-customer');
  };

  const handleSettingsAction = (action: string) => {
    const settingsInfo = {
      'edit-profile': {
        title: 'Edit Profile',
        message: 'Update your personal information, contact details, and professional credentials.\n\n• Change your name and contact info\n• Update your address and location\n• Modify service descriptions\n• Upload new profile photos'
      },
      'notifications': {
        title: 'Notification Settings',
        message: 'Customize your notification preferences:\n\n• New booking requests - Get instant alerts\n• Payment confirmations - Transaction updates\n• Service updates - Platform announcements\n• Promotional offers - Special deals and discounts\n• Customer messages - Direct communication alerts'
      },
      'privacy': {
        title: 'Privacy & Security',
        message: 'Manage your privacy and security settings:\n\n• Two-factor authentication - Extra security layer\n• Data sharing preferences - Control your information\n• Account visibility - Manage profile visibility\n• Security alerts - Suspicious activity notifications\n• Login history - Track account access'
      },
      'language': {
        title: 'Language Settings',
        message: 'Choose your preferred language:\n\n• English (Current) - Default language\n• हिंदी (Hindi) - Hindi language support\n• বাংলা (Bengali) - Bengali language support\n• தமிழ் (Tamil) - Tamil language support\n• తెలుగు (Telugu) - Telugu language support\n• ગુજરાતી (Gujarati) - Coming soon\n• मराठी (Marathi) - Coming soon'
      },
      'theme': {
        title: 'Theme & Appearance',
        message: 'Customize your app appearance:\n\n• Light Mode (Current) - Clean, bright interface\n• Dark Mode - Easy on the eyes\n• Auto Theme - Follows system settings\n• Accent Colors - Personalize your experience\n• Font Size - Adjust text readability'
      },
      'sound': {
        title: 'Sound & Vibration',
        message: 'Configure audio and haptic feedback:\n\n• Notification sounds - Custom alert tones\n• In-app sounds - Button clicks and interactions\n• Vibration patterns - Haptic feedback settings\n• Volume controls - Independent audio levels\n• Silent mode - Disable all sounds'
      },
      'help': {
        title: 'Help & Support',
        message: 'Get assistance when you need it:\n\n📧 Email Support: support@serviceapp.com\n📞 Phone Support: +91-1234567890\n💬 Live Chat: Available 24/7 in-app\n📚 Help Center: Comprehensive guides\n🎥 Video Tutorials: Step-by-step instructions\n\nAverage response time: 2 hours'
      },
      'terms': {
        title: 'Terms & Conditions',
        message: 'Service Provider Agreement:\n\n• Service completion requirements\n• Professional conduct standards\n• Payment and billing terms\n• Cancellation and refund policies\n• Platform usage guidelines\n• Dispute resolution process\n\nLast updated: January 2024\nVersion: 2.1'
      },
      'privacy-policy': {
        title: 'Privacy Policy',
        message: 'How we protect your information:\n\n• Data collection practices - What we collect\n• Information usage - How we use your data\n• Third-party sharing - When we share data\n• Your rights and choices - Control your privacy\n• Data retention - How long we keep data\n• Security measures - How we protect you\n\nGDPR and CCPA compliant'
      },
      'rate': {
        title: 'Rate Our App',
        message: 'Love using our service provider app?\n\n⭐ Rate us 5 stars on the App Store\n📝 Write a detailed review\n📢 Share with fellow professionals\n💡 Suggest new features\n🎁 Get rewards for referrals\n\nYour feedback helps us improve and serve you better!'
      },
      'feedback': {
        title: 'Send Feedback',
        message: 'Help us improve your experience:\n\n• Feature requests - What would you like to see?\n• Bug reports - Found something broken?\n• User experience - How can we improve?\n• Performance issues - App running slowly?\n• Content suggestions - What\'s missing?\n\nEvery piece of feedback is valuable to us!'
      }
    };

    const info = settingsInfo[action as keyof typeof settingsInfo];
    if (info) {
      Alert.alert(info.title, info.message);
    }
  };

  return (
    <SafeView backgroundColor="#F8FAFC">
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.profileIconContainer}>
            <User size={56} color="#3B82F6" />
          </View>
          <Text style={styles.welcomeText}>Service Provider</Text>
          <Text style={styles.memberSince}>Professional Member • 2024</Text>
          
          {/* Quick Stats */}
          <View style={styles.quickStats}>
            <View style={styles.statItem}>
              <Award size={20} color="#10B981" />
              <Text style={styles.statNumber}>{user?.registeredServices?.length || 0}</Text>
              <Text style={styles.statLabel}>Services</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <TrendingUp size={20} color="#3B82F6" />
              <Text style={styles.statNumber}>4.8</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Calendar size={20} color="#F59E0B" />
              <Text style={styles.statNumber}>24</Text>
              <Text style={styles.statLabel}>Jobs Done</Text>
            </View>
          </View>
        </View>

        {/* Profile Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Information</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Phone size={20} color="#6B7280" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Phone Number</Text>
                <Text style={styles.infoValue}>{user?.phone}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <MapPin size={20} color="#6B7280" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Active Services</Text>
                <Text style={styles.infoValue}>
                  {user?.registeredServices?.length || 0} Services Registered
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <CreditCard size={20} color="#6B7280" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Account Status</Text>
                <Text style={[styles.infoValue, styles.activeStatus]}>Active Professional</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Report Customer Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support & Reporting</Text>
          
          <TouchableOpacity 
            style={styles.reportButton}
            onPress={handleReportCustomer}
          >
            <AlertTriangle size={20} color="#DC2626" />
            <Text style={styles.reportButtonText}>Report Customer</Text>
            <View style={styles.actionButtonArrow}>
              <Text style={styles.arrowText}>›</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Account Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleSettingsAction('edit-profile')}
          >
            <Edit size={20} color="#6B7280" />
            <Text style={styles.actionButtonText}>Edit Profile</Text>
            <View style={styles.actionButtonArrow}>
              <Text style={styles.arrowText}>›</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleSettingsAction('notifications')}
          >
            <Bell size={20} color="#6B7280" />
            <Text style={styles.actionButtonText}>Notifications</Text>
            <View style={styles.actionButtonArrow}>
              <Text style={styles.arrowText}>›</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleSettingsAction('privacy')}
          >
            <Shield size={20} color="#6B7280" />
            <Text style={styles.actionButtonText}>Privacy & Security</Text>
            <View style={styles.actionButtonArrow}>
              <Text style={styles.arrowText}>›</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* App Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Preferences</Text>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleSettingsAction('language')}
          >
            <Globe size={20} color="#6B7280" />
            <Text style={styles.actionButtonText}>Language</Text>
            <View style={styles.actionButtonArrow}>
              <Text style={styles.arrowText}>›</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleSettingsAction('theme')}
          >
            <Palette size={20} color="#6B7280" />
            <Text style={styles.actionButtonText}>Theme & Appearance</Text>
            <View style={styles.actionButtonArrow}>
              <Text style={styles.arrowText}>›</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleSettingsAction('sound')}
          >
            <Volume2 size={20} color="#6B7280" />
            <Text style={styles.actionButtonText}>Sound & Vibration</Text>
            <View style={styles.actionButtonArrow}>
              <Text style={styles.arrowText}>›</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Support & Feedback */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support & Feedback</Text>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleSettingsAction('help')}
          >
            <HelpCircle size={20} color="#6B7280" />
            <Text style={styles.actionButtonText}>Help & Support</Text>
            <View style={styles.actionButtonArrow}>
              <Text style={styles.arrowText}>›</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleSettingsAction('feedback')}
          >
            <Settings size={20} color="#6B7280" />
            <Text style={styles.actionButtonText}>Send Feedback</Text>
            <View style={styles.actionButtonArrow}>
              <Text style={styles.arrowText}>›</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleSettingsAction('rate')}
          >
            <Star size={20} color="#6B7280" />
            <Text style={styles.actionButtonText}>Rate Our App</Text>
            <View style={styles.actionButtonArrow}>
              <Text style={styles.arrowText}>›</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Legal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal & Policies</Text>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleSettingsAction('terms')}
          >
            <FileText size={20} color="#6B7280" />
            <Text style={styles.actionButtonText}>Terms & Conditions</Text>
            <View style={styles.actionButtonArrow}>
              <Text style={styles.arrowText}>›</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleSettingsAction('privacy-policy')}
          >
            <Shield size={20} color="#6B7280" />
            <Text style={styles.actionButtonText}>Privacy Policy</Text>
            <View style={styles.actionButtonArrow}>
              <Text style={styles.arrowText}>›</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={20} color="#EF4444" />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
            <Trash2 size={20} color="#EF4444" style={{ marginRight: 10 }} />
            <Text style={styles.deleteButtonText}>Delete Account</Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appVersion}>Service Provider App v1.0.0</Text>
          <Text style={styles.copyright}>© 2024 Professional Services Platform</Text>
        </View>
      </ScrollView>
    </SafeView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  profileIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#EBF8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  welcomeText: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  memberSince: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 24,
  },
  quickStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginTop: 4,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
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
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  activeStatus: {
    color: '#10B981',
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  reportButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#DC2626',
    marginLeft: 12,
    flex: 1,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    marginLeft: 12,
    flex: 1,
  },
  actionButtonArrow: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowText: {
    fontSize: 18,
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    paddingVertical: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  logoutButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#EF4444',
    marginLeft: 8,
  },
  deleteButton: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff0f0',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingVertical: 16,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  deleteButtonText: {
    color: '#EF4444',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    letterSpacing: 0.2,
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
    textAlign: 'center',
  },
});