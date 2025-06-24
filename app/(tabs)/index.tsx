import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { SERVICE_CATEGORIES } from '@/constants/serviceCategories';
import { CircleCheck as CheckCircle, Plus } from 'lucide-react-native';

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
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Welcome Back!</Text>
          <Text style={styles.subtitle}>Choose services to register and grow your business</Text>
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
                <View style={styles.cardImageContainer}>
                  <Image 
                    source={{ uri: service.imageUrl }} 
                    style={styles.cardImage}
                    resizeMode="cover"
                  />
                  {isRegistered && (
                    <View style={styles.registeredBadge}>
                      <CheckCircle size={12} color="#FFFFFF" />
                    </View>
                  )}
                </View>
                
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
                        <Plus size={10} color="#3B82F6" />
                        <Text style={styles.priceText}>
                          {service.basePrice === 0 ? 'Free' : `₹${service.basePrice}/mo`}
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
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingBottom: 16,
  },
  greeting: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 24,
  },
  servicesGrid: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  serviceCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  registeredCard: {
    borderWidth: 2,
    borderColor: '#10B981',
  },
  cardImageContainer: {
    position: 'relative',
    height: 80,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  registeredBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#10B981',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    padding: 16,
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'space-between',
  },
  serviceIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  serviceName: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 6,
    lineHeight: 18,
  },
  serviceDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 16,
  },
  cardFooter: {
    alignItems: 'center',
  },
  statusBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  priceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF8FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priceText: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    color: '#3B82F6',
    marginLeft: 4,
  },
});