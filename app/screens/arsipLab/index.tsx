// app/screens/arsipLab/index.tsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    Pressable,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { auth } from '../../../src/config/firebase.config';
import { getLabResults } from '../../../src/services/health/healthAPI';
import { LabResult } from '../../../src/types/health.types';

type RiskLevel = 'rendah' | 'sedang' | 'tinggi' | 'all';

interface FilterStats {
  total: number;
  rendah: number;
  sedang: number;
  tinggi: number;
}

export default function ArsipLabScreen() {
  const router = useRouter();
  const [labResults, setLabResults] = useState<LabResult[]>([]);
  const [filteredResults, setFilteredResults] = useState<LabResult[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<RiskLevel>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<FilterStats>({
    total: 0,
    rendah: 0,
    sedang: 0,
    tinggi: 0,
  });

  const fetchLabResults = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setLoading(false);
        return;
      }

      const results = await getLabResults(currentUser.uid);
      setLabResults(results);

      // Calculate stats
      const newStats: FilterStats = {
        total: results.length,
        rendah: results.filter((r) => r.risk_level === 'rendah').length,
        sedang: results.filter((r) => r.risk_level === 'sedang').length,
        tinggi: results.filter((r) => r.risk_level === 'tinggi').length,
      };
      setStats(newStats);

      // Apply initial filter
      applyFilter('all', results);
    } catch (error) {
      console.error('Error fetching lab results:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLabResults();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchLabResults();
    setRefreshing(false);
  }, []);

  const applyFilter = (filter: RiskLevel, results: LabResult[] = labResults) => {
    setSelectedFilter(filter);
    if (filter === 'all') {
      setFilteredResults(results);
    } else {
      setFilteredResults(results.filter((r) => r.risk_level === filter));
    }
  };

  const handleViewDetail = (lab: LabResult) => {
    // Navigate to detail screen - you can implement this later
    console.log('View detail for lab:', lab.id);
    // router.push(`/screens/arsipLab/detail?id=${lab.id}`);
  };

  const handleAddLab = () => {
    router.push('/screens/cekKesehatan/uploadLab');
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'rendah':
        return '#10B981';
      case 'sedang':
        return '#F59E0B';
      case 'tinggi':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getRiskLabel = (riskLevel: string) => {
    switch (riskLevel) {
      case 'rendah':
        return 'Rendah';
      case 'sedang':
        return 'Sedang';
      case 'tinggi':
        return 'Tinggi';
      default:
        return 'Unknown';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderLabCard = ({ item }: { item: LabResult }) => (
    <Pressable
      style={({ pressed }) => [
        styles.labCard,
        { opacity: pressed ? 0.7 : 1 },
      ]}
      onPress={() => handleViewDetail(item)}
    >
      {/* Image and Risk Badge */}
      <View style={styles.cardImageContainer}>
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} style={styles.labImage} />
        ) : (
          <View style={[styles.labImage, styles.placeholderImage]}>
            <Ionicons name="document-text-outline" size={32} color="#9CA3AF" />
          </View>
        )}
        <View
          style={[
            styles.riskBadge,
            { backgroundColor: getRiskColor(item.risk_level) },
          ]}
        >
          <Text style={styles.riskBadgeText}>
            {getRiskLabel(item.risk_level)}
          </Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.cardContent}>
        {/* Date & Time */}
        <View style={styles.dateTimeRow}>
          <View style={styles.dateTimeItem}>
            <Ionicons name="calendar-outline" size={14} color="#6B7280" />
            <Text style={styles.dateTimeText}>{formatDate(item.created_at)}</Text>
          </View>
          <View style={styles.dateTimeItem}>
            <Ionicons name="time-outline" size={14} color="#6B7280" />
            <Text style={styles.dateTimeText}>{formatTime(item.created_at)}</Text>
          </View>
        </View>

        {/* Health Metrics */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Glukosa</Text>
            <Text style={styles.metricValue}>{item.glucose_level} mg/dL</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Kolesterol</Text>
            <Text style={styles.metricValue}>{item.cholesterol_total} mg/dL</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>HbA1c</Text>
            <Text style={styles.metricValue}>{item.hba1c}%</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Trigliserida</Text>
            <Text style={styles.metricValue}>{item.triglycerides} mg/dL</Text>
          </View>
        </View>

        {/* View Detail Arrow */}
        <View style={styles.viewDetailRow}>
          <Text style={styles.viewDetailText}>Lihat Detail</Text>
          <Ionicons name="chevron-forward" size={16} color="#ABE7B2" />
        </View>
      </View>
    </Pressable>
  );

  const renderHeader = () => (
    <>
      {/* Statistics Summary */}
      <View style={styles.statsCard}>
        <View style={styles.statsHeader}>
          <Ionicons name="bar-chart-outline" size={24} color="#ABE7B2" />
          <Text style={styles.statsTitle}>Ringkasan Hasil Lab</Text>
        </View>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#10B981' }]}>
              {stats.rendah}
            </Text>
            <Text style={styles.statLabel}>Rendah</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#F59E0B' }]}>
              {stats.sedang}
            </Text>
            <Text style={styles.statLabel}>Sedang</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#EF4444' }]}>
              {stats.tinggi}
            </Text>
            <Text style={styles.statLabel}>Tinggi</Text>
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
          <Text
            style={[
              styles.filterButtonText,
              selectedFilter === 'all' && styles.filterButtonTextActive,
            ]}
          >
            Semua ({stats.total})
          </Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.filterButton,
            selectedFilter === 'rendah' && styles.filterButtonActive,
            { opacity: pressed ? 0.7 : 1 },
          ]}
          onPress={() => applyFilter('rendah')}
        >
          <View style={[styles.filterDot, { backgroundColor: '#10B981' }]} />
          <Text
            style={[
              styles.filterButtonText,
              selectedFilter === 'rendah' && styles.filterButtonTextActive,
            ]}
          >
            Rendah ({stats.rendah})
          </Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.filterButton,
            selectedFilter === 'sedang' && styles.filterButtonActive,
            { opacity: pressed ? 0.7 : 1 },
          ]}
          onPress={() => applyFilter('sedang')}
        >
          <View style={[styles.filterDot, { backgroundColor: '#F59E0B' }]} />
          <Text
            style={[
              styles.filterButtonText,
              selectedFilter === 'sedang' && styles.filterButtonTextActive,
            ]}
          >
            Sedang ({stats.sedang})
          </Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.filterButton,
            selectedFilter === 'tinggi' && styles.filterButtonActive,
            { opacity: pressed ? 0.7 : 1 },
          ]}
          onPress={() => applyFilter('tinggi')}
        >
          <View style={[styles.filterDot, { backgroundColor: '#EF4444' }]} />
          <Text
            style={[
              styles.filterButtonText,
              selectedFilter === 'tinggi' && styles.filterButtonTextActive,
            ]}
          >
            Tinggi ({stats.tinggi})
          </Text>
        </Pressable>
      </ScrollView>

      {/* Results Count */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {filteredResults.length} hasil ditemukan
        </Text>
      </View>
    </>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="folder-open-outline" size={64} color="#D1D5DB" />
      </View>
      <Text style={styles.emptyTitle}>Belum Ada Hasil Lab</Text>
      <Text style={styles.emptySubtitle}>
        Upload hasil lab Anda untuk memulai tracking kesehatan
      </Text>
      <Pressable
        style={({ pressed }) => [
          styles.emptyButton,
          { opacity: pressed ? 0.7 : 1 },
        ]}
        onPress={handleAddLab}
      >
        <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
        <Text style={styles.emptyButtonText}>Upload Hasil Lab</Text>
      </Pressable>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ABE7B2" />
        <Text style={styles.loadingText}>Memuat data...</Text>
      </View>
    );
  }

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
        <Text style={styles.headerTitle}>Arsip Lab</Text>
        <Pressable
          onPress={handleAddLab}
          style={({ pressed }) => [
            styles.addButton,
            { opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Ionicons name="add-circle" size={24} color="#ABE7B2" />
        </Pressable>
      </View>

      {/* Content */}
      {labResults.length === 0 ? (
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
          {renderEmptyState()}
        </ScrollView>
      ) : (
        <FlatList
          data={filteredResults}
          renderItem={renderLabCard}
          keyExtractor={(item, index) => item.id || `lab-${index}`}
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
          ListEmptyComponent={
            <View style={styles.emptyFilterContainer}>
              <Ionicons name="search-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyFilterText}>
                Tidak ada hasil lab dengan filter ini
              </Text>
            </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
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
  addButton: {
    padding: 4,
  },
  scrollContent: {
    flexGrow: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  statsCard: {
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
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
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
    paddingHorizontal: 16,
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
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#1F2937',
    fontWeight: '600',
  },
  filterDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  resultsHeader: {
    paddingVertical: 8,
  },
  resultsCount: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  labCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardImageContainer: {
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
  riskBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  riskBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cardContent: {
    padding: 16,
  },
  dateTimeRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  dateTimeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  dateTimeText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  metricItem: {
    width: '50%',
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  viewDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  viewDetailText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ABE7B2',
    marginRight: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ABE7B2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  emptyFilterContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyFilterText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 12,
  },
});
