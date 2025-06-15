import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { SERVICE_CATEGORIES } from '@/constants/serviceCategories';
import { Calendar, Clock, MapPin, Phone, CircleCheck as CheckCircle, Circle as XCircle, User } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Booking {
  id: string;
  customerName: string;
  customerPhone: string;
  serviceId: string;
  serviceName: string;
  address: string;
  scheduledDate: string;
  scheduledTime: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  description: string;
  estimatedPrice: string;
  createdAt: string;
}

export default function BookingsScreen() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'completed'>('all');

  useEffect(() => {
    loadBookings();
    // Simulate new booking notifications
    const interval = setInterval(() => {
      if (Math.random() > 0.8) { // 20% chance every 10 seconds
        generateMockBooking();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const loadBookings = async () => {
    try {
      const savedBookings = await AsyncStorage.getItem(`bookings_${user?.id}`);
      if (savedBookings) {
        setBookings(JSON.parse(savedBookings));
      } else {
        // Generate some initial mock bookings
        const initialBookings = generateInitialBookings();
        setBookings(initialBookings);
        await AsyncStorage.setItem(`bookings_${user?.id}`, JSON.stringify(initialBookings));
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
    }
  };

  const generateInitialBookings = (): Booking[] => {
    const mockBookings: Booking[] = [];
    const customerNames = ['Rajesh Kumar', 'Priya Sharma', 'Amit Patel', 'Sunita Singh'];
    const addresses = ['MG Road, Bangalore', 'Sector 15, Gurgaon', 'Andheri West, Mumbai', 'Park Street, Kolkata'];
    
    user?.registeredServices.forEach((serviceId, index) => {
      const service = SERVICE_CATEGORIES.find(s => s.id === serviceId);
      if (service && index < 2) { // Only create bookings for first 2 services
        mockBookings.push({
          id: `booking_${Date.now()}_${index}`,
          customerName: customerNames[index % customerNames.length],
          customerPhone: `+91 ${9000000000 + Math.floor(Math.random() * 999999999)}`,
          serviceId: service.id,
          serviceName: service.name,
          address: addresses[index % addresses.length],
          scheduledDate: new Date(Date.now() + (index + 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          scheduledTime: ['10:00 AM', '2:00 PM', '4:00 PM'][index % 3],
          status: ['pending', 'accepted'][index % 2] as 'pending' | 'accepted',
          description: `Need ${service.name.toLowerCase()} service for residential property`,
          estimatedPrice: `₹${(index + 1) * 500}`,
          createdAt: new Date(Date.now() - index * 60 * 60 * 1000).toISOString(),
        });
      }
    });

    return mockBookings;
  };

  const generateMockBooking = async () => {
    if (user?.registeredServices.length === 0) return;

    const customerNames = ['Rahul Verma', 'Neha Gupta', 'Vikash Yadav', 'Pooja Jain', 'Arjun Singh'];
    const addresses = ['Koramangala, Bangalore', 'Cyber City, Gurgaon', 'Bandra East, Mumbai', 'Salt Lake, Kolkata', 'Jubilee Hills, Hyderabad'];
    
    const randomServiceId = user.registeredServices[Math.floor(Math.random() * user.registeredServices.length)];
    const service = SERVICE_CATEGORIES.find(s => s.id === randomServiceId);
    
    if (service) {
      const newBooking: Booking = {
        id: `booking_${Date.now()}`,
        customerName: customerNames[Math.floor(Math.random() * customerNames.length)],
        customerPhone: `+91 ${9000000000 + Math.floor(Math.random() * 999999999)}`,
        serviceId: service.id,
        serviceName: service.name,
        address: addresses[Math.floor(Math.random() * addresses.length)],
        scheduledDate: new Date(Date.now() + Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        scheduledTime: ['9:00 AM', '11:00 AM', '2:00 PM', '4:00 PM', '6:00 PM'][Math.floor(Math.random() * 5)],
        status: 'pending',
        description: `Urgent ${service.name.toLowerCase()} service required`,
        estimatedPrice: `₹${Math.floor(Math.random() * 2000) + 500}`,
        createdAt: new Date().toISOString(),
      };

      const updatedBookings = [newBooking, ...bookings];
      setBookings(updatedBookings);
      await AsyncStorage.setItem(`bookings_${user?.id}`, JSON.stringify(updatedBookings));
    }
  };

  const handleBookingAction = async (bookingId: string, action: 'accept' | 'reject') => {
    const updatedBookings = bookings.map(booking => {
      if (booking.id === bookingId) {
        return { ...booking, status: action === 'accept' ? 'accepted' as const : 'rejected' as const };
      }
      return booking;
    });
    
    setBookings(updatedBookings);
    await AsyncStorage.setItem(`bookings_${user?.id}`, JSON.stringify(updatedBookings));
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    return booking.status === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return '#10B981';
      case 'rejected': return '#EF4444';
      case 'completed': return '#6366F1';
      default: return '#F59E0B';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted': return CheckCircle;
      case 'rejected': return XCircle;
      case 'completed': return CheckCircle;
      default: return Clock;
    }
  };

  const renderBooking = ({ item }: { item: Booking }) => {
    const StatusIcon = getStatusIcon(item.status);
    const statusColor = getStatusColor(item.status);

    return (
      <View style={styles.bookingCard}>
        <View style={styles.bookingHeader}>
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

        <View style={styles.bookingDetails}>
          <View style={styles.detailRow}>
            <Calendar size={16} color="#6B7280" />
            <Text style={styles.detailText}>{item.scheduledDate} at {item.scheduledTime}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <MapPin size={16} color="#6B7280" />
            <Text style={styles.detailText}>{item.address}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Phone size={16} color="#6B7280" />
            <Text style={styles.detailText}>{item.customerPhone}</Text>
          </View>
        </View>

        <Text style={styles.description}>{item.description}</Text>
        <Text style={styles.estimatedPrice}>Estimated: {item.estimatedPrice}</Text>

        {item.status === 'pending' && (
          <View style={styles.bookingActions}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.acceptButton]}
              onPress={() => handleBookingAction(item.id, 'accept')}
            >
              <CheckCircle size={16} color="#FFFFFF" />
              <Text style={styles.acceptButtonText}>Accept</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => handleBookingAction(item.id, 'reject')}
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
          <Calendar size={64} color="#9CA3AF" />
          <Text style={styles.emptyTitle}>No Services Registered</Text>
          <Text style={styles.emptySubtitle}>
            Register for services to start receiving booking requests from customers
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Bookings</Text>
        <Text style={styles.subtitle}>Manage your service requests</Text>
      </View>

      <View style={styles.filterContainer}>
        {['all', 'pending', 'accepted', 'completed'].map((filterOption) => (
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
        data={filteredBookings}
        renderItem={renderBooking}
        keyExtractor={(item) => item.id}
        style={styles.bookingsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyBookings}>
            <Text style={styles.emptyBookingsText}>No bookings found</Text>
          </View>
        }
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
  bookingsList: {
    flex: 1,
    paddingHorizontal: 24,
  },
  bookingCard: {
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
  bookingHeader: {
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
  bookingDetails: {
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
  bookingActions: {
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
  emptyBookings: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyBookingsText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
});