import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  Pressable,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { SERVICE_CATEGORIES } from '@/constants/serviceCategories';
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  CheckCircle,
  XCircle,
  User,
  AlertTriangle,
  Star, // Import Star icon for ratings
} from 'lucide-react-native';
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
  cancelReason?: string; // Added for rejected bookings
  // You might want to store rating here later:
  customerRating?: number;
  customerFeedback?: string;
}

export default function BookingsScreen() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'completed'>('all');

  // Reject Modal State
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectBookingId, setRejectBookingId] = useState<string | null>(null);
  const [customOtherReason, setCustomOtherReason] = useState('');

  // Report Modal State
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportBooking, setReportBooking] = useState<Booking | null>(null);
  const [customReportOtherReason, setCustomReportOtherReason] = useState('');

  // New: Rating Modal State
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [ratingBookingId, setRatingBookingId] = useState<string | null>(null);
  const [customerRating, setCustomerRating] = useState(0); // 0-5 stars
  const [ratingFeedback, setRatingFeedback] = useState('');

  const cancelReasons = [
    'Change of plans',
    'Found another provider',
    'Service no longer needed',
    'Price concerns',
    'Schedule conflict',
    'Other',
  ];

  const reportReasons = [
    'Abusive language',
    'Fraudulent activity',
    'No show',
    'Payment issue',
    'Other',
  ];

  const isOtherRejectReason = rejectReason === 'Other';
  const canSubmitReject = (rejectReason && rejectReason !== 'Other') || (isOtherRejectReason && customOtherReason.trim());

  const isOtherReportReason = reportReason === 'Other';
  const canSubmitReport = (reportReason && reportReason !== 'Other') || (isOtherReportReason && customReportOtherReason.trim());

  const canSubmitRating = customerRating > 0; // At least one star to submit

  useEffect(() => {
    loadBookings();
    // Simulate new booking notifications
    const interval = setInterval(() => {
      if (Math.random() > 0.8) {
        // 20% chance every 10 seconds
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
        // Generate some initial mock bookings if none exist
        const initialBookings = generateInitialBookings();
        setBookings(initialBookings);
        await AsyncStorage.setItem(`bookings_${user?.id}`, JSON.stringify(initialBookings));
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
      Alert.alert('Error', 'Failed to load bookings. Please try again.');
    }
  };

  const generateInitialBookings = (): Booking[] => {
    const mockBookings: Booking[] = [];
    const customerNames = ['Rajesh Kumar', 'Priya Sharma', 'Amit Patel', 'Sunita Singh', 'Deepak Verma', 'Meena Devi'];
    const addresses = [
      'MG Road, Bangalore',
      'Sector 15, Gurgaon',
      'Andheri West, Mumbai',
      'Park Street, Kolkata',
      'Jayanagar, Bangalore',
      'DLF Phase 3, Gurgaon',
    ];
    const descriptions = [
      'Need service for residential property.',
      'Require urgent assistance for plumbing issue.',
      'Looking for a professional for interior design consultation.',
      'Electrician needed for wiring repair.',
      'Carpentry work for new furniture installation.',
      'Pest control for a small apartment.',
    ];

    user?.registeredServices.forEach((serviceId, index) => {
      const service = SERVICE_CATEGORIES.find((s) => s.id === serviceId);
      if (service && index < 4) {
        // Create bookings for up to 4 services
        mockBookings.push({
          id: `booking_${Date.now()}_${index}`,
          customerName: customerNames[index % customerNames.length],
          customerPhone: `+91 ${9000000000 + Math.floor(Math.random() * 999999999)}`,
          serviceId: service.id,
          serviceName: service.name,
          address: addresses[index % addresses.length],
          scheduledDate: new Date(Date.now() + (index + 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          scheduledTime: ['10:00 AM', '2:00 PM', '4:00 PM'][index % 3],
          status: ['pending', 'accepted', 'completed'][index % 3] as 'pending' | 'accepted' | 'completed',
          description: descriptions[index % descriptions.length],
          estimatedPrice: `₹${(index + 1) * 500 + Math.floor(Math.random() * 200)}`,
          createdAt: new Date(Date.now() - index * 60 * 60 * 1000).toISOString(),
        });
      }
    });

    return mockBookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); // Sort by newest first
  };

  const generateMockBooking = async () => {
    if (!user || !user.registeredServices?.length) return;
    const randomServiceId = user.registeredServices[Math.floor(Math.random() * user.registeredServices.length)];
    const service = SERVICE_CATEGORIES.find((s) => s.id === randomServiceId);

    if (service) {
      const newBooking: Booking = {
        id: `booking_${Date.now()}`,
        customerName: 'Aisha Begum',
        customerPhone: `+91 ${9000000000 + Math.floor(Math.random() * 999999999)}`,
        serviceId: service.id,
        serviceName: service.name,
        address: 'Electronic City, Bangalore',
        scheduledDate: new Date(Date.now() + Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        scheduledTime: ['9:00 AM', '11:00 AM', '2:00 PM', '4:00 PM', '6:00 PM'][Math.floor(Math.random() * 5)],
        status: 'pending',
        description: `Urgent ${service.name.toLowerCase()} service required.`,
        estimatedPrice: `₹${Math.floor(Math.random() * 2000) + 500}`,
        createdAt: new Date().toISOString(),
      };

      const updatedBookings = [newBooking, ...bookings]; // Add new booking at the top
      setBookings(updatedBookings);
      await AsyncStorage.setItem(`bookings_${user?.id}`, JSON.stringify(updatedBookings));
      Alert.alert('New Booking!', `You have a new booking request for ${service.name} from ${newBooking.customerName}.`);
    }
  };

  const handleBookingAction = async (bookingId: string, action: 'accept' | 'reject' | 'complete', reason?: string, rating?: number, feedback?: string) => {
    const updatedBookings = bookings.map((booking) => {
      if (booking.id === bookingId) {
        return {
          ...booking,
          status: action === 'accept' ? ('accepted' as const) : action === 'complete' ? ('completed' as const) : ('rejected' as const),
          cancelReason: action === 'reject' ? reason : undefined,
          customerRating: action === 'complete' ? rating : booking.customerRating,
          customerFeedback: action === 'complete' ? feedback : booking.customerFeedback,
        };
      }
      return booking;
    });
    setBookings(updatedBookings);
    await AsyncStorage.setItem(`bookings_${user?.id}`, JSON.stringify(updatedBookings));
    if (action !== 'complete') { // Only show success alert for accept/reject directly
      Alert.alert('Success', `Booking ${action}ed successfully.`);
    }
  };

  const openRejectModal = (bookingId: string) => {
    setRejectBookingId(bookingId);
    setRejectReason('');
    setCustomOtherReason('');
    setRejectModalVisible(true);
  };

  const handleRejectSubmit = async () => {
    let reason = rejectReason;
    if (isOtherRejectReason) reason = customOtherReason;
    if (!reason.trim() || !rejectBookingId) return; // Basic validation
    await handleBookingAction(rejectBookingId, 'reject', reason);
    setRejectModalVisible(false);
    setRejectBookingId(null);
    setRejectReason('');
    setCustomOtherReason('');
  };

  const openReportModal = (item: Booking) => {
    setReportBooking(item);
    setReportReason('');
    setCustomReportOtherReason('');
    setReportModalVisible(true);
  };

  const handleReportSubmit = () => {
    let reason = reportReason;
    if (isOtherReportReason) reason = customReportOtherReason;
    if (!reason.trim() || !reportBooking) return; // Basic validation

    // In a real app, you would send this report to your backend
    console.log(`Reporting booking ${reportBooking.id} for reason: ${reason}`);

    setReportModalVisible(false);
    setReportBooking(null);
    setReportReason('');
    setCustomReportOtherReason('');
    Alert.alert('Report Submitted', 'The user has been reported. Thank you for helping us maintain a safe community.');
  };

  // New: Open Rating Modal
  const openRatingModal = (bookingId: string) => {
    setRatingBookingId(bookingId);
    setCustomerRating(0); // Reset rating
    setRatingFeedback(''); // Reset feedback
    setRatingModalVisible(true);
  };

  // New: Handle Rating Submission
  const handleRatingSubmit = async () => {
    if (!ratingBookingId || customerRating === 0) return;

    // Simulate sending rating to backend
    console.log(`Booking ${ratingBookingId} completed. Customer rated: ${customerRating} stars. Feedback: ${ratingFeedback}`);

    await handleBookingAction(ratingBookingId, 'complete', undefined, customerRating, ratingFeedback);
    setRatingModalVisible(false);
    setRatingBookingId(null);
    setCustomerRating(0);
    setRatingFeedback('');
    Alert.alert('Success', 'Booking marked as completed and customer rated!');
  };

  // New: Handle Rating Skip
  const handleRatingSkip = async () => {
    if (!ratingBookingId) return;

    console.log(`Booking ${ratingBookingId} completed. Rating skipped.`);
    await handleBookingAction(ratingBookingId, 'complete'); // Complete without rating
    setRatingModalVisible(false);
    setRatingBookingId(null);
    setCustomerRating(0);
    setRatingFeedback('');
    Alert.alert('Success', 'Booking marked as completed.');
  };

  const filteredBookings = bookings.filter((booking) => {
    if (filter === 'all') return true;
    return booking.status === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return '#10B981'; // Green
      case 'rejected':
        return '#EF4444'; // Red
      case 'completed':
        return '#6366F1'; // Indigo/Purple
      case 'pending':
      default:
        return '#F59E0B'; // Orange
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return CheckCircle;
      case 'rejected':
        return XCircle;
      case 'completed':
        return CheckCircle;
      case 'pending':
      default:
        return Clock;
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
            <Text style={styles.detailText}>
              {item.scheduledDate} at {item.scheduledTime}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <MapPin size={16} color="#6B7280" />
            <Text style={styles.detailText}>{item.address}</Text>
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
              <Text style={styles.actionButtonText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => openRejectModal(item.id)}
            >
              <XCircle size={16} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Reject</Text>
            </TouchableOpacity>
          </View>
        )}
        {item.status === 'accepted' && (
          <View style={styles.bookingActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.callButton]}
              onPress={() => Linking.openURL(`tel:${item.customerPhone}`)}
            >
              <Phone size={18} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Call Customer</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.completeButton]}
              // Changed: Open rating modal first
              onPress={() => openRatingModal(item.id)}
            >
              <CheckCircle size={18} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Completed</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Report User option - Visible for accepted and completed bookings for post-service issues */}
        {(item.status === 'accepted' || item.status === 'completed' || item.status === 'rejected') && (
          <View style={styles.reportUserRow}>
            <TouchableOpacity style={styles.reportUserBtn} onPress={() => openReportModal(item)}>
              <AlertTriangle size={16} color="#EF4444" style={{ marginRight: 4 }} />
              <Text style={styles.reportUserText}>Report User</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  if (user?.registeredServices.length === 0) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <View style={styles.emptyState}>
          <Calendar size={64} color="#9CA3AF" />
          <Text style={styles.emptyTitle}>No Services Registered Yet</Text>
          <Text style={styles.emptySubtitle}>
            Register for services to start receiving booking requests from customers.
          </Text>
          <TouchableOpacity style={styles.registerServiceButton} onPress={() => Alert.alert('Navigate', 'Implement navigation to service registration screen.')}>
            <Text style={styles.registerServiceButtonText}>Register a Service</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Bookings</Text>
        <Text style={styles.subtitle}>Manage your service requests and appointments.</Text>
      </View>

      <View style={styles.filterContainer}>
        {['all', 'pending', 'accepted', 'completed'].map((filterOption) => (
          <TouchableOpacity
            key={filterOption}
            style={[styles.filterButton, filter === filterOption && styles.activeFilter]}
            onPress={() => setFilter(filterOption as any)}
          >
            <Text style={[styles.filterText, filter === filterOption && styles.activeFilterText]}>
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
        contentContainerStyle={styles.bookingsListContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyBookings}>
            <Clock size={48} color="#D1D5DB" />
            <Text style={styles.emptyBookingsText}>No {filter === 'all' ? '' : filter} bookings found.</Text>
            <Text style={styles.emptyBookingsSubtext}>Check back later for new requests.</Text>
          </View>
        }
      />

      {/* Reject Reason Modal */}
      <Modal
        visible={rejectModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setRejectModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setRejectModalVisible(false)}>
          <Pressable style={styles.modalSheet} onPress={() => {}}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setRejectModalVisible(false)} style={styles.modalCloseButton}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Reject Booking</Text>
              <View style={{ width: 24 }} />
            </View>
            <Text style={styles.modalSubtitle}>Why are you rejecting this booking?</Text>
            <Text style={styles.modalHelper}>Please select a reason to help us improve our service.</Text>
            <ScrollView style={styles.modalReasonsList} showsVerticalScrollIndicator={false}>
              {cancelReasons.map((reason) => (
                <TouchableOpacity
                  key={reason}
                  style={[styles.reasonCard, rejectReason === reason && styles.reasonCardSelected]}
                  onPress={() => setRejectReason(reason)}
                  activeOpacity={0.85}
                >
                  <View style={styles.radioOuter}>
                    {(rejectReason === reason) && <View style={styles.radioInner} />}
                  </View>
                  <Text style={styles.reasonText}>{reason}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            {isOtherRejectReason && (
              <View style={styles.otherInputBox}>
                <Text style={styles.otherLabel}>Please specify your reason:</Text>
                <TextInput
                  style={styles.otherInput}
                  placeholder="Type your reason here..."
                  placeholderTextColor="#9CA3AF"
                  value={customOtherReason}
                  onChangeText={setCustomOtherReason}
                  multiline
                  numberOfLines={3}
                />
              </View>
            )}
            <View style={styles.modalActionsRow}>
              <TouchableOpacity style={styles.modalActionBtn} onPress={() => setRejectModalVisible(false)}>
                <Text style={styles.modalActionText}>Keep Booking</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalActionBtn, styles.modalActionDanger, !canSubmitReject && { opacity: 0.5 }]}
                onPress={handleRejectSubmit}
                disabled={!canSubmitReject}
              >
                <Text style={[styles.modalActionText, styles.modalActionDangerText]}>Confirm Rejection</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Report User Modal */}
      <Modal
        visible={reportModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setReportModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setReportModalVisible(false)}>
          <Pressable style={styles.modalSheet} onPress={() => {}}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setReportModalVisible(false)} style={styles.modalCloseButton}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Report User</Text>
              <View style={{ width: 24 }} />
            </View>
            <Text style={styles.modalSubtitle}>Why are you reporting this user?</Text>
            <Text style={styles.modalHelper}>Please select a reason to help us maintain a safe and reliable community.</Text>
            <ScrollView style={styles.modalReasonsList} showsVerticalScrollIndicator={false}>
              {reportReasons.map((reason) => (
                <TouchableOpacity
                  key={reason}
                  style={[styles.reasonCard, reportReason === reason && styles.reasonCardSelected]}
                  onPress={() => setReportReason(reason)}
                  activeOpacity={0.85}
                >
                  <View style={styles.radioOuter}>
                    {(reportReason === reason) && <View style={styles.radioInner} />}
                  </View>
                  <Text style={styles.reasonText}>{reason}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            {isOtherReportReason && (
              <View style={styles.otherInputBox}>
                <Text style={styles.otherLabel}>Please specify your reason:</Text>
                <TextInput
                  style={styles.otherInput}
                  placeholder="Type your reason here..."
                  placeholderTextColor="#9CA3AF"
                  value={customReportOtherReason}
                  onChangeText={setCustomReportOtherReason}
                  multiline
                  numberOfLines={3}
                />
              </View>
            )}
            <View style={styles.modalActionsRow}>
              <TouchableOpacity style={styles.modalActionBtn} onPress={() => setReportModalVisible(false)}>
                <Text style={styles.modalActionText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalActionBtn, styles.modalActionDanger, !canSubmitReport && { opacity: 0.5 }]}
                onPress={handleReportSubmit}
                disabled={!canSubmitReport}
              >
                <Text style={[styles.modalActionText, styles.modalActionDangerText]}>Submit Report</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* New: Customer Rating Modal */}
      <Modal
        visible={ratingModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setRatingModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setRatingModalVisible(false)}>
          <Pressable style={styles.modalSheet} onPress={() => {}}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setRatingModalVisible(false)} style={styles.modalCloseButton}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Rate Customer</Text>
              <View style={{ width: 24 }} />
            </View>
            <Text style={styles.modalSubtitle}>How was your experience with this customer?</Text>
            <Text style={styles.modalHelper}>Help us maintain a high-quality community by rating your experience.</Text>

            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((starNum) => (
                <TouchableOpacity key={starNum} onPress={() => setCustomerRating(starNum)}>
                  <Star
                    size={40} // Larger stars
                    color={starNum <= customerRating ? '#FFD700' : '#D1D5DB'} // Gold for filled, light gray for empty
                    fill={starNum <= customerRating ? '#FFD700' : 'none'} // Fill the star
                    style={styles.starIcon}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.otherLabel}>Additional Feedback (Optional):</Text>
            <TextInput
              style={styles.otherInput}
              placeholder="Share your thoughts on the customer's behavior, communication, etc."
              placeholderTextColor="#9CA3AF"
              value={ratingFeedback}
              onChangeText={setRatingFeedback}
              multiline
              numberOfLines={4}
            />

            <View style={styles.modalActionsRow}>
             
              <TouchableOpacity
                style={[styles.modalActionBtn, styles.modalActionPrimary, !canSubmitRating && { opacity: 0.5 }]}
                onPress={handleRatingSubmit}
                disabled={!canSubmitRating}
              >
                <Text style={[styles.modalActionText, styles.modalActionPrimaryText]}>Submit Rating</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC', // Lighter background for the entire screen
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF', // Header background white
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9', // Subtle border
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3, // Android shadow
  },
  title: {
    fontSize: 26, // Slightly smaller, more refined title
    fontFamily: 'Inter-Bold',
    color: '#1E293B', // Darker text for main titles
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: '#64748B', // Slightly darker gray for subtitles
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 16, // Added vertical padding
    gap: 10, // Increased gap for better spacing
    backgroundColor: '#FFFFFF', // Filter background white
    borderBottomLeftRadius: 16, // Rounded bottom corners
    borderBottomRightRadius: 16,
    marginBottom: 12, // Space from the list
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3, // Android shadow
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10, // Increased vertical padding
    borderRadius: 25, // More rounded, pill-shaped buttons
    backgroundColor: '#E2E8F0', // Lighter gray for inactive filters
    alignItems: 'center', // Center content horizontally
    justifyContent: 'center', // Center content vertically
  },
  activeFilter: {
    backgroundColor: '#3B82F6', // Primary blue for active filter
    shadowColor: '#3B82F6', // Subtle shadow for active filter
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  filterText: {
    fontSize: 13,
    fontFamily: 'Inter-SemiBold', // Stronger font for filter text
    color: '#64748B', // Darker gray for inactive text
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  bookingsList: {
    flex: 1,
    paddingHorizontal: 24,
    // No background here, let container handle it
  },
  bookingsListContent: {
    paddingBottom: 30, // Space at the bottom of the scrollable list
    paddingTop: 8, // Space at the top to separate from filters
  },
  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18, // Larger border radius for a softer look
    padding: 20,
    marginBottom: 18, // More space between cards
    borderWidth: 1,
    borderColor: '#E2E8F0', // Subtle border
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 }, // More pronounced shadow
    shadowOpacity: 0.08, // Slightly higher opacity
    shadowRadius: 8, // Larger radius for a softer shadow
    elevation: 5, // Android elevation
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
    fontSize: 17, // Larger customer name
    fontFamily: 'Inter-Bold', // Bolder font
    color: '#1E293B',
    marginBottom: 4, // More space
  },
  serviceName: {
    fontSize: 14,
    fontFamily: 'Inter-Medium', // Slightly bolder service name
    color: '#64748B',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    minWidth: 80, // Ensure consistent width for badges
    justifyContent: 'center',
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold', // Bolder status text
    marginLeft: 6,
  },
  bookingDetails: {
    marginBottom: 16, // More space
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9', // Divider for details section
    paddingTop: 16, // Padding above the divider
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10, // More space between details
  },
  detailText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#475569', // Darker gray for detail text
    marginLeft: 10, // More space from icon
    flex: 1,
  },
  description: {
    fontSize: 14.5, // Slightly larger description text
    fontFamily: 'Inter-Regular',
    color: '#475569',
    marginBottom: 12, // More space
    lineHeight: 22, // Better line height for readability
  },
  estimatedPrice: {
    fontSize: 17, // Larger price
    fontFamily: 'Inter-Bold', // Bolder price
    color: '#3B82F6', // Primary blue
    marginBottom: 16,
  },
  bookingActions: {
    flexDirection: 'row',
    gap: 10, // Consistent gap
    marginTop: 8, // Space from price
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Ensure content inside button is centered
    paddingVertical: 12, // Larger buttons
    borderRadius: 12, // Slightly more rounded
    gap: 8, // More space between icon and text
    shadowColor: '#000', // Subtle button shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  acceptButton: {
    backgroundColor: '#22C55E', // A vibrant green
  },
  rejectButton: {
    backgroundColor: '#EF4444', // Red for reject
  },
  callButton: {
    backgroundColor: '#3B82F6', // Primary blue for call
  },
  completeButton: {
    backgroundColor: '#6366F1', // Indigo for complete
  },
  actionButtonText: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  reportUserRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end', // Align to right
    marginTop: 12, // Space from actions
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9', // Divider
    paddingTop: 12, // Padding above divider
  },
  reportUserBtn: {
    flexDirection: 'row',
    alignItems: 'center', // Align items vertically in center
    borderWidth: 1,
    borderColor: '#EF4444', // Red border
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#FEF2F2', // Very light red background
  },
  reportUserText: {
    color: '#DC2626', // Darker red text
    fontSize: 13,
    fontFamily: 'Inter-SemiBold', // Bolder font
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    backgroundColor: '#FFFFFF', // Ensures white background for empty state
  },
  emptyTitle: {
    fontSize: 22,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center', // Center text horizontally
  },
  emptySubtitle: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    textAlign: 'center', // Center text horizontally
    lineHeight: 22,
    marginBottom: 24,
  },
  registerServiceButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
    alignItems: 'center', // Center button text
    justifyContent: 'center', // Center button text
  },
  registerServiceButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  emptyBookings: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center', // Center content horizontally
    paddingVertical: 60, // More vertical padding
    paddingHorizontal: 20,
  },
  emptyBookingsText: {
    fontSize: 17,
    fontFamily: 'Inter-SemiBold',
    color: '#94A3B8', // A softer gray
    marginTop: 16,
    textAlign: 'center', // Center text horizontally
  },
  emptyBookingsSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#CBD5E1', // Even lighter gray
    marginTop: 4,
    textAlign: 'center', // Center text horizontally
  },
  // Modal Styles (Unified and refined)
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)', // More opaque for better focus
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 28,
    paddingTop: 28,
    paddingBottom: 40,
    minHeight: 420,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  modalCloseButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  modalCloseText: {
    fontSize: 24,
    color: '#64748B',
    fontFamily: 'Inter-Medium',
  },
  modalTitle: {
    fontSize: 22,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
    flex: 1,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 17,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 8,
    marginTop: 8,
    textAlign: 'center',
  },
  modalHelper: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginBottom: 18,
    textAlign: 'center',
  },
  modalReasonsList: {
    maxHeight: 200,
    marginBottom: 16,
  },
  reasonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  reasonCardSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#DBEAFE',
  },
  radioOuter: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 18,
    backgroundColor: '#fff',
  },
  radioInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#3B82F6',
  },
  reasonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#1E293B',
    flex: 1,
  },
  otherInputBox: {
    marginBottom: 18,
  },
  otherLabel: {
    fontSize: 15,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
    marginBottom: 8,
  },
  otherInput: {
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 14,
    width: '100%',
    minHeight: 90,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1E293B',
    backgroundColor: '#F8FAFC',
    textAlignVertical: 'top',
  },
  modalActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 14,
    marginTop: 20,
  },
  modalActionBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
  },
  modalActionDanger: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#F87171',
  },
  modalActionText: {
    color: '#64748B',
    fontFamily: 'Inter-SemiBold',
    fontSize: 17,
  },
  modalActionDangerText: {
    color: '#DC2626',
    fontFamily: 'Inter-Bold',
  },
  modalActionPrimary: {
    backgroundColor: '#3B82F6',
    borderWidth: 1,
    borderColor: '#2563EB',
  },
  modalActionPrimaryText: {
    color: '#fff',
    fontFamily: 'Inter-Bold',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 22,
    gap: 10,
  },
  starIcon: {
    marginHorizontal: 3,
  },
  completedRatingContainer: {
    marginTop: 18,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 14,
  },
  completedRatingText: {
    fontSize: 15,
    fontFamily: 'Inter-Medium',
    color: '#475569',
    marginBottom: 10,
  },
  starsDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  completedFeedbackText: {
    fontSize: 14,
    fontFamily: 'Inter-Italic',
    color: '#64748B',
    marginTop: 10,
    marginLeft: 6,
  },
});