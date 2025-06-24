import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, CreditCard, Smartphone, CheckCircle, X } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';

export default function PaymentScreen() {
  const router = useRouter();
  const { serviceId, serviceName, amount } = useLocalSearchParams();
  const { user, updateUser } = useAuth();
  const [selectedMethod, setSelectedMethod] = useState<'card' | 'upi' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const handlePaymentMethodSelect = (method: 'card' | 'upi') => {
    setSelectedMethod(method);
    setShowPaymentModal(true);
  };

  const handlePayment = async () => {
    if (!selectedMethod) {
      Alert.alert('Error', 'Please select a payment method');
      return;
    }

    setIsProcessing(true);

    // Mock payment processing
    setTimeout(async () => {
      setIsProcessing(false);
      setShowPaymentModal(false);
      
      // Add service to user's registered services
      await updateUser({
        registeredServices: [...(user?.registeredServices || []), serviceId as string]
      });

      Alert.alert(
        'Payment Successful!',
        'Your registration is now complete. You can start receiving service requests.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(tabs)')
          }
        ]
      );
    }, 3000);
  };

  const PaymentModal = () => (
    <Modal
      visible={showPaymentModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowPaymentModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {selectedMethod === 'card' ? 'Card Payment' : 'UPI Payment'}
            </Text>
            <TouchableOpacity 
              onPress={() => setShowPaymentModal(false)}
              style={styles.closeButton}
            >
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.paymentDetails}>
            <Text style={styles.paymentAmount}>₹{amount}</Text>
            <Text style={styles.paymentDescription}>
              {selectedMethod === 'card' 
                ? 'Redirecting to secure card payment gateway...' 
                : 'Opening UPI app for payment...'}
            </Text>
          </View>

          <TouchableOpacity 
            style={[styles.confirmButton, isProcessing && styles.disabledButton]}
            onPress={handlePayment}
            disabled={isProcessing}
          >
            <Text style={styles.confirmButtonText}>
              {isProcessing ? 'Processing Payment...' : 'Confirm Payment'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => setShowPaymentModal(false)}
            disabled={isProcessing}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.serviceInfo}>
          <Text style={styles.serviceTitle}>{serviceName}</Text>
          <Text style={styles.servicePrice}>₹{amount}/month</Text>
          <Text style={styles.serviceDescription}>
            Monthly subscription to receive service requests and manage your profile
          </Text>
        </View>

        <View style={styles.paymentMethods}>
          <Text style={styles.sectionTitle}>Select Payment Method</Text>
          
          <TouchableOpacity 
            style={[
              styles.paymentMethod,
              selectedMethod === 'card' && styles.selectedMethod
            ]}
            onPress={() => handlePaymentMethodSelect('card')}
          >
            <CreditCard size={24} color="#3B82F6" />
            <Text style={styles.methodText}>Credit/Debit Card</Text>
            {selectedMethod === 'card' && <CheckCircle size={20} color="#3B82F6" />}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.paymentMethod,
              selectedMethod === 'upi' && styles.selectedMethod
            ]}
            onPress={() => handlePaymentMethodSelect('upi')}
          >
            <Smartphone size={24} color="#3B82F6" />
            <Text style={styles.methodText}>UPI Payment</Text>
            {selectedMethod === 'upi' && <CheckCircle size={20} color="#3B82F6" />}
          </TouchableOpacity>
        </View>

        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Service Registration</Text>
            <Text style={styles.summaryValue}>₹{amount}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Processing Fee</Text>
            <Text style={styles.summaryValue}>₹0</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>₹{amount}</Text>
          </View>
        </View>

        <Text style={styles.securityNote}>
          🔒 Your payment information is secure and encrypted
        </Text>
      </View>

      <PaymentModal />
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
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginLeft: 16,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  serviceInfo: {
    backgroundColor: '#F0F9FF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 32,
  },
  serviceTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 8,
  },
  servicePrice: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#3B82F6',
    marginBottom: 8,
  },
  serviceDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 20,
  },
  paymentMethods: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 16,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    marginBottom: 12,
  },
  selectedMethod: {
    borderColor: '#3B82F6',
    backgroundColor: '#F0F9FF',
  },
  methodText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    marginLeft: 12,
    flex: 1,
  },
  summary: {
    backgroundColor: '#F9FAFB',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#374151',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
    marginTop: 8,
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  totalValue: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#3B82F6',
  },
  securityNote: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
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
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  closeButton: {
    padding: 4,
  },
  paymentDetails: {
    alignItems: 'center',
    marginBottom: 32,
  },
  paymentAmount: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#3B82F6',
    marginBottom: 8,
  },
  paymentDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  confirmButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  confirmButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
});