// app/screens/Profile/HelpSupport.tsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Linking,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    id: '1',
    question: 'Bagaimana cara mengubah data kesehatan saya?',
    answer: 'Anda dapat mengubah data kesehatan melalui Profile → Data Kesehatan Personal → Edit Data. Pastikan data yang Anda masukkan akurat untuk hasil analisis yang lebih baik.',
  },
  {
    id: '2',
    question: 'Bagaimana cara mendapatkan poin?',
    answer: 'Anda bisa mendapatkan poin dengan: 1) Menyelesaikan tantangan harian, 2) Login konsisten setiap hari, 3) Berpartisipasi dalam komunitas, 4) Mencapai target kesehatan mingguan.',
  },
  {
    id: '3',
    question: 'Apakah data saya aman?',
    answer: 'Ya, sangat aman. Semua data kesehatan Anda dienkripsi dan disimpan sesuai standar keamanan industri. Kami tidak pernah membagikan data pribadi Anda tanpa izin.',
  },
  {
    id: '4',
    question: 'Bagaimana cara menghubungi support?',
    answer: 'Anda dapat menghubungi kami melalui email support@habitin.com atau WhatsApp di nomor +62 812-3456-7890. Tim kami siap membantu 24/7.',
  },
  {
    id: '5',
    question: 'Bisakah saya menghapus akun saya?',
    answer: 'Ya, Anda dapat menghapus akun melalui Profile → Privasi & Keamanan → Hapus Akun. Perhatikan bahwa penghapusan akun bersifat permanen dan tidak dapat dibatalkan.',
  },
];

export default function HelpSupport() {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFAQ = FAQ_DATA.filter(item =>
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleEmail = () => {
    Linking.openURL('mailto:support@habitin.com?subject=Bantuan Habitin');
  };

  const handleWhatsApp = () => {
    Linking.openURL('https://wa.me/6281256640452?text=Halo, saya butuh bantuan dengan Habitin');
  };

  const handleCallSupport = () => {
    Linking.openURL('tel:+6281234567890');
  };

  const handleSendFeedback = () => {
    Alert.alert(
      'Kirim Feedback',
      'Terima kasih atas feedback Anda! Silakan tulis feedback melalui email atau chat dengan kami.',
      [
        { text: 'Batal', style: 'cancel' },
        { text: 'Email', onPress: handleEmail },
        { text: 'WhatsApp', onPress: handleWhatsApp },
      ]
    );
  };

  const handleReportBug = () => {
    Alert.alert(
      'Laporkan Bug',
      'Terima kasih telah membantu kami meningkatkan aplikasi! Silakan deskripsikan bug yang Anda temukan.',
      [
        { text: 'Batal', style: 'cancel' },
        { text: 'Laporkan via Email', onPress: () => {
          Linking.openURL('mailto:support@habitin.com?subject=Bug Report');
        }},
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
        <Text style={styles.headerTitle}>Bantuan & Dukungan</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Contact Cards */}
        <View style={styles.contactSection}>
          <Text style={styles.sectionTitle}>Hubungi Kami</Text>
          <View style={styles.contactGrid}>
            <TouchableOpacity style={styles.contactCard} onPress={handleEmail}>
              <View style={[styles.contactIcon, { backgroundColor: '#FEE2E2' }]}>
                <Ionicons name="mail" size={28} color="#EF4444" />
              </View>
              <Text style={styles.contactLabel}>Email</Text>
              <Text style={styles.contactValue}>support@habitin.com</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactCard} onPress={handleWhatsApp}>
              <View style={[styles.contactIcon, { backgroundColor: '#D1FAE5' }]}>
                <Ionicons name="logo-whatsapp" size={28} color="#10B981" />
              </View>
              <Text style={styles.contactLabel}>WhatsApp</Text>
              <Text style={styles.contactValue}>Chat Sekarang</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactCard} onPress={handleCallSupport}>
              <View style={[styles.contactIcon, { backgroundColor: '#DBEAFE' }]}>
                <Ionicons name="call" size={28} color="#3B82F6" />
              </View>
              <Text style={styles.contactLabel}>Telepon</Text>
              <Text style={styles.contactValue}>+62 812-3456-7890</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Aksi Cepat</Text>
          <View style={styles.actionsList}>
            <TouchableOpacity style={styles.actionItem} onPress={handleSendFeedback}>
              <View style={[styles.actionIcon, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="chatbox-ellipses" size={24} color="#F59E0B" />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Kirim Feedback</Text>
                <Text style={styles.actionDescription}>Bantu kami meningkatkan layanan</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem} onPress={handleReportBug}>
              <View style={[styles.actionIcon, { backgroundColor: '#FEE2E2' }]}>
                <Ionicons name="bug" size={24} color="#EF4444" />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Laporkan Bug</Text>
                <Text style={styles.actionDescription}>Temukan masalah? Laporkan di sini</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
            </TouchableOpacity>
          </View>
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pertanyaan yang Sering Diajukan (FAQ)</Text>
          
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#6B7280" />
            <TextInput
              style={styles.searchInput}
              placeholder="Cari pertanyaan..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>

          {/* FAQ List */}
          <View style={styles.faqList}>
            {filteredFAQ.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="search-outline" size={48} color="#D1D5DB" />
                <Text style={styles.emptyText}>Tidak ada hasil yang ditemukan</Text>
              </View>
            ) : (
              filteredFAQ.map((item, index) => (
                <View 
                  key={item.id}
                  style={[
                    styles.faqItem,
                    index === filteredFAQ.length - 1 && styles.faqItemLast
                  ]}
                >
                  <TouchableOpacity
                    style={styles.faqQuestion}
                    onPress={() => toggleExpand(item.id)}
                  >
                    <Text style={styles.faqQuestionText}>{item.question}</Text>
                    <Ionicons
                      name={expandedId === item.id ? "chevron-up" : "chevron-down"}
                      size={20}
                      color="#6B7280"
                    />
                  </TouchableOpacity>
                  
                  {expandedId === item.id && (
                    <View style={styles.faqAnswer}>
                      <Text style={styles.faqAnswerText}>{item.answer}</Text>
                    </View>
                  )}
                </View>
              ))
            )}
          </View>
        </View>

        {/* Help Resources */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sumber Bantuan Lainnya</Text>
          <View style={styles.resourcesList}>
            <TouchableOpacity style={styles.resourceItem}>
              <Ionicons name="book" size={24} color="#93BFC7" />
              <Text style={styles.resourceText}>Panduan Pengguna</Text>
              <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.resourceItem}>
              <Ionicons name="videocam" size={24} color="#93BFC7" />
              <Text style={styles.resourceText}>Video Tutorial</Text>
              <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.resourceItem, { borderBottomWidth: 0 }]}>
              <Ionicons name="people" size={24} color="#93BFC7" />
              <Text style={styles.resourceText}>Forum Komunitas</Text>
              <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="time" size={20} color="#93BFC7" />
          <Text style={styles.infoText}>
            Tim support kami tersedia 24/7 untuk membantu Anda
          </Text>
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
  content: {
    flex: 1,
  },
  contactSection: {
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  contactGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  contactCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  contactIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 10,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
  section: {
    marginTop: 24,
  },
  actionsList: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  actionDescription: {
    fontSize: 13,
    color: '#6B7280',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: '#1F2937',
  },
  faqList: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  faqItemLast: {
    borderBottomWidth: 0,
  },
  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  faqQuestionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#1F2937',
    marginRight: 12,
  },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  faqAnswerText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 12,
  },
  resourcesList: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  resourceText: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
    marginLeft: 12,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    gap: 12,
    alignItems: 'center',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1F2937',
  },
});