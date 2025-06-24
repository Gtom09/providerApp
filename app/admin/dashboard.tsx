import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { SERVICE_CATEGORIES } from '@/constants/serviceCategories';
import { LogOut, Users, DollarSign, TriangleAlert as AlertTriangle, Trash2, Eye, CircleCheck as CheckCircle, Circle as XCircle, Clock, FileText } from 'lucide-react-native';
import { SafeView } from '@/components/SafeView';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Provider {
  id: string;
  phone: string;
  registeredServices: string[];
  status: 'pending' | 'verified' | 'rejected';
  state?: string;
  joinedDate: string;
}

interface CustomerComplaint {
  id: string;
  customerName: string;
  providerPhone: string;
  serviceName: string;
  complaint: string;
  status: 'open' | 'resolved';
  date: string;
  type: 'customer' | 'provider';
}

interface CustomerReport {
  id: string;
  reporterId: string;
  reporterPhone: string;
  customerName: string;
  incidentDate: string;
  incidentTime: string;
  incidentType: string;
  description: string;
  evidence: string[];
  status: 'open' | 'resolved';
  submittedAt: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { logout } = useAuth();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [customerComplaints, setCustomerComplaints] = useState<CustomerComplaint[]>([]);
  const [providerReports, setProviderReports] = useState<CustomerReport[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load customer reports from AsyncStorage
      const customerReports = await AsyncStorage.getItem('customer_reports');
      const reports = customerReports ? JSON.parse(customerReports) : [];
      setProviderReports(reports);

      // Mock data for other sections
      const mockProviders: Provider[] = [
        {
          id: '1',
          phone: '+91 9876543210',
          registeredServices: ['plumber', 'engineer-interior'],
          status: 'verified',
          state: 'Maharashtra',
          joinedDate: '2024-01-15',
        },
        {
          id: '2',
          phone: '+91 8765432109',
          registeredServices: ['mason-mastri'],
          status: 'pending',
          state: 'Karnataka',
          joinedDate: '2024-01-20',
        },
        {
          id: '3',
          phone: '+91 7654321098',
          registeredServices: ['painting-cleaning', 'granite-tiles'],
          status: 'verified',
          state: 'Tamil Nadu',
          joinedDate: '2024-01-18',
        },
      ];

      const mockCustomerComplaints: CustomerComplaint[] = [
        {
          id: '1',
          customerName: 'Rajesh Kumar',
          providerPhone: '+91 9876543210',
          serviceName: 'Plumbing',
          complaint: 'Work was not completed on time and quality was poor',
          status: 'open',
          date: '2024-01-25',
          type: 'customer',
        },
        {
          id: '2',
          customerName: 'Priya Sharma',
          providerPhone: '+91 8765432109',
          serviceName: 'Masonry',
          complaint: 'Provider did not show up on scheduled date',
          status: 'open',
          date: '2024-01-24',
          type: 'customer',
        },
      ];
      
      setProviders(mockProviders);
      setCustomerComplaints(mockCustomerComplaints);
      setTotalUsers(156);
      setTotalIncome(45600);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const handleRemoveProvider = (providerId: string, providerPhone: string) => {
    Alert.alert(
      'Remove Service Provider',
      `Are you sure you want to remove the service provider ${providerPhone}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => {
            const updatedProviders = providers.filter(p => p.id !== providerId);
            setProviders(updatedProviders);
            Alert.alert('Success', 'Service provider has been removed successfully');
          }
        }
      ]
    );
  };

  const handleViewCustomerComplaint = (complaint: CustomerComplaint) => {
    Alert.alert(
      'Customer Complaint Details',
      `Customer: ${complaint.customerName}\nProvider: ${complaint.providerPhone}\nService: ${complaint.serviceName}\n\nComplaint:\n${complaint.complaint}\n\nDate: ${complaint.date}`,
      [
        { text: 'Mark as Resolved', onPress: () => resolveCustomerComplaint(complaint.id) },
        { text: 'Close', style: 'cancel' }
      ]
    );
  };

  const handleViewProviderReport = (report: CustomerReport) => {
    const evidenceText = report.evidence.length > 0 ? `\n\nEvidence: ${report.evidence.length} file(s) attached` : '';
    
    Alert.alert(
      'Provider Report Details',
      `Reporter: ${report.reporterPhone}\nCustomer: ${report.customerName}\nIncident Type: ${report.incidentType}\nDate: ${report.incidentDate} ${report.incidentTime}\n\nDescription:\n${report.description}${evidenceText}\n\nSubmitted: ${new Date(report.submittedAt).toLocaleDateString()}`,
      [
        { text: 'Mark as Resolved', onPress: () => resolveProviderReport(report.id) },
        { text: 'Close', style: 'cancel' }
      ]
    );
  };

  const resolveCustomerComplaint = (complaintId: string) => {
    const updatedComplaints = customerComplaints.map(c => 
      c.id === complaintId ? { ...c, status: 'resolved' as const } : c
    );
    setCustomerComplaints(updatedComplaints);
    Alert.alert('Success', 'Customer complaint has been marked as resolved');
  };

  const resolveProviderReport = async (reportId: string) => {
    const updatedReports = providerReports.map(r => 
      r.id === reportId ? { ...r, status: 'resolved' as const } : r
    );
    setProviderReports(updatedReports);
    
    // Update AsyncStorage
    await AsyncStorage.setItem('customer_reports', JSON.stringify(updatedReports));
    Alert.alert('Success', 'Provider report has been marked as resolved');
  };

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
            <Text style={styles.providerState}>{item.state} • Joined {item.joinedDate}</Text>
          </View>
          
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
            <StatusIcon size={16} color={statusColor} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>

        <View style={styles.servicesList}>
          <Text style={styles.servicesLabel}>Services ({item.registeredServices.length}):</Text>
          <View style={styles.serviceTagsContainer}>
            {item.registeredServices.map(serviceId => {
              const service = SERVICE_CATEGORIES.find(s => s.id === serviceId);
              return (
                <View key={serviceId} style={styles.serviceTag}>
                  <Text style={styles.serviceTagText}>{service?.name}</Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.providerActions}>
          <TouchableOpacity 
            style={styles.removeButton}
            onPress={() => handleRemoveProvider(item.id, item.phone)}
          >
            <Trash2 size={16} color="#FFFFFF" />
            <Text style={styles.removeButtonText}>Remove Provider</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderCustomerComplaint = ({ item }: { item: CustomerComplaint }) => (
    <TouchableOpacity 
      style={[styles.complaintCard, item.status === 'resolved' && styles.resolvedComplaint]}
      onPress={() => handleViewCustomerComplaint(item)}
    >
      <View style={styles.complaintHeader}>
        <Text style={styles.complaintCustomer}>{item.customerName}</Text>
        <View style={[
          styles.complaintStatus, 
          { backgroundColor: item.status === 'resolved' ? '#10B981' : '#EF4444' }
        ]}>
          <Text style={styles.complaintStatusText}>
            {item.status === 'resolved' ? 'Resolved' : 'Open'}
          </Text>
        </View>
      </View>
      <Text style={styles.complaintService}>{item.serviceName} • {item.providerPhone}</Text>
      <Text style={styles.complaintText} numberOfLines={2}>{item.complaint}</Text>
      <Text style={styles.complaintDate}>{item.date}</Text>
    </TouchableOpacity>
  );

  const renderProviderReport = ({ item }: { item: CustomerReport }) => (
    <TouchableOpacity 
      style={[styles.reportCard, item.status === 'resolved' && styles.resolvedComplaint]}
      onPress={() => handleViewProviderReport(item)}
    >
      <View style={styles.complaintHeader}>
        <Text style={styles.complaintCustomer}>Report: {item.customerName}</Text>
        <View style={[
          styles.complaintStatus, 
          { backgroundColor: item.status === 'resolved' ? '#10B981' : '#DC2626' }
        ]}>
          <Text style={styles.complaintStatusText}>
            {item.status === 'resolved' ? 'Resolved' : 'Open'}
          </Text>
        </View>
      </View>
      <Text style={styles.complaintService}>{item.incidentType} • Reporter: {item.reporterPhone}</Text>
      <Text style={styles.complaintText} numberOfLines={2}>{item.description}</Text>
      <View style={styles.reportFooter}>
        <Text style={styles.complaintDate}>{item.incidentDate}</Text>
        {item.evidence.length > 0 && (
          <View style={styles.evidenceBadge}>
            <FileText size={12} color="#3B82F6" />
            <Text style={styles.evidenceText}>{item.evidence.length} evidence</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeView backgroundColor="#F8FAFC">
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Text style={styles.title}>Admin Dashboard</Text>
          <Text style={styles.subtitle}>Service Provider Management</Text>
        </View>
        
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Users size={32} color="#3B82F6" />
            <Text style={styles.statNumber}>{totalUsers}</Text>
            <Text style={styles.statLabel}>Total Users</Text>
          </View>
          
          <View style={styles.statCard}>
            <Users size={32} color="#10B981" />
            <Text style={styles.statNumber}>{providers.length}</Text>
            <Text style={styles.statLabel}>Service Providers</Text>
          </View>
          
          <View style={styles.statCard}>
            <DollarSign size={32} color="#F59E0B" />
            <Text style={styles.statNumber}>₹{totalIncome.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Income Generated</Text>
          </View>
        </View>

        {/* Escalations from Customers */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <AlertTriangle size={24} color="#EF4444" />
            <Text style={styles.sectionTitle}>Escalations from Customers</Text>
          </View>
          
          {customerComplaints.filter(c => c.status === 'open').length > 0 ? (
            <FlatList
              data={customerComplaints.filter(c => c.status === 'open')}
              renderItem={renderCustomerComplaint}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No open customer complaints</Text>
            </View>
          )}
        </View>

        {/* Escalations from Service Providers */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <AlertTriangle size={24} color="#DC2626" />
            <Text style={styles.sectionTitle}>Escalations from Service Providers</Text>
          </View>
          
          {providerReports.filter(r => r.status === 'open').length > 0 ? (
            <FlatList
              data={providerReports.filter(r => r.status === 'open')}
              renderItem={renderProviderReport}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No open provider reports</Text>
            </View>
          )}
        </View>

        {/* Service Providers Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service Providers Management</Text>
          
          <FlatList
            data={providers}
            renderItem={renderProvider}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>
    </SafeView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
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
  scrollView: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 20,
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginTop: 12,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginLeft: 8,
  },
  complaintCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  reportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  resolvedComplaint: {
    borderLeftColor: '#10B981',
    opacity: 0.7,
  },
  complaintHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  complaintCustomer: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    flex: 1,
  },
  complaintStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  complaintStatusText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  complaintService: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginBottom: 8,
  },
  complaintText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    marginBottom: 8,
    lineHeight: 20,
  },
  complaintDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
  reportFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  evidenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  evidenceText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#3B82F6',
  },
  providerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
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
  serviceTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  serviceTag: {
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  serviceTagText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#1E40AF',
  },
  providerActions: {
    alignItems: 'flex-end',
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  removeButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
});