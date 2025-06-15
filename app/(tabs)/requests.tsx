import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Modal, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { SERVICE_CATEGORIES } from '@/constants/serviceCategories';
import { Calendar, Clock, MapPin, Phone, CircleCheck as CheckCircle, Circle as XCircle, User, X } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ServiceRequest {
  id: string;
  customerName: string;
  customerPhone: string;
  serviceId: string;
  serviceName: string;
  address: string;
  scheduledDate: string;
  scheduledTime: string;
  status: 'pending' | 'accepted' | 'rejected';
  description: string;
  estimatedPrice: string;
  createdAt: string;
  rejectionReason?: string;
}

export default function RequestsScreen() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string>('');
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    loadRequests();
    // Simulate new request notifications
    const interval = setInterval(() => {
      if (Math.random() > 0.85) { // 15% chance every 10 seconds
        generateMockRequest();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const loadRequests = async () => {
    try {
      const savedRequests = await AsyncStorage.getItem(`requests_${user?.id}`);
      if (savedRequests) {
        setRequests(JSON.parse(savedRequests));
      } else {
        // Generate some initial mock requests
        const initialRequests = generateInitialRequests();
        setRequests(initialRequests);
        await AsyncStorage.setItem(`requests_${user?.id}`, JSON.stringify(initialRequests));
      }
    } catch (error) {
      console.error('Error loading requests:', error);
    }
  };

  const generateInitialRequests = (): ServiceRequest[] => {
    const mockRequests: ServiceRequest[] = [];
    const customerNames = ['Rajesh Kumar', 'Priya Sharma', 'Amit Patel', 'Sunita Singh', 'Vikash Yadav'];
    const addresses = ['MG Road, Bangalore', 'Sector 15, Gurgaon', 'Andheri West, Mumbai', 'Park Street, Kolkata', 'Banjara Hills, Hyderabad'];
    
    user?.registeredServices.forEach((serviceId, index) => {
      const service = SERVICE_CATEGORIES.find(s => s.id === serviceId);
      if (service && index < 3) { // Only create requests for first 3 services
        mockRequests.push({
          id: `request_${Date.now()}_${index}`,
          customerName: customerNames[index % customerNames.length],
          customerPhone: `+91 ${9000000000 + Math.floor(Math.random() * 999999999)}`,
          serviceId: service.id,
          serviceName: service.name,
          address: addresses[index % addresses.length],
          scheduledDate: new Date(Date.now() + (index + 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          scheduledTime: ['10:00 AM', '2:00 PM', '4:00 PM'][index % 3],
          status: 'pending',
          description: `Need ${service.name.toLowerCase()} service for residential property. Urgent requirement.`,
          estimatedPrice: `₹${(index + 1) * 500}`,
          createdAt: new Date(Date.now() - index * 60 * 60 * 1000).toISOString(),
        });
      }
    });

    return mockRequests;
  };

  const generateMockRequest = async () => {
    if (user?.registeredServices.length === 0) return;

    const customerNames = ['Rahul Verma', 'Neha Gupta', 'Arjun Singh', 'Pooja Jain', 'Kiran Reddy'];
    const addresses = ['Koramangala, Bangalore', 'Cyber City, Gurgaon', 'Bandra East, Mumbai', 'Salt Lake, Kolkata', 'Jubilee Hills, Hyderabad'];
    
    const randomServiceId = user.registeredServices[Math.floor(Math.random() * user.registeredServices.length)];
    const service = SERVICE_CATEGORIES.find(s => s.id === randomServiceId);
    
    if (service) {
      const newRequest: ServiceRequest = {
        id: `request_${Date.now()}`,
        customerName: customerNames[Math.floor(Math.random() * customerNames.length)],
        customerPhone: `+91 ${9000000000 + Math.floor(Math.random() * 999999999)}`,
        serviceId: service.id,
        serviceName: service.name,
        address: addresses[Math.floor(Math.random() * addresses.length)],
        scheduledDate: new Date(Date.now() + Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        scheduledTime: ['9:00 AM', '11:00 AM', '2:00 PM', '4:00 PM', '6:00 PM'][Math.floor(Math.random() * 5)],
        status: 'pending',
        description: `Urgent ${service.name.toLowerCase()} service required. Please contact as soon as possible.`,
        estimatedPrice: `₹${Math.floor(Math.random() * 2000) + 500}`,
        createdAt: new Date().toISOString(),
      };

      const updatedRequests = [newRequest, ...requests];
      setRequests(updatedRequests);
      await AsyncStorage.setItem(`requests_${user?.id}`, JSON.stringify(updatedRequests));
    }
  };

  const handleRequestAction = async (requestId: string, action: 'accept' | 'reject', reason?: string) => {
    const updatedRequests = requests.map(request => {
      if (request.id === requestId) {
        return { 
          ...request, 
          status: action === 'accept' ? 'accepted' as const : 'rejected' as const,
          rejectionReason: reason
        };
      }
      return request;
    });
    
    setRequests(updatedRequests);
    await AsyncStorage.setItem(`requests_${user?.id}`, JSON.stringify(updatedRequests));
    
    if (action === 'reject') {
      setShowRejectModal(false);
      setRejectionReason('');
      setSelectedRequestId('');
    }
  };

  const handleRejectPress = (requestId: string) => {
    setSelectedRequestId(requestId);
    setShowRejectModal(true);
  };

  const handleRejectConfirm = () => {
    if (!rejectionReason.trim()) {
      Alert.alert('Error', 'Please provide a reason for rejection');
      return;
    }
    handleRequestAction(selectedRequestId, 'reject', rejectionReason);
  };

  const filteredRequests = requests.filter(request => {
    if (filter === 'all') return true;
    return request.status === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return '#10B981';
      case 'rejected': return '#EF4444';
      default: return '#F59E0B';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted': return CheckCircle;
      case 'rejected': return XCircle;
      default: return Clock;
    }
  };

  const renderRequest = ({ item }: { item: ServiceRequest }) => {
    const StatusIcon = getStatusIcon(item.status);
    const statusColor = getStatusColor(item.status);

    return (
      <View style={styles.requestCard}>
        <View style={styles.requestHeader}>
          <View style={styles.customerInfo}>
            <User size={20} color="#6B7280" />
            <View style={styles.customerDetails}>
              <Text style={styles.customerName}>{item.customerName}</Text>
              <Text style={styles.serviceName}>{item.serviceName}</Text>
            </View>
          </View>
          
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
            <StatusIcon size={16} color={statusColor} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>

        <View style={styles.requestDetails}>
          <View style={styles.detailRow}>
            <Calendar size={16} color="#6B7280" />
            <Text style={styles.detailText}>{item.scheduledDate} at {item.scheduledTime}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <MapPin size={16} color="#6B7280" />
            <Text style={styles.detailText}>{item.address}</Text>
          </View>
          
          {item.status === 'accepted' && (
            <View style={styles.detailRow}>
              <Phone size={16} color="#6B7280" />
              <Text style={styles.detailText}>{item.customerPhone}</Text>
            </View>
          )}
        </View>

        <Text style={styles.description}>{item.description}</Text>
        <Text style={styles.estimatedPrice}>Estimated: {item.estimatedPrice}</Text>

        {item.status === 'rejected' && item.rejectionReason && (
          <View style={styles.rejectionReasonContainer}>
            <Text style={styles.rejectionReasonLabel}>Rejection Reason:</Text>
            <Text style={styles.rejectionReasonText}>{item.rejectionReason}</Text>
          </View>
        )}

        {item.status === 'pending' && (
          <View style={styles.requestActions}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.acceptButton]}
              onPress={() => handleRequestAction(item.id, 'accept')}
            >
              <CheckCircle size={16} color="#FFFFFF" />
              <Text style={styles.acceptButtonText}>Accept</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => handleRejectPress(item.id)}
            >
              <XCircle size={16} color="#FFFFFF" />
              <Text style={styles.rejectButtonText}>Reject</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  if (user?.registeredServices.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <MessageCircle size={64} color="#9CA3AF" />
          <Text style={styles.emptyTitle}>No Services Registered</Text>
          <Text style={styles.emptySubtitle}>
            Register for services to start receiving requests from customers
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Service Requests</Text>
        <Text style={styles.subtitle}>Manage customer requests</Text>
      </View>

      <View style={styles.filterContainer}>
        {['all', 'pending', 'accepted', 'rejected'].map((filterOption) => (
          <TouchableOpacity
            key={filterOption}
            style={[
              styles.filterButton,
              filter === filterOption && styles.activeFilter
            ]}
            onPress={() => setFilter(filterOption as any)}
          >
            <Text style={[
              styles.filterText,
              filter === filterOption && styles.activeFilterText
            ]}>
              {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredRequests}
        renderItem={renderRequest}
        keyExtractor={(item) => item.id}
        style={styles.requestsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyRequests}>
            <Text style={styles.emptyRequestsText}>No requests found</Text>
          </View>
        }
      />

      {/* Rejection Modal */}
      <Modal
        visible={showRejectModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowRejectModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Reject Request</Text>
              <TouchableOpacity 
                onPress={() => setShowRejectModal(false)}
                style={styles.closeButton}
              >
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Please provide a reason for rejecting this request:
            </Text>

            <TextInput
              style={styles.reasonInput}
              value={rejectionReason}
              onChangeText={setRejectionReason}
              placeholder="Enter rejection reason..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowRejectModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.confirmRejectButton}
                onPress={handleRejectConfirm}
              >
                <Text style={styles.confirmRejectButtonText}>Reject Request</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 16,
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  activeFilter: {
    backgroundColor: '#3B82F6',
  },
  filterText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  requestsList: {
    flex: 1,
    paddingHorizontal: 24,
  },
  requestCard: {
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
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  customerDetails: {
    marginLeft: 12,
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 2,
  },
  serviceName: {
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
  requestDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    marginLeft: 8,
    flex: 1,
  },
  description: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 8,
    lineHeight: 20,
  },
  estimatedPrice: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#3B82F6',
    marginBottom: 16,
  },
  rejectionReasonContainer: {
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  rejectionReasonLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#DC2626',
    marginBottom: 4,
  },
  rejectionReasonText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#7F1D1D',
    lineHeight: 18,
  },
  requestActions: {
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
  acceptButton: {
    backgroundColor: '#10B981',
  },
  rejectButton: {
    backgroundColor: '#EF4444',
  },
  acceptButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  rejectButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
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
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  emptyRequests: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyRequestsText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    margin: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  closeButton: {
    padding: 4,
  },
  modalSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 24,
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    marginBottom: 24,
    minHeight: 100,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  confirmRejectButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    alignItems: 'center',
  },
  confirmRejectButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});