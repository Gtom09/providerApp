import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
  Platform,
  TextInput,
  Alert,
  Modal,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MapPin, Search, CheckCircle } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import { SERVICE_CATEGORIES } from '@/constants/serviceCategories';
import * as Location from 'expo-location';

const { width } = Dimensions.get('window');
const CARD_SIZE = (width - 48) / 3;
const CARD_HEIGHT = CARD_SIZE * 1.05;

const ServiceCard = ({ item, onPress, isRegistered }: any) => (
  <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
    <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
    {isRegistered && (
      <View style={styles.tickIconBox}>
        <CheckCircle size={22} color="#10B981" />
      </View>
    )}
    <View style={styles.overlay}>
      <Text style={styles.cardText} numberOfLines={1}>
        {item.name}
      </Text>
    </View>
  </TouchableOpacity>
);

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('147, 12th cross, Rachenahalli, Yelahanka, Beng...');
  const [modalVisible, setModalVisible] = useState(false);
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [customAddress, setCustomAddress] = useState('');
  const [savedLocations, setSavedLocations] = useState([
    { label: 'Home', address: '147, 12th cross, Rachenahalli, Yelahanka, Beng...', type: 'home' },
    { label: 'Office', address: 'Tech Park, Whitefield, Bengaluru', type: 'office' },
    { label: 'Current Location', address: 'Using device location', type: 'current' },
  ]);
  const [selectedLocation, setSelectedLocation] = useState('current');

  const handleServicePress = (serviceId: string) => {
    const isRegistered = user?.registeredServices.includes(serviceId);
    router.push(`/service-registration/${serviceId}${isRegistered ? '?mode=edit' : ''}`);
  };

  const handleLocationPinPress = () => {
    setModalVisible(true);
  };

  const handleUseCurrentLocation = async () => {
    setModalVisible(false);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to use this feature.');
        return;
      }
      let loc = await Location.getCurrentPositionAsync({});
      let geocode = await Location.reverseGeocodeAsync(loc.coords);
      if (geocode && geocode.length > 0) {
        const addr = `${geocode[0].name || ''} ${geocode[0].street || ''}, ${geocode[0].city || ''}, ${geocode[0].region || ''}`;
        setLocation(addr);
        setSelectedLocation('current');
        setSavedLocations((prev) => prev.map(l => l.type === 'current' ? { ...l, address: addr } : l));
      } else {
        setLocation('Current Location');
        setSelectedLocation('current');
      }
    } catch (e) {
      Alert.alert('Error', 'Could not fetch current location.');
    }
  };

  const handleSaveAddress = () => {
    setModalVisible(false);
    setAddressModalVisible(true);
  };

  const handleAddressSubmit = () => {
    if (customAddress.trim()) {
      setSavedLocations((prev) => [
        ...prev,
        { label: `Address ${prev.length}`, address: customAddress, type: `custom${prev.length}` },
      ]);
      setLocation(customAddress);
      setSelectedLocation(`custom${savedLocations.length}`);
      setCustomAddress('');
      setAddressModalVisible(false);
    } else {
      Alert.alert('Invalid Address', 'Please enter a valid address.');
    }
  };

  const handleSelectLocation = (loc: any) => {
    setSelectedLocation(loc.type);
    setLocation(loc.address);
    setModalVisible(false);
  };

  // Dummy earnings data
  const earnings = {
    thisMonth: '₹12,400',
    today: '₹1,200',
    pending: '0',
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Home</Text>
          <View style={styles.locationRow}>
            <Text style={styles.locationText} numberOfLines={1}>{location}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.locationButton} onPress={handleLocationPinPress}>
          <MapPin size={20} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchBar}>
        <Search size={18} color="#9CA3AF" style={{ marginLeft: 12 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for 'Interior Designers'"
          placeholderTextColor="#9CA3AF"
          value={search}
          onChangeText={setSearch}
        />
      </View>
      {/* Spacer for consistent gap */}
      <View style={{ height: 14 }} />
      {/* Grid */}
      <FlatList
        data={SERVICE_CATEGORIES}
        keyExtractor={(item) => item.id}
        numColumns={3}
        scrollEnabled={false}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 16 }}
        renderItem={({ item }) => (
          <ServiceCard
            item={item}
            onPress={() => handleServicePress(item.id)}
            isRegistered={user?.registeredServices.includes(item.id)}
          />
        )}
      />

      {/* Earnings Overview */}
      <Text style={styles.sectionTitle}>Earnings Overview</Text>
      <View style={styles.earningsCard}>
        <View style={styles.earningBox}>
          <Text style={styles.earningAmount}>{earnings.thisMonth}</Text>
          <Text style={styles.earningLabel}>This Month</Text>
        </View>
        <View style={styles.earningBox}>
          <Text style={styles.earningAmount}>{earnings.today}</Text>
          <Text style={styles.earningLabel}>Today</Text>
        </View>
        <View style={styles.earningBox}>
          <Text style={styles.earningAmount}>{earnings.pending}</Text>
          <Text style={styles.earningLabel}>Pending</Text>
        </View>
      </View>
      {/* <TouchableOpacity style={styles.earningCTA}>
        <Text style={styles.earningCTAText}>View Full Earnings</Text>
      </TouchableOpacity> */}

      {/* Location Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.bottomSheetOverlay} onPress={() => setModalVisible(false)}>
          <Pressable style={styles.bottomSheet} onPress={() => {}}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Select Location</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.sheetClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.currentLocationBtn} onPress={handleUseCurrentLocation}>
              <MapPin size={18} color="#3B82F6" style={{ marginRight: 8 }} />
              <Text style={styles.currentLocationText}>Use Current Location</Text>
            </TouchableOpacity>
            <View style={styles.savedLocationsHeader}>
              <Text style={styles.savedLocationsTitle}>Saved Locations</Text>
              <TouchableOpacity onPress={handleSaveAddress}>
                <Text style={styles.addLocationBtn}>＋</Text>
              </TouchableOpacity>
            </View>
            {savedLocations.map((loc, idx) => (
              <TouchableOpacity
                key={loc.type}
                style={[styles.locationCard, selectedLocation === loc.type && styles.locationCardSelected]}
                onPress={() => handleSelectLocation(loc)}
                activeOpacity={0.8}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.locationCardLabel}>{loc.label}</Text>
                  {selectedLocation === loc.type && <View style={styles.selectedDot} />}
                </View>
                <Text style={styles.locationCardAddress} numberOfLines={1}>{loc.address}</Text>
              </TouchableOpacity>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
      {/* Address Input Modal */}
      <Modal
        visible={addressModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAddressModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setAddressModalVisible(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter Address</Text>
            <TextInput
              style={styles.addressInput}
              placeholder="Enter your address"
              value={customAddress}
              onChangeText={setCustomAddress}
              autoFocus
            />
            <TouchableOpacity style={styles.modalButton} onPress={handleAddressSubmit}>
              <Text style={styles.modalButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1E293B',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  locationText: {
    fontSize: 13,
    color: '#6B7280',
    maxWidth: '85%',
  },
  locationButton: {
    backgroundColor: '#E0E7FF',
    padding: 10,
    borderRadius: 30,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 28,
    marginHorizontal: 16,
    height: 46,
    marginTop: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    marginLeft: 8,
    marginRight: 12,
  },
  grid: {
    paddingHorizontal: 16,
  },
  card: {
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
        shadowOpacity: 0.07,
        shadowRadius: 4,
      },
    }),
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
    width: '100%',
    paddingVertical: 6,
    alignItems: 'center',
  },
  cardText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 16,
    marginTop: 12,
    marginBottom: 8,
  },
  earningsCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
  },
  earningBox: {
    alignItems: 'center',
  },
  earningAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10B981',
  },
  earningLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  earningCTA: {
    marginTop: 8,
    alignItems: 'center',
  },
  earningCTAText: {
    color: '#3B82F6',
    fontWeight: '600',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: 280,
    alignItems: 'center',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 18,
    color: '#1E293B',
  },
  modalButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
    marginVertical: 6,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  addressInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 10,
    width: '100%',
    marginBottom: 14,
    fontSize: 15,
    color: '#1E293B',
  },
  bottomSheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.18)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 32,
    minHeight: 340,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  sheetClose: {
    fontSize: 22,
    color: '#6B7280',
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  currentLocationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 18,
  },
  currentLocationText: {
    color: '#3B82F6',
    fontWeight: '600',
    fontSize: 15,
  },
  savedLocationsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  savedLocationsTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
  },
  addLocationBtn: {
    fontSize: 22,
    color: '#3B82F6',
    fontWeight: '700',
    paddingHorizontal: 4,
  },
  locationCard: {
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  locationCardSelected: {
    backgroundColor: '#E0E7FF',
  },
  locationCardLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    marginRight: 8,
  },
  selectedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
  },
  locationCardAddress: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  tickIconBox: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 2,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 2,
    elevation: 2,
  },
});
