// app/screens/Profile/AvatarStore.tsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface AvatarItem {
  id: string;
  name: string;
  price: number;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  category: 'hair' | 'face' | 'body' | 'accessory';
  owned: boolean;
}

const AVATAR_ITEMS: AvatarItem[] = [
  // Hair
  { id: 'h1', name: 'Rambut Pendek', price: 0, icon: 'person', color: '#FFD580', category: 'hair', owned: true },
  { id: 'h2', name: 'Rambut Panjang', price: 100, icon: 'person', color: '#FFB8D0', category: 'hair', owned: false },
  { id: 'h3', name: 'Rambut Keriting', price: 150, icon: 'person', color: '#93BFC7', category: 'hair', owned: false },
  
  // Face
  { id: 'f1', name: 'Kacamata', price: 50, icon: 'glasses', color: '#1F2937', category: 'face', owned: false },
  { id: 'f2', name: 'Topeng', price: 200, icon: 'happy', color: '#ABE7B2', category: 'face', owned: false },
  { id: 'f3', name: 'Kumis', price: 75, icon: 'color-wand', color: '#6B7280', category: 'face', owned: false },
  
  // Body
  { id: 'b1', name: 'Baju Olahraga', price: 120, icon: 'shirt', color: '#93BFC7', category: 'body', owned: false },
  { id: 'b2', name: 'Baju Formal', price: 180, icon: 'business', color: '#1F2937', category: 'body', owned: false },
  { id: 'b3', name: 'Baju Santai', price: 90, icon: 'shirt-outline', color: '#FFD580', category: 'body', owned: true },
  
  // Accessory
  { id: 'a1', name: 'Topi', price: 80, icon: 'construct', color: '#FFD580', category: 'accessory', owned: false },
  { id: 'a2', name: 'Medali', price: 250, icon: 'medal', color: '#FFD580', category: 'accessory', owned: false },
  { id: 'a3', name: 'Kalung', price: 130, icon: 'ribbon', color: '#FFB8D0', category: 'accessory', owned: false },
];

const CATEGORIES = {
  hair: { name: 'Rambut', icon: 'cut' as keyof typeof Ionicons.glyphMap },
  face: { name: 'Wajah', icon: 'happy' as keyof typeof Ionicons.glyphMap },
  body: { name: 'Pakaian', icon: 'shirt' as keyof typeof Ionicons.glyphMap },
  accessory: { name: 'Aksesoris', icon: 'diamond' as keyof typeof Ionicons.glyphMap },
};

export default function AvatarStore() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof CATEGORIES>('hair');
  const [userPoints, setUserPoints] = useState(3450);
  const [items, setItems] = useState(AVATAR_ITEMS);

  const filteredItems = items.filter(item => item.category === selectedCategory);

  const handlePurchase = (item: AvatarItem) => {
    if (item.owned) {
      Alert.alert('Info', 'Anda sudah memiliki item ini!');
      return;
    }

    if (userPoints < item.price) {
      Alert.alert('Poin Tidak Cukup', 'Anda tidak memiliki cukup poin untuk membeli item ini.');
      return;
    }

    Alert.alert(
      'Konfirmasi Pembelian',
      `Beli ${item.name} seharga ${item.price} poin?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Beli',
          onPress: () => {
            setUserPoints(userPoints - item.price);
            setItems(items.map(i => 
              i.id === item.id ? { ...i, owned: true } : i
            ));
            Alert.alert('Berhasil!', `${item.name} berhasil dibeli!`);
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Toko Avatar</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Points Balance */}
      <View style={styles.pointsCard}>
        <View style={styles.pointsContent}>
          <Ionicons name="diamond" size={32} color="#FFD580" />
          <View style={styles.pointsText}>
            <Text style={styles.pointsLabel}>Poin Anda</Text>
            <Text style={styles.pointsValue}>{userPoints}</Text>
          </View>
        </View>
        <Text style={styles.pointsInfo}>Dapatkan lebih banyak poin dengan menyelesaikan tantangan!</Text>
      </View>

      {/* Category Tabs */}
      <View style={styles.categoryContainer}>
        {(Object.keys(CATEGORIES) as (keyof typeof CATEGORIES)[]).map((key) => (
          <TouchableOpacity
            key={key}
            style={[
              styles.categoryTab,
              selectedCategory === key && styles.categoryTabActive
            ]}
            onPress={() => setSelectedCategory(key)}
          >
            <Ionicons 
              name={CATEGORIES[key].icon} 
              size={20} 
              color={selectedCategory === key ? '#1F2937' : '#6B7280'} 
            />
            <Text style={[
              styles.categoryText,
              selectedCategory === key && styles.categoryTextActive
            ]}>
              {CATEGORIES[key].name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Items Grid */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.itemsGrid}>
          {filteredItems.map((item) => (
            <View key={item.id} style={styles.itemCard}>
              <View style={[styles.itemIcon, { backgroundColor: item.color + '30' }]}>
                <Ionicons name={item.icon} size={40} color={item.color} />
                {item.owned && (
                  <View style={styles.ownedBadge}>
                    <Ionicons name="checkmark-circle" size={20} color="#ABE7B2" />
                  </View>
                )}
              </View>
              
              <Text style={styles.itemName}>{item.name}</Text>
              
              {item.owned ? (
                <View style={styles.ownedButton}>
                  <Text style={styles.ownedText}>Dimiliki</Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={[
                    styles.buyButton,
                    userPoints < item.price && styles.buyButtonDisabled
                  ]}
                  onPress={() => handlePurchase(item)}
                >
                  <Ionicons name="diamond" size={16} color="#FFFFFF" />
                  <Text style={styles.buyButtonText}>{item.price === 0 ? 'Gratis' : item.price}</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
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
  pointsCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  pointsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  pointsText: {
    marginLeft: 12,
  },
  pointsLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  pointsValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
  },
  pointsInfo: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  categoryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  categoryTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 6,
  },
  categoryTabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#ABE7B2',
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  categoryTextActive: {
    color: '#1F2937',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  itemCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    margin: '1%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  itemIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  ownedBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 12,
  },
  buyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ABE7B2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  buyButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  buyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  ownedButton: {
    backgroundColor: '#ECF4E8',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  ownedText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ABE7B2',
  },
});