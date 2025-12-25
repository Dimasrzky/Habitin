// app/screens/labTerdekat/index.tsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  FlatList,
  Image,
  Linking,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

// Types
interface LabLocation {
  id: string;
  name: string;
  address: string;
  distance: number; // in km
  rating: number;
  reviewCount: number;
  phone: string;
  openHours: string;
  services: string[];
  imageUrl?: string;
  latitude: number;
  longitude: number;
  isOpen: boolean;
  priceRange: 'low' | 'medium' | 'high';
}

type FilterType = 'all' | 'nearest' | 'highest-rated' | 'open-now';
type SortType = 'distance' | 'rating' | 'name';

// Mock data - replace with actual API/service later
const MOCK_LABS: LabLocation[] = [
  {
    id: '1',
    name: 'Laboratorium Klinik Prodia',
    address: 'Jl. Kramat Raya No. 77, Jakarta Pusat',
    distance: 1.2,
    rating: 4.8,
    reviewCount: 234,
    phone: '021-31904545',
    openHours: '07:00 - 20:00',
    services: ['Cek Darah', 'Cek Gula', 'Cek Kolesterol', 'HbA1c'],
    imageUrl: 'https://images.unsplash.com/photo-1581056771107-24ca5f033842?w=400',
    latitude: -6.2088,
    longitude: 106.8456,
    isOpen: true,
    priceRange: 'medium',
  },
  {
    id: '2',
    name: 'Laboratorium Pramita',
    address: 'Jl. Pramuka No. 88, Jakarta Timur',
    distance: 2.5,
    rating: 4.6,
    reviewCount: 189,
    phone: '021-85906888',
    openHours: '06:00 - 21:00',
    services: ['Cek Darah', 'Urine', 'Radiologi', 'CT Scan'],
    imageUrl: 'https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=400',
    latitude: -6.1945,
    longitude: 106.8779,
    isOpen: true,
    priceRange: 'high',
  },
  {
    id: '3',
    name: 'Lab Klinik Kimia Farma',
    address: 'Jl. Matraman Raya No. 156, Jakarta Timur',
    distance: 3.1,
    rating: 4.5,
    reviewCount: 156,
    phone: '021-85903800',
    openHours: '08:00 - 18:00',
    services: ['Cek Darah', 'Cek Kolesterol', 'HbA1c'],
    imageUrl: 'https://images.unsplash.com/photo-1638202993928-7267aad84c31?w=400',
    latitude: -6.1989,
    longitude: 106.8567,
    isOpen: false,
    priceRange: 'low',
  },
  {
    id: '4',
    name: 'RS Siloam Hospitals Lab',
    address: 'Jl. Garnisun Dalam No. 2-3, Jakarta Pusat',
    distance: 4.0,
    rating: 4.9,
    reviewCount: 312,
    phone: '021-29961888',
    openHours: '24 Jam',
    services: ['Cek Darah Lengkap', 'CT Scan', 'MRI', 'Radiologi', 'HbA1c'],
    imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400',
    latitude: -6.1812,
    longitude: 106.8345,
    isOpen: true,
    priceRange: 'high',
  },
  {
    id: '5',
    name: 'Laboratorium Parahita',
    address: 'Jl. Cikini Raya No. 23, Jakarta Pusat',
    distance: 1.8,
    rating: 4.7,
    reviewCount: 198,
    phone: '021-31930383',
    openHours: '07:00 - 19:00',
    services: ['Cek Darah', 'Cek Gula', 'Kolesterol', 'Trigliserida'],
    imageUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=400',
    latitude: -6.1923,
    longitude: 106.8412,
    isOpen: true,
    priceRange: 'medium',
  },
];

export default function LabTerdekatScreen() {
  const router = useRouter();
  const [labs] = useState<LabLocation[]>(MOCK_LABS);
  const [filteredLabs, setFilteredLabs] = useState<LabLocation[]>(MOCK_LABS);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('distance');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Fetch labs data here
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

  const applyFilter = (filter: FilterType) => {
    setSelectedFilter(filter);
    let filtered = [...labs];

    switch (filter) {
      case 'nearest':
        filtered = filtered.filter(lab => lab.distance <= 2);
        break;
      case 'highest-rated':
        filtered = filtered.filter(lab => lab.rating >= 4.7);
        break;
      case 'open-now':
        filtered = filtered.filter(lab => lab.isOpen);
        break;
      default:
        break;
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'distance':
          return a.distance - b.distance;
        case 'rating':
          return b.rating - a.rating;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    setFilteredLabs(filtered);
  };

  const handleSort = (sort: SortType) => {
    setSortBy(sort);
    const sorted = [...filteredLabs].sort((a, b) => {
      switch (sort) {
        case 'distance':
          return a.distance - b.distance;
        case 'rating':
          return b.rating - a.rating;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
    setFilteredLabs(sorted);
  };

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleDirections = (lab: LabLocation) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lab.latitude},${lab.longitude}`;
    Linking.openURL(url);
  };

  const getPriceRangeText = (priceRange: LabLocation['priceRange']) => {
    switch (priceRange) {
      case 'low':
        return 'Rp';
      case 'medium':
        return 'Rp Rp';
      case 'high':
        return 'Rp Rp Rp';
    }
  };

  const renderHeader = () => (
    <View style={styles.headerContent}>
      {/* Stats Card */}
      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <Ionicons name="location" size={24} color="#ABE7B2" />
          <View style={styles.statTextContainer}>
            <Text style={styles.statValue}>{filteredLabs.length}</Text>
            <Text style={styles.statLabel}>Lab Ditemukan</Text>
          </View>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Ionicons name="navigate" size={24} color="#3B82F6" />
          <View style={styles.statTextContainer}>
            <Text style={styles.statValue}>
              {filteredLabs.length > 0 ? `${filteredLabs[0].distance} km` : '-'}
            </Text>
            <Text style={styles.statLabel}>Terdekat</Text>
          </View>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Ionicons name="time" size={24} color="#10B981" />
          <View style={styles.statTextContainer}>
            <Text style={styles.statValue}>
              {labs.filter(l => l.isOpen).length}
            </Text>
            <Text style={styles.statLabel}>Buka Sekarang</Text>
          </View>
        </View>
      </View>

      {/* Filter Buttons */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        <Pressable
          style={({ pressed }) => [
            styles.filterButton,
            selectedFilter === 'all' && styles.filterButtonActive,
            { opacity: pressed ? 0.7 : 1 },
          ]}
          onPress={() => applyFilter('all')}
        >
          <Ionicons
            name="list-outline"
            size={16}
            color={selectedFilter === 'all' ? '#1F2937' : '#6B7280'}
          />
          <Text
            style={[
              styles.filterButtonText,
              selectedFilter === 'all' && styles.filterButtonTextActive,
            ]}
          >
            Semua
          </Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.filterButton,
            selectedFilter === 'nearest' && styles.filterButtonActive,
            { opacity: pressed ? 0.7 : 1 },
          ]}
          onPress={() => applyFilter('nearest')}
        >
          <Ionicons
            name="navigate-outline"
            size={16}
            color={selectedFilter === 'nearest' ? '#1F2937' : '#6B7280'}
          />
          <Text
            style={[
              styles.filterButtonText,
              selectedFilter === 'nearest' && styles.filterButtonTextActive,
            ]}
          >
            Terdekat
          </Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.filterButton,
            selectedFilter === 'highest-rated' && styles.filterButtonActive,
            { opacity: pressed ? 0.7 : 1 },
          ]}
          onPress={() => applyFilter('highest-rated')}
        >
          <Ionicons
            name="star-outline"
            size={16}
            color={selectedFilter === 'highest-rated' ? '#1F2937' : '#6B7280'}
          />
          <Text
            style={[
              styles.filterButtonText,
              selectedFilter === 'highest-rated' && styles.filterButtonTextActive,
            ]}
          >
            Rating Tinggi
          </Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.filterButton,
            selectedFilter === 'open-now' && styles.filterButtonActive,
            { opacity: pressed ? 0.7 : 1 },
          ]}
          onPress={() => applyFilter('open-now')}
        >
          <Ionicons
            name="time-outline"
            size={16}
            color={selectedFilter === 'open-now' ? '#1F2937' : '#6B7280'}
          />
          <Text
            style={[
              styles.filterButtonText,
              selectedFilter === 'open-now' && styles.filterButtonTextActive,
            ]}
          >
            Buka Sekarang
          </Text>
        </Pressable>
      </ScrollView>

      {/* Sort Options */}
      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Urutkan:</Text>
        <View style={styles.sortButtons}>
          <Pressable
            style={({ pressed }) => [
              styles.sortButton,
              sortBy === 'distance' && styles.sortButtonActive,
              { opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={() => handleSort('distance')}
          >
            <Text
              style={[
                styles.sortButtonText,
                sortBy === 'distance' && styles.sortButtonTextActive,
              ]}
            >
              Jarak
            </Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.sortButton,
              sortBy === 'rating' && styles.sortButtonActive,
              { opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={() => handleSort('rating')}
          >
            <Text
              style={[
                styles.sortButtonText,
                sortBy === 'rating' && styles.sortButtonTextActive,
              ]}
            >
              Rating
            </Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.sortButton,
              sortBy === 'name' && styles.sortButtonActive,
              { opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={() => handleSort('name')}
          >
            <Text
              style={[
                styles.sortButtonText,
                sortBy === 'name' && styles.sortButtonTextActive,
              ]}
            >
              Nama
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );

  const renderLabCard = ({ item }: { item: LabLocation }) => (
    <View style={styles.labCard}>
      {/* Image & Status */}
      <View style={styles.labImageContainer}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.labImage} />
        ) : (
          <View style={[styles.labImage, styles.placeholderImage]}>
            <Ionicons name="business-outline" size={32} color="#9CA3AF" />
          </View>
        )}
        <View style={styles.imageBadges}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: item.isOpen ? '#10B981' : '#EF4444' },
            ]}
          >
            <Text style={styles.statusBadgeText}>
              {item.isOpen ? 'Buka' : 'Tutup'}
            </Text>
          </View>
          <View style={styles.distanceBadge}>
            <Ionicons name="navigate" size={12} color="#FFFFFF" />
            <Text style={styles.distanceBadgeText}>{item.distance} km</Text>
          </View>
        </View>
      </View>

      {/* Content */}
      <View style={styles.labContent}>
        {/* Name & Rating */}
        <View style={styles.labHeader}>
          <Text style={styles.labName} numberOfLines={1}>
            {item.name}
          </Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#F59E0B" />
            <Text style={styles.ratingText}>{item.rating}</Text>
            <Text style={styles.reviewCount}>({item.reviewCount})</Text>
          </View>
        </View>

        {/* Address */}
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={14} color="#6B7280" />
          <Text style={styles.infoText} numberOfLines={2}>
            {item.address}
          </Text>
        </View>

        {/* Open Hours & Price */}
        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Ionicons name="time-outline" size={14} color="#6B7280" />
            <Text style={styles.detailText}>{item.openHours}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="cash-outline" size={14} color="#6B7280" />
            <Text style={styles.detailText}>{getPriceRangeText(item.priceRange)}</Text>
          </View>
        </View>

        {/* Services */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.servicesContainer}
        >
          {item.services.slice(0, 3).map((service, index) => (
            <View key={index} style={styles.serviceChip}>
              <Text style={styles.serviceText}>{service}</Text>
            </View>
          ))}
          {item.services.length > 3 && (
            <View style={styles.serviceChip}>
              <Text style={styles.serviceText}>+{item.services.length - 3}</Text>
            </View>
          )}
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              styles.callButton,
              { opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={() => handleCall(item.phone)}
          >
            <Ionicons name="call" size={18} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Telepon</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              styles.directionsButton,
              { opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={() => handleDirections(item)}
          >
            <Ionicons name="navigate" size={18} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Petunjuk Arah</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="location-outline" size={64} color="#D1D5DB" />
      </View>
      <Text style={styles.emptyTitle}>Tidak Ada Lab Ditemukan</Text>
      <Text style={styles.emptySubtitle}>
        Coba ubah filter atau cari di area lain
      </Text>
      <Pressable
        style={({ pressed }) => [
          styles.emptyButton,
          { opacity: pressed ? 0.7 : 1 },
        ]}
        onPress={() => applyFilter('all')}
      >
        <Text style={styles.emptyButtonText}>Tampilkan Semua Lab</Text>
      </Pressable>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.backButton,
            { opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </Pressable>
        <Text style={styles.headerTitle}>Lab Terdekat</Text>
        <Pressable
          onPress={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
          style={({ pressed }) => [
            styles.viewToggle,
            { opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Ionicons
            name={viewMode === 'list' ? 'map-outline' : 'list-outline'}
            size={24}
            color="#ABE7B2"
          />
        </Pressable>
      </View>

      {/* Content */}
      {filteredLabs.length === 0 ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#ABE7B2']}
            />
          }
        >
          {renderHeader()}
          {renderEmptyState()}
        </ScrollView>
      ) : (
        <FlatList
          data={filteredLabs}
          renderItem={renderLabCard}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#ABE7B2']}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 30,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  viewToggle: {
    padding: 4,
  },
  scrollContent: {
    flexGrow: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerContent: {
    marginBottom: 16,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statTextContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 8,
  },
  filterContainer: {
    marginBottom: 12,
  },
  filterContent: {
    paddingRight: 16,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterButtonActive: {
    backgroundColor: '#ABE7B2',
    borderColor: '#ABE7B2',
  },
  filterButtonText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
    marginLeft: 4,
  },
  filterButtonTextActive: {
    color: '#1F2937',
    fontWeight: '600',
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  sortLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  sortButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  sortButtonActive: {
    backgroundColor: '#ABE7B2',
  },
  sortButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  sortButtonTextActive: {
    color: '#1F2937',
    fontWeight: '600',
  },
  labCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  labImageContainer: {
    position: 'relative',
  },
  labImage: {
    width: '100%',
    height: 160,
    backgroundColor: '#F3F4F6',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageBadges: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(31, 41, 55, 0.7)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  distanceBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  labContent: {
    padding: 16,
  },
  labHeader: {
    marginBottom: 8,
  },
  labName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 6,
    flex: 1,
    lineHeight: 18,
  },
  detailsRow: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  servicesContainer: {
    marginBottom: 12,
  },
  serviceChip: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  serviceText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#15803D',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  callButton: {
    backgroundColor: '#10B981',
  },
  directionsButton: {
    backgroundColor: '#3B82F6',
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#ABE7B2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
});
