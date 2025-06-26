import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { SERVICE_CATEGORIES } from '@/constants/serviceCategories';
import { Edit, Eye, Clock, CheckCircle, XCircle, Trash2 } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ServiceStatus {
  id: string;
  status: 'pending' | 'verified' | 'rejected';
  submittedAt: string;
}

export default function ServicesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [serviceStatuses, setServiceStatuses] = useState<ServiceStatus[]>([]);

  useEffect(() => {
    loadServiceStatuses();
  }, []);

  const loadServiceStatuses = async () => {
    try {
      const statuses = await AsyncStorage.getItem(`service_statuses_${user?.id}`);
      if (statuses) {
        setServiceStatuses(JSON.parse(statuses));
      } else {
        // Initialize statuses for registered services
        const initialStatuses = user?.registeredServices.map(serviceId => ({
          id: serviceId,
          status: 'pending' as const,
          submittedAt: new Date().toISOString(),
        })) || [];
        
        setServiceStatuses(initialStatuses);
        await AsyncStorage.setItem(`service_statuses_${user?.id}`, JSON.stringify(initialStatuses));
      }
    } catch (error) {
      console.error('Error loading service statuses:', error);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { icon: Clock, color: '#F59E0B', text: 'Pending Review' };
      case 'verified':
        return { icon: CheckCircle, color: '#10B981', text: 'Verified' };
      case 'rejected':
        return { icon: XCircle, color: '#EF4444', text: 'Rejected' };
      default:
        return { icon: Clock, color: '#6B7280', text: 'Unknown' };
    }
  };

  const registeredServices = SERVICE_CATEGORIES.filter(service => 
    user?.registeredServices.includes(service.id)
  );

  const handleCancelLabor = async () => {
    // Confirm and remove 'labor' from registeredServices
    Alert.alert(
      'Cancel Labor Service',
      'Are you sure you want to cancel your Labor service registration?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes', style: 'destructive', onPress: async () => {
            // Remove 'labor' from registeredServices
            const updated = user?.registeredServices.filter(id => id !== 'labor') || [];
            // Simulate update (replace with real updateUser logic if available)
            if (user) {
              user.registeredServices = updated;
            }
            // Optionally, update AsyncStorage or context here
            // Reload the screen
            loadServiceStatuses();
          }
        }
      ]
    );
  };

  if (registeredServices.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No Services Registered</Text>
          <Text style={styles.emptySubtitle}>
            Go to Home tab to register for services and start receiving requests
          </Text>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => router.push('/(tabs)')}
          >
            <Text style={styles.primaryButtonText}>Browse Services</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Services</Text>
        <Text style={styles.subtitle}>Manage your registered services</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.servicesList}>
          {registeredServices.map((service) => {
            const serviceStatus = serviceStatuses.find(s => s.id === service.id);
            const status = serviceStatus?.status || 'verified';
            const statusInfo = getStatusInfo(status);
            const StatusIcon = statusInfo.icon;

            return (
              <View key={service.id} style={styles.serviceCard}>
                <View style={styles.serviceHeader}>
                  <View style={styles.serviceInfo}>
                    <Text style={styles.serviceIcon}>{service.icon}</Text>
                    <View style={styles.serviceDetails}>
                      <Text style={styles.serviceName}>{service.name}</Text>
                      <Text style={styles.serviceDescription}>{service.description}</Text>
                    </View>
                  </View>
                  
                  <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + '20' }]}>
                    <StatusIcon size={16} color={statusInfo.color} />
                    <Text style={[styles.statusText, { color: statusInfo.color }]}>
                      {statusInfo.text}
                    </Text>
                  </View>
                </View>

                <View style={styles.serviceActions}>
                  <View style={styles.actionButtonRow}>
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => router.push(`/service-registration/${service.id}?mode=view`)}
                    >
                      <Eye size={16} color="#6B7280" />
                      <Text style={styles.actionButtonText}>View</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => router.push(`/service-registration/${service.id}?mode=edit`)}
                    >
                      <Edit size={16} color="#3B82F6" />
                      <Text style={[styles.actionButtonText, { color: '#3B82F6' }]}>Edit</Text>
                    </TouchableOpacity>
                    {service.id === 'labor' && (
                      <TouchableOpacity
                        style={[styles.actionButton, styles.cancelLaborButton]}
                        onPress={handleCancelLabor}
                      >
                        <Trash2 size={16} color="#EF4444" />
                        <Text style={[styles.actionButtonText, { color: '#EF4444' }]}>Cancel</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            );
          })}
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
  header: {
    padding: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  scrollView: {
    flex: 1,
  },
  servicesList: {
    paddingHorizontal: 24,
  },
  serviceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  serviceHeader: {
    marginBottom: 16,
  },
  serviceInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  serviceIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  serviceDetails: {
    flex: 1,
  },
  serviceName: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 20,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    marginLeft: 6,
  },
  serviceActions: {
    marginTop: 8,
  },
  actionButtonRow: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginRight: 0,
    marginBottom: 0,
  },
  cancelLaborButton: {
    borderColor: '#FECACA',
    backgroundColor: '#FFF0F0',
    marginLeft: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    minWidth: 0,
    height: undefined,
  },
  actionButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    marginLeft: 6,
    paddingRight: 0,
    paddingLeft: 0,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  primaryButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  primaryButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});