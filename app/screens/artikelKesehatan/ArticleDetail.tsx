// app/screens/artikelKesehatan/ArticleDetail.tsx

import { useAuth } from '@/context/AuthContext';
import { getArticleById, updateArticleFeedback } from '@/services/article/articleService';
import type { Article } from '@/types/news.types';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Image,
    Linking,
    Platform,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface ArticleDetailProps {
  articleId: string;
}

export default function ArticleDetail({ articleId }: ArticleDetailProps) {
  const { user } = useAuth();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [isHelpful, setIsHelpful] = useState<boolean | null>(null);

  useEffect(() => {
    loadArticle();
  }, [articleId]);

  const loadArticle = async () => {
    try {
      const result = await getArticleById(articleId);
      if (result.success && result.article) {
        setArticle(result.article);
      }
    } catch (error) {
      console.error('Error loading article:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (helpful: boolean) => {
    if (!user?.uid || !article) return;

    setIsHelpful(helpful);
    await updateArticleFeedback(user.uid, article.id, helpful);
  };

  const handleShare = async () => {
    if (!article) return;

    try {
      await Share.share({
        message: `${article.title_id}\n\n${article.description_id}\n\nBaca selengkapnya: ${article.url}`,
        title: article.title_id,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleOpenOriginal = async () => {
    if (!article?.url) return;

    try {
      await Linking.openURL(article.url);
    } catch (error) {
      console.error('Error opening URL:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>Memuat artikel...</Text>
      </View>
    );
  }

  if (!article) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>📭</Text>
        <Text style={styles.errorTitle}>Artikel Tidak Ditemukan</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Kembali</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with Back Button */}
      <LinearGradient
        colors={['#8fd89aff', '#3fbb51ff']}
        style={styles.header}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>← Kembali</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
          <Text style={styles.shareBtnText}>📤 Bagikan</Text>
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Featured Image */}
        <Animated.View entering={FadeIn.duration(600)}>
          {article.image_url ? (
            <Image
              source={{ uri: article.image_url }}
              style={styles.featuredImage}
              resizeMode="cover"
            />
          ) : (
            <LinearGradient
              colors={['#4A90E2', '#357ABD']}
              style={styles.featuredImagePlaceholder}
            >
              <Text style={styles.placeholderIcon}>📰</Text>
            </LinearGradient>
          )}
        </Animated.View>

        {/* Content Container */}
        <View style={styles.contentContainer}>
          {/* Category Badges */}
          <Animated.View 
            entering={FadeInDown.delay(200).duration(600)}
            style={styles.badgeContainer}
          >
            {article.category?.map((cat: string, idx: number) => (
              <View
                key={idx}
                style={[
                  styles.badge,
                  cat === 'diabetes' && styles.badgeDiabetes,
                  cat === 'cholesterol' && styles.badgeCholesterol,
                  cat === 'general' && styles.badgeGeneral,
                ]}
              >
                <Text style={styles.badgeText}>
                  {cat === 'diabetes' ? '🩸 Diabetes' : 
                   cat === 'cholesterol' ? '💊 Kolesterol' : '📋 Umum'}
                </Text>
              </View>
            ))}
          </Animated.View>

          {/* Title */}
          <Animated.Text 
            entering={FadeInDown.delay(300).duration(600)}
            style={styles.title}
          >
            {article.title_id}
          </Animated.Text>

          {/* Meta Info */}
          <Animated.View 
            entering={FadeInDown.delay(400).duration(600)}
            style={styles.metaContainer}
          >
            <View style={styles.metaItem}>
              <Text style={styles.metaIcon}>📰</Text>
              <Text style={styles.metaText}>{article.source_name}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaIcon}>🕒</Text>
              <Text style={styles.metaText}>
                {new Date(article.published_at).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </Text>
            </View>
          </Animated.View>

          {/* Description */}
          <Animated.Text 
            entering={FadeInDown.delay(500).duration(600)}
            style={styles.description}
          >
            {article.description_id}
          </Animated.Text>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Content */}
          <Animated.View entering={FadeInDown.delay(600).duration(600)}>
            <Text style={styles.contentTitle}>📖 Isi Artikel</Text>
            <Text style={styles.content}>
              {article.content_id}
            </Text>
          </Animated.View>

          {/* Read Original Button */}
          <TouchableOpacity 
            style={styles.originalButton}
            onPress={handleOpenOriginal}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#4A90E2', '#357ABD']}
              style={styles.originalButtonGradient}
            >
              <Text style={styles.originalButtonText}>
                🔗 Baca Artikel Asli (Bahasa Inggris)
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Feedback Section */}
          <View style={styles.feedbackContainer}>
            <Text style={styles.feedbackTitle}>
              Apakah artikel ini membantu?
            </Text>
            <View style={styles.feedbackButtons}>
              <TouchableOpacity
                style={[
                  styles.feedbackBtn,
                  isHelpful === true && styles.feedbackBtnActive,
                ]}
                onPress={() => handleFeedback(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.feedbackBtnText}>👍 Ya, Membantu</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.feedbackBtn,
                  isHelpful === false && styles.feedbackBtnActive,
                ]}
                onPress={() => handleFeedback(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.feedbackBtnText}>👎 Kurang Membantu</Text>
              </TouchableOpacity>
            </View>
            {isHelpful !== null && (
              <Text style={styles.feedbackThankYou}>
                ✅ Terima kasih atas feedback Anda!
              </Text>
            )}
          </View>

          {/* Disclaimer */}
          <View style={styles.disclaimerContainer}>
            <Text style={styles.disclaimerIcon}>⚠️</Text>
            <Text style={styles.disclaimerText}>
              <Text style={styles.disclaimerBold}>Disclaimer: </Text>
              Artikel ini diterjemahkan secara otomatis dan hanya untuk tujuan edukasi. 
              Informasi ini bukan pengganti konsultasi medis profesional. 
              Selalu konsultasikan kondisi kesehatan Anda dengan dokter.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  backBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  shareBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  shareBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  featuredImage: {
    width: '100%',
    height: 250,
    backgroundColor: '#E2E8F0',
  },
  featuredImagePlaceholder: {
    width: '100%',
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    fontSize: 80,
    opacity: 0.5,
  },
  contentContainer: {
    padding: 20,
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  badge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  badgeDiabetes: {
    backgroundColor: '#FEE2E2',
  },
  badgeCholesterol: {
    backgroundColor: '#FEF3C7',
  },
  badgeGeneral: {
    backgroundColor: '#DBEAFE',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1E293B',
    lineHeight: 36,
    marginBottom: 16,
  },
  metaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    marginBottom: 8,
  },
  metaIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  metaText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  description: {
    fontSize: 16,
    color: '#475569',
    lineHeight: 26,
    marginBottom: 24,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 24,
  },
  contentTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
  },
  content: {
    fontSize: 15,
    color: '#334155',
    lineHeight: 28,
    marginBottom: 32,
  },
  originalButton: {
    marginBottom: 32,
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  originalButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  originalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  feedbackContainer: {
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  feedbackTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
    textAlign: 'center',
  },
  feedbackButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  feedbackBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  feedbackBtnActive: {
    backgroundColor: '#DBEAFE',
    borderColor: '#4A90E2',
  },
  feedbackBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
  },
  feedbackThankYou: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 12,
  },
  disclaimerContainer: {
    flexDirection: 'row',
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 40,
  },
  disclaimerIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 12,
    color: '#92400E',
    lineHeight: 18,
  },
  disclaimerBold: {
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 40,
  },
  errorIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 32,
  },
  backButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});