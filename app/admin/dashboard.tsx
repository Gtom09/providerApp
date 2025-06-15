import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { SERVICE_CATEGORIES } from '@/constants/serviceCategories';
import { LogOut, Filter, Search, CheckCircle, XCircle, Clock, Users } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Provider {
  id: string;
  phone: string;
  registeredServices: string[];
  status: 'pending' | 'verified' | 'rejected';
  state?: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { logout } = useAuth();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<Provider[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    loadProviders();
  }, []);

  useEffect(() => {
    filterProviders();
  }, [providers, selectedCategory, selectedStatus]);

  const loadProviders = async () => {
    try {
      // Mock provider data (in real app, fetch from backend)
      const mockProviders: Provider[] = [
        {
          id: '1',
          phone: '+91 9876543210',
          registeredServices: ['plumber', 'engineer-interior'],
          status: 'pending',
          state: 'Maharashtra',
        },
        {
          id: '2',
          phone: '+91 8765432109',
          registeredServices: ['mason-mastri'],
          status: 'verified',
          state: 'Karnataka',
        },
        {
          id: '3',
          phone: '+91 7654321098',
          registeredServices: ['painting-cleaning', 'granite-tiles'],
          status: 'rejected',
          state: 'Tamil Nadu',
        },
      ];
      
      setProviders(mockProviders);
    } catch (error) {
      console.error('Error loading providers:', error);
    }
  };

  const filterProviders = () => {
    let filtered = providers;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(provider => 
        provider.registeredServices.includes(selectedCategory)
      );
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(provider => 
        provider.status === selectedStatus
      );
    }

    setFilteredProviders(filtered);
  };

  const handleProviderAction = async (providerId: string, action: 'approve' | 'reject') => {
    try {
      const updatedProviders = providers.map(provider => {
        if (provider.id === providerId) {
          return { 
            ...provider, 
            status: action === 'approve' ? 'verified' as const : 'rejected' as const 
          };
        }
        return provider;
      });
      
      setProviders(updatedProviders);
      
      // In real app, update backend and notify provider
    } catch (error) {
      console.error('Error updating provider status:', error);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/auth');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return '#10B981';
      case 'rejected': return '#EF4444';
      default: return '#F59E0B';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return CheckCircle;
      case 'rejected': return XCircle;
      default: return Clock;
    }
  };

  const renderProvider = ({ item }: { item: Provider }) => {
    const StatusIcon = getStatusIcon(item.status);
    const statusColor = getStatusColor(item.status);

    return (
      <View style={styles.providerCard}>
        <View style={styles.providerHeader}>
          <View style={styles.providerInfo}>
            <Text style={styles.providerPhone}>{item.phone}</Text>
            <Text style={styles.providerState}>{item.state}</Text>
          </View>
          
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
            <StatusIcon size={16} color={statusColor} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>

        <View style={styles.servicesList}>
          <Text style={styles.servicesLabel}>Registered Services:</Text>
          {item.registeredServices.map(serviceId => {
            const service = SERVICE_CATEGORIES.find(s => s.id === serviceId);
            return (
              <Text key={serviceId} style={styles.serviceTag}>
                {service?.name}
              </Text>
            );
          })}
        </View>

        {item.status === 'pending' && (
          <View style={styles.providerActions}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.approveButton]}
              onPress={() => handleProviderAction(item.id, 'approve')}
            >
              <CheckCircle size={16} color="#FFFFFF" />
              <Text style={styles.approveButtonText}>Approve</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => handleProviderAction(item.id, 'reject')}
            >
              <XCircle size={16} color="#FFFFFF" />
              <Text style={styles.rejectButtonText}>Reject</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Text style={styles.title}>Admin Dashboard</Text>
          <Text style={styles.subtitle}>Manage service providers</Text>
        </View>
        
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <View style={styles.stats}>
        <View style={styles.statCard}>
          <Users size={24} color="#3B82F6" />
          <Text style={styles.statNumber}>{providers.length}</Text>
          <Text style={styles.statLabel}>Total Providers</Text>
        </View>
        
        <View style={styles.statCard}>
          <Clock size={24} color="#F59E0B" />
          <Text style={styles.statNumber}>
            {providers.filter(p => p.status === 'pending').length}
          </Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        
        <View style={styles.statCard}>
          <CheckCircle size={24} color="#10B981" />
          <Text style={styles.statNumber}>
            {providers.filter(p => p.status === 'verified').length}
          </Text>
          <Text style={styles.statLabel}>Verified</Text>
        </View>
      </View>

      <View style={styles.filters}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity 
            style={[
              styles.filterButton,
              selectedCategory === 'all' && styles.activeFilter
            ]}
            onPress={() => setSelectedCategory('all')}
          >
            <Text style={[
              styles.filterText,
              selectedCategory === 'all' && styles.activeFilterText
            ]}>All Categories</Text>
          </TouchableOpacity>
          
          {SERVICE_CATEGORIES.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.filterButton,
                selectedCategory === category.id && styles.activeFilter
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Text style={[
                styles.filterText,
                selectedCategory === category.id && styles.activeFilterText
              ]}>{category.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.statusFilters}>
        {['all', 'pending', 'verified', 'rejected'].map(status => (
          <TouchableOpacity
            key={status}
            style={[
              styles.statusButton,
              selectedStatus === status && styles.activeStatus
            ]}
            onPress={() => setSelectedStatus(status)}
          >
            <Text style={[
              styles.statusButtonText,
              selectedStatus === status && styles.activeStatusText
            ]}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredProviders}
        renderItem={renderProvider}
        keyExtractor={(item) => item.id}
        style={styles.providersList}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  logoutButton: {
    padding: 8,
  },
  stats: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 20,
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statNumber: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginTop: 4,
  },
  filters: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 12,
  },
  activeFilter: {
    backgroundColor: '#3B82F6',
  },
  filterText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  statusFilters: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 16,
    gap: 8,
  },
  statusButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  activeStatus: {
    backgroundColor: '#3B82F6',
  },
  statusButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  activeStatusText: {
    color: '#FFFFFF',
  },
  providersList: {
    flex: 1,
    paddingHorizontal: 24,
  },
  providerCard: {
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
  providerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  providerInfo: {
    flex: 1,
  },
  providerPhone: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 4,
  },
  providerState: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    marginLeft: 6,
  },
  servicesList: {
    marginBottom: 16,
  },
  servicesLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    marginBottom: 8,
  },
  serviceTag: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  providerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  approveButton: {
    backgroundColor: '#10B981',
  },
  rejectButton: {
    backgroundColor: '#EF4444',
  },
  approveButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  rejectButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});