import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { SERVICE_CATEGORIES } from '@/constants/serviceCategories';
import { Plus } from 'lucide-react-native';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const handleServicePress = (serviceId: string) => {
    const isRegistered = user?.registeredServices.includes(serviceId);
    
    if (isRegistered) {
      router.push(`/service-registration/${serviceId}?mode=edit`);
    } else {
      router.push(`/service-registration/${serviceId}`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Welcome, Provider!</Text>
          <Text style={styles.subtitle}>Choose a service to register or manage</Text>
        </View>

        <View style={styles.servicesGrid}>
          {SERVICE_CATEGORIES.map((service) => {
            const isRegistered = user?.registeredServices.includes(service.id);
            
            return (
              <TouchableOpacity
                key={service.id}
                style={[
                  styles.serviceCard,
                  isRegistered && styles.registeredCard,
                ]}
                onPress={() => handleServicePress(service.id)}
              >
                <View style={styles.cardContent}>
                  <Text style={styles.serviceIcon}>{service.icon}</Text>
                  <Text style={styles.serviceName}>{service.name}</Text>
                  <Text style={styles.serviceDescription}>{service.description}</Text>
                  
                  <View style={styles.cardFooter}>
                    {isRegistered ? (
                      <View style={styles.statusBadge}>
                        <Text style={styles.statusText}>Registered</Text>
                      </View>
                    ) : (
                      <View style={styles.priceBadge}>
                        <Plus size={16} color="#3B82F6" />
                        <Text style={styles.priceText}>
                          {service.basePrice === 0 ? 'Free' : `₹${service.basePrice}/month`}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
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
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingBottom: 16,
  },
  greeting: {
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
  servicesGrid: {
    paddingHorizontal: 24,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  serviceCard: {
    width: '31%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  registeredCard: {
    borderColor: '#3B82F6',
    backgroundColor: '#F0F9FF',
  },
  cardContent: {
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'space-between',
  },
  serviceIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  serviceName: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 4,
    lineHeight: 14,
  },
  serviceDescription: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 12,
  },
  cardFooter: {
    alignItems: 'center',
  },
  statusBadge: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
  },
  priceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
  },
  priceText: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: '#3B82F6',
    marginLeft: 3,
  },
});