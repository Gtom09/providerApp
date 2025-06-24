import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { SERVICE_CATEGORIES } from '@/constants/serviceCategories';
import { CircleCheck as CheckCircle } from 'lucide-react-native';

const CARD_SIZE = (Dimensions.get('window').width - 12 * 2 - 12 * 2) / 3;
const CARD_HEIGHT = CARD_SIZE * 1.45;

const ServiceCard = ({ item, isRegistered, onPress }: any) => (
  <TouchableOpacity
    activeOpacity={0.85}
    style={styles.gridCard}
    onPress={onPress}
  >
    <Image source={{ uri: item.imageUrl }} style={styles.gridCardImage} resizeMode="cover" />
    <View style={styles.gridCardOverlay}>
      <Text style={styles.gridCardText} numberOfLines={1} ellipsizeMode="tail">
        {item.name}
      </Text>
      {isRegistered && (
        <CheckCircle size={16} color="#10B981" style={{ marginTop: 4 }} />
      )}
    </View>
  </TouchableOpacity>
);

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
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome Back!</Text>
        <Text style={styles.subtitle}>Choose services to register and grow your business</Text>
      </View>

      <FlatList
        data={SERVICE_CATEGORIES}
        keyExtractor={(item) => item.id}
        numColumns={3}
        scrollEnabled={false} // ✅ non-scrollable grid
        contentContainerStyle={{
          paddingHorizontal: 12,
          paddingTop: 12,
          paddingBottom: 16, // ✅ fixed bottom padding so tab bar is positioned correctly
        }}
        columnWrapperStyle={{
          justifyContent: 'space-between',
          marginBottom: 16,
        }}
        renderItem={({ item }) => (
          <ServiceCard
            item={item}
            isRegistered={user?.registeredServices.includes(item.id)}
            onPress={() => handleServicePress(item.id)}
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
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
  gridCard: {
    width: CARD_SIZE,
    height: CARD_HEIGHT,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 2,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
    }),
  },
  gridCardImage: {
    width: '100%',
    height: '100%',
  },
  gridCardOverlay: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 6,
    alignItems: 'center',
  },
  gridCardText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
});
