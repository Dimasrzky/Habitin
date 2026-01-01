// app/screens/arsipLab/index.tsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import { deleteLabResult, getLabResults } from '../../../src/services/health/healthAPI';
import { LabResult } from '../../../src/types/health.types';

type RiskLevel = 'rendah' | 'sedang' | 'tinggi' | 'all';

interface FilterStats {
  total: number;
  rendah: number;
  sedang: number;
  tinggi: number;
}

interface LabCardProps {
  item: LabResult;
  isSelected: boolean;
  selectionMode: boolean;
  onToggleSelect: (id: string) => void;
  onDelete: (lab: LabResult) => void;
  onViewDetail: (lab: LabResult) => void;
  onEnterSelectionMode: (id: string) => void;
}

const LabCard = React.memo(({
  item,
  isSelected,
  selectionMode,
  onToggleSelect,
  onDelete,
  onViewDetail,
  onEnterSelectionMode,
}: LabCardProps) => {
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

  return (
    <View style={[styles.labCard, isSelected && styles.labCardSelected]}>
      {/* Checkbox */}
      {selectionMode && (
        <Pressable
          style={({ pressed }) => [
            styles.checkboxButton,
            { opacity: pressed ? 0.8 : 1 },
          ]}
          onPress={() => item.id && onToggleSelect(item.id)}
        >
          <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
            {isSelected && <Ionicons name="checkmark" size={18} color="#FFFFFF" />}
          </View>
        </Pressable>
      )}

      <Pressable
        style={({ pressed }) => [
          styles.cardPressable,
          { opacity: pressed ? 0.95 : 1 },
        ]}
        onPress={() => {
          if (selectionMode && item.id) {
            onToggleSelect(item.id);
          } else {
            onViewDetail(item);
          }
        }}
        onLongPress={() => {
          if (!selectionMode && item.id) {
            onEnterSelectionMode(item.id);
          }
        }}
      >
        {/* Image and Risk Badge */}
        <View style={styles.cardImageContainer}>
          {item.image_url ? (
            <Image source={{ uri: item.image_url }} style={styles.labImage} />
          ) : (
            <View style={[styles.labImage, styles.placeholderImage]}>
              <Ionicons name="document-text-outline" size={40} color="#D1D5DB" />
            </View>
          )}
          <View
            style={[
              styles.riskBadge,
              { backgroundColor: getRiskColor(item.risk_level) },
            ]}
          >
            <Ionicons
              name={item.risk_level === 'rendah' ? 'checkmark-circle' : item.risk_level === 'sedang' ? 'alert-circle' : 'warning'}
              size={14}
              color="#FFFFFF"
              style={{ marginRight: 4 }}
            />
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
              <Ionicons name="calendar-outline" size={16} color="#6B7280" />
              <Text style={styles.dateTimeText}>{formatDate(item.created_at)}</Text>
            </View>
            <View style={styles.dateTimeItem}>
              <Ionicons name="time-outline" size={16} color="#6B7280" />
              <Text style={styles.dateTimeText}>{formatTime(item.created_at)}</Text>
            </View>
          </View>

          {/* Health Metrics */}
          <View style={styles.metricsContainer}>
            <View style={styles.metricRow}>
              <View style={styles.metricCard}>
                <View style={[styles.metricIconContainer, { backgroundColor: '#DBEAFE' }]}>
                  <Ionicons name="water-outline" size={20} color="#3B82F6" />
                </View>
                <View style={styles.metricInfo}>
                  <Text style={styles.metricLabel}>Glukosa</Text>
                  <Text style={styles.metricValue}>{item.glucose_level || '-'} <Text style={styles.metricUnit}>mg/dL</Text></Text>
                </View>
              </View>
              <View style={styles.metricCard}>
                <View style={[styles.metricIconContainer, { backgroundColor: '#FCE7F3' }]}>
                  <Ionicons name="heart-outline" size={20} color="#EC4899" />
                </View>
                <View style={styles.metricInfo}>
                  <Text style={styles.metricLabel}>Kolesterol</Text>
                  <Text style={styles.metricValue}>{item.cholesterol_total || '-'} <Text style={styles.metricUnit}>mg/dL</Text></Text>
                </View>
              </View>
            </View>
            <View style={styles.metricRow}>
              <View style={styles.metricCard}>
                <View style={[styles.metricIconContainer, { backgroundColor: '#FEF3C7' }]}>
                  <Ionicons name="analytics-outline" size={20} color="#F59E0B" />
                </View>
                <View style={styles.metricInfo}>
                  <Text style={styles.metricLabel}>HbA1c</Text>
                  <Text style={styles.metricValue}>{item.hba1c || '-'} <Text style={styles.metricUnit}>%</Text></Text>
                </View>
              </View>
              <View style={styles.metricCard}>
                <View style={[styles.metricIconContainer, { backgroundColor: '#E0E7FF' }]}>
                  <Ionicons name="pulse-outline" size={20} color="#6366F1" />
                </View>
                <View style={styles.metricInfo}>
                  <Text style={styles.metricLabel}>Trigliserida</Text>
                  <Text style={styles.metricValue}>{item.triglycerides || '-'} <Text style={styles.metricUnit}>mg/dL</Text></Text>
                </View>
              </View>
            </View>
          </View>

          {/* View Detail Arrow */}
          <View style={styles.viewDetailRow}>
            <Text style={styles.viewDetailText}>Lihat Detail Lengkap</Text>
            <Ionicons name="chevron-forward" size={18} right={70} top={1} color="#10B981" />
            <View style={styles.viewDetailActions}>
              {!selectionMode && (
                <Pressable
                  style={({ pressed }) => [
                    styles.deleteButtonBottom,
                    { opacity: pressed ? 0.8 : 1 },
                  ]}
                  onPress={(e) => {
                    e.stopPropagation();
                    onDelete(item);
                  }}
                >
                  <Ionicons name="trash-outline" size={18} color="#EF4444" />
                </Pressable>
              )}
            </View>
          </View>
        </View>
      </Pressable>
    </View>
  );
});

LabCard.displayName = 'LabCard';

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

  // Selection state
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const fetchLabResults = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchLabResults();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchLabResults();
    setRefreshing(false);
  }, []);

  const applyFilter = useCallback((filter: RiskLevel, results: LabResult[] = labResults) => {
    setSelectedFilter(filter);
    if (filter === 'all') {
      setFilteredResults(results);
    } else {
      setFilteredResults(results.filter((r) => r.risk_level === filter));
    }
  }, [labResults]);

  const handleViewDetail = (lab: LabResult) => {
    // Navigate to detail screen - you can implement this later
    console.log('View detail for lab:', lab.id);
    // router.push(`/screens/arsipLab/detail?id=${lab.id}`);
  };

  const handleAddLab = () => {
    router.push('/screens/cekKesehatan/uploadLab');
  };

  const handleDeleteLab = useCallback((lab: LabResult) => {
    Alert.alert(
      'Hapus Hasil Lab',
      'Apakah Anda yakin ingin menghapus hasil lab ini? Tindakan ini tidak dapat dibatalkan.',
      [
        {
          text: 'Batal',
          style: 'cancel',
        },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              const currentUser = auth.currentUser;
              if (!currentUser || !lab.id) return;

              const success = await deleteLabResult(lab.id, currentUser.uid);
              if (success) {
                // Refresh data
                await fetchLabResults();
                Alert.alert('Berhasil', 'Hasil lab berhasil dihapus');
              } else {
                Alert.alert('Gagal', 'Gagal menghapus hasil lab');
              }
            } catch (error) {
              console.error('Error deleting lab:', error);
              Alert.alert('Error', 'Terjadi kesalahan saat menghapus');
            }
          },
        },
      ]
    );
  }, [fetchLabResults]);

  const toggleSelectionMode = useCallback(() => {
    setSelectionMode(prev => {
      if (prev) {
        setSelectedIds(new Set());
      }
      return !prev;
    });
  }, []);

  const toggleSelectItem = useCallback((id: string) => {
    setSelectedIds(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(id)) {
        newSelected.delete(id);
      } else {
        newSelected.add(id);
      }
      return newSelected;
    });
  }, []);

  const selectAll = useCallback(() => {
    const allIds = new Set(filteredResults.map(item => item.id).filter((id): id is string => id !== undefined));
    setSelectedIds(allIds);
  }, [filteredResults]);

  const deselectAll = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;

    Alert.alert(
      'Hapus Hasil Lab',
      `Apakah Anda yakin ingin menghapus ${selectedIds.size} hasil lab? Tindakan ini tidak dapat dibatalkan.`,
      [
        {
          text: 'Batal',
          style: 'cancel',
        },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              const currentUser = auth.currentUser;
              if (!currentUser) return;

              let successCount = 0;
              let failCount = 0;

              for (const id of selectedIds) {
                const success = await deleteLabResult(id, currentUser.uid);
                if (success) {
                  successCount++;
                } else {
                  failCount++;
                }
              }

              // Refresh data
              await fetchLabResults();
              setSelectedIds(new Set());
              setSelectionMode(false);

              if (failCount === 0) {
                Alert.alert('Berhasil', `${successCount} hasil lab berhasil dihapus`);
              } else {
                Alert.alert('Selesai', `${successCount} berhasil dihapus, ${failCount} gagal`);
              }
            } catch (error) {
              console.error('Error deleting labs:', error);
              Alert.alert('Error', 'Terjadi kesalahan saat menghapus');
            }
          },
        },
      ]
    );
  };

  const handleEnterSelectionMode = useCallback((id: string) => {
    setSelectionMode(true);
    toggleSelectItem(id);
  }, [toggleSelectItem]);

  const keyExtractor = useCallback((item: LabResult, index: number) => {
    return item.id || `lab-${index}`;
  }, []);

  const renderLabCard = useCallback(({ item }: { item: LabResult }) => {
    const isSelected = item.id ? selectedIds.has(item.id) : false;

    return (
      <LabCard
        item={item}
        isSelected={isSelected}
        selectionMode={selectionMode}
        onToggleSelect={toggleSelectItem}
        onDelete={handleDeleteLab}
        onViewDetail={handleViewDetail}
        onEnterSelectionMode={handleEnterSelectionMode}
      />
    );
  }, [selectedIds, selectionMode, toggleSelectItem, handleDeleteLab, handleEnterSelectionMode]);

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
      <View style={styles.filterSection}>
        <View style={styles.filterHeader}>
          <Ionicons name="funnel-outline" size={13} color="#6B7280" />
          <Text style={styles.filterHeaderText}>Filter Berdasarkan Risiko</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
          contentContainerStyle={styles.filterContent}
        >
          <Pressable
            style={[
              styles.filterButton,
              selectedFilter === 'all' && styles.filterButtonActive,
            ]}
            onPress={() => applyFilter('all')}
            android_ripple={{ color: '#E5E7EB' }}
          >
            <View style={[styles.filterIconContainer, selectedFilter === 'all' && styles.filterIconContainerActive]}>
              <Ionicons name="apps" size={13} color={selectedFilter === 'all' ? '#FFFFFF' : '#6B7280'} />
            </View>
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
            style={[
              styles.filterButton,
              selectedFilter === 'rendah' && styles.filterButtonActiveRendah,
            ]}
            onPress={() => applyFilter('rendah')}
            android_ripple={{ color: '#D1FAE5' }}
          >
            <View style={[styles.filterIconContainer, selectedFilter === 'rendah' && styles.filterIconContainerRendah]}>
              <Ionicons name="checkmark-circle" size={13} color={selectedFilter === 'rendah' ? '#FFFFFF' : '#10B981'} />
            </View>
            <Text
              style={[
                styles.filterButtonText,
                selectedFilter === 'rendah' && styles.filterButtonTextActiveRendah,
              ]}
            >
              Rendah
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.filterButton,
              selectedFilter === 'sedang' && styles.filterButtonActiveSedang,
            ]}
            onPress={() => applyFilter('sedang')}
            android_ripple={{ color: '#FEF3C7' }}
          >
            <View style={[styles.filterIconContainer, selectedFilter === 'sedang' && styles.filterIconContainerSedang]}>
              <Ionicons name="alert-circle" size={13} color={selectedFilter === 'sedang' ? '#FFFFFF' : '#F59E0B'} />
            </View>
            <Text
              style={[
                styles.filterButtonText,
                selectedFilter === 'sedang' && styles.filterButtonTextActiveSedang,
              ]}
            >
              Sedang
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.filterButton,
              selectedFilter === 'tinggi' && styles.filterButtonActiveTinggi,
            ]}
            onPress={() => applyFilter('tinggi')}
            android_ripple={{ color: '#FEE2E2' }}
          >
            <View style={[styles.filterIconContainer, selectedFilter === 'tinggi' && styles.filterIconContainerTinggi]}>
              <Ionicons name="warning" size={13} color={selectedFilter === 'tinggi' ? '#FFFFFF' : '#EF4444'} />
            </View>
            <Text
              style={[
                styles.filterButtonText,
                selectedFilter === 'tinggi' && styles.filterButtonTextActiveTinggi,
              ]}
            >
              Tinggi
            </Text>
          </Pressable>
        </ScrollView>
      </View>

      {/* Results Count and Selection Toggle */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {filteredResults.length} hasil ditemukan
        </Text>
        {!selectionMode && filteredResults.length > 0 && (
          <Pressable
            onPress={toggleSelectionMode}
            style={({ pressed }) => [
              styles.selectionModeButton,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Text style={styles.selectionModeButtonText}>Pilih</Text>
          </Pressable>
        )}
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
        {selectionMode ? (
          <>
            <Pressable
              onPress={toggleSelectionMode}
              style={({ pressed }) => [
                styles.backButton,
                { opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <Ionicons name="close" size={24} color="#1F2937" />
            </Pressable>
            <Text style={styles.headerTitle}>
              {selectedIds.size} dipilih
            </Text>
            <View style={styles.headerActions}>
              {selectedIds.size === filteredResults.length && filteredResults.length > 0 ? (
                <Pressable
                  onPress={deselectAll}
                  style={({ pressed }) => [
                    styles.selectButton,
                    { opacity: pressed ? 0.7 : 1 },
                  ]}
                >
                  <Text style={styles.selectButtonText}>Batal Semua</Text>
                </Pressable>
              ) : (
                <Pressable
                  onPress={selectAll}
                  style={({ pressed }) => [
                    styles.selectButton,
                    { opacity: pressed ? 0.7 : 1 },
                  ]}
                >
                  <Text style={styles.selectButtonText}>Pilih Semua</Text>
                </Pressable>
              )}
            </View>
          </>
        ) : (
          <>
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
              <Ionicons name="add-circle" size={24} color="#75c07eff" />
            </Pressable>
          </>
        )}
      </View>

      {/* Selection Mode Actions Bar */}
      {selectionMode && selectedIds.size > 0 && (
        <View style={styles.selectionBar}>
          <Pressable
            onPress={handleDeleteSelected}
            style={styles.deleteSelectedButton}
            android_ripple={{ color: '#DC2626' }}
          >
            <Ionicons name="trash" size={20} color="#FFFFFF" />
            <Text style={styles.deleteSelectedText}>
              Hapus {selectedIds.size} Item
            </Text>
          </Pressable>
        </View>
      )}

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
          keyExtractor={keyExtractor}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={50}
          windowSize={10}
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
  filterSection: {
    marginBottom: 10,
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 7,
    gap: 4,
  },
  filterHeaderText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  filterContainer: {
    marginBottom: 0,
  },
  filterContent: {
    paddingRight: 16,
    //gap: 2,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    marginRight: 7,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
    overflow: 'hidden',
  },
  filterButtonActive: {
    backgroundColor: '#F3F4F6',
    borderColor: '#9CA3AF',
  },
  filterButtonActiveRendah: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  filterButtonActiveSedang: {
    backgroundColor: '#FFFBEB',
    borderColor: '#F59E0B',
  },
  filterButtonActiveTinggi: {
    backgroundColor: '#FEF2F2',
    borderColor: '#EF4444',
  },
  filterIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 7,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 7,
  },
  filterIconContainerActive: {
    backgroundColor: '#9CA3AF',
  },
  filterIconContainerRendah: {
    backgroundColor: '#10B981',
  },
  filterIconContainerSedang: {
    backgroundColor: '#F59E0B',
  },
  filterIconContainerTinggi: {
    backgroundColor: '#EF4444',
  },
  filterButtonText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  },
  filterButtonTextActive: {
    color: '#1F2937',
    fontWeight: '700',
  },
  filterButtonTextActiveRendah: {
    color: '#065F46',
    fontWeight: '700',
  },
  filterButtonTextActiveSedang: {
    color: '#92400E',
    fontWeight: '700',
  },
  filterButtonTextActiveTinggi: {
    color: '#991B1B',
    fontWeight: '700',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  resultsCount: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  selectionModeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F0FDF4',
  },
  selectionModeButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#10B981',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F0FDF4',
  },
  selectButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#10B981',
  },
  selectionBar: {
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  deleteSelectedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  deleteSelectedText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  labCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 3,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  labCardSelected: {
    borderColor: '#10B981',
    shadowColor: '#10B981',
    shadowOpacity: 0.2,
    elevation: 8,
  },
  cardPressable: {
    borderRadius: 17,
    overflow: 'hidden',
  },
  cardImageContainer: {
    position: 'relative',
  },
  labImage: {
    width: '100%',
    height: 180,
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  riskBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  deleteButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: '#EF4444',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
    zIndex: 10,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  checkboxButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 10,
  },
  checkbox: {
    width: 25,
    height: 25,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    left:4,
  },
  checkboxSelected: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
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
  metricsContainer: {
    marginTop: 16,
    marginBottom: 16,
  },
  metricRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  metricCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  metricIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  metricInfo: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 2,
    fontWeight: '500',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  metricUnit: {
    fontSize: 11,
    fontWeight: '500',
    color: '#9CA3AF',
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
  viewDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    paddingBottom: 4,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  viewDetailText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#10B981',
    marginRight: 4,
  },
  viewDetailActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deleteButtonBottom: {
    padding: 4,
    borderRadius: 6,
    backgroundColor: '#FEF2F2',
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
