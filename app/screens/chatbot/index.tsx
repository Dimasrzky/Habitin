// app/screens/chatbot/index.tsx
import { auth } from '@/config/firebase.config'; // Sesuaikan path
import { ChatService } from '@/services/gemini/chatService';
import { GeminiService } from '@/services/gemini/geminiService';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

// =====================================================
// TYPES
// =====================================================

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

// =====================================================
// QUICK CHAT CARDS DATA
// =====================================================
const BOT_AVATAR = require('../../../assets/images/Foto Chatbot.png');

const QUICK_CHAT_BUBBLES = [
  { id: '4', icon: '💼', text: 'Buat hariku jadi lebih produktif', question: 'Tips meningkatkan produktivitas harian' },
  { id: '5', icon: '🩺', text: 'Info Diabetes', question: 'Apa itu diabetes dan cara mencegahnya?' },
  { id: '6', icon: '❤️', text: 'Kesehatan Jantung', question: 'Tips menjaga kesehatan jantung' },
  { id: '7', icon: '🥗', text: 'Diet Sehat', question: 'Panduan makanan sehat untuk diet' },
  { id: '8', icon: '🏃', text: 'Olahraga', question: 'Berapa lama harus olahraga per hari?' },
];


export default function ChatbotScreen() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickChats, setShowQuickChats] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Animation
  const typingDot1 = useRef(new Animated.Value(0)).current;
  const typingDot2 = useRef(new Animated.Value(0)).current;
  const typingDot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadChatHistory();
  }, []);

  const loadChatHistory = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        setIsLoading(false);
        return;
      }

      const history = await ChatService.getChatHistory(userId, 50);
      
      if (history.length === 0) {
        setMessages([{
          id: '0',
          text: '👋 Halo! Aku **Aiva**\nAsisten Kesehatan mu\n\nSaya siap membantu Anda dengan informasi kesehatan yang personal berdasarkan kondisi Anda.\n\n✨ Pilih topik di bawah atau ketik pertanyaan Anda sendiri!',
          sender: 'bot',
          timestamp: new Date(),
        }]);
      } else {
        const formattedMessages = history.map(msg => ({
          id: msg.id,
          text: msg.message,
          sender: msg.sender,
          timestamp: msg.created_at,
        }));
        setMessages(formattedMessages);
      }
    } catch (error) { // ← UBAH dari (error: any) menjadi (error)
      console.error('Error loading chat history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto scroll to bottom when new message arrives
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages, isTyping]);

  // Typing animation
  useEffect(() => {
  if (isTyping) {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(typingDot1, {
          toValue: -8,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(typingDot1, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ])
    );

    const animation2 = Animated.loop(
      Animated.sequence([
        Animated.delay(100),
        Animated.timing(typingDot2, {
          toValue: -8,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(typingDot2, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ])
    );

    const animation3 = Animated.loop(
      Animated.sequence([
        Animated.delay(200),
        Animated.timing(typingDot3, {
          toValue: -8,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(typingDot3, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();
    animation2.start();
    animation3.start();

    return () => {
      animation.stop();
      animation2.stop();
      animation3.stop();
    };
  }
}, [isTyping, typingDot1, typingDot2, typingDot3]);

  const handleSend = async (text?: string) => {
    const messageText = text || inputText.trim();

    if (!messageText) return;

    const userId = auth.currentUser?.uid;

    console.log('User ID:', userId);
    console.log('User ID type:', typeof userId);

    if (!userId) {
      Alert.alert('Error', 'Anda harus login terlebih dahulu');
      return;
    }

    // Validasi Gemini API
    if (!GeminiService.isConfigured()) {
      Alert.alert(
        'Konfigurasi Tidak Lengkap',
        'API Key Gemini belum dikonfigurasi. Silakan hubungi administrator.'
      );
      return;
    }

    // Add user message ke UI
    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setShowQuickChats(false);
    setIsTyping(true);

    try {
      // Kirim ke service dan dapatkan response
      const { botMessage } = await ChatService.sendMessage(userId, messageText);

      // Add bot message ke UI
      const botMessageUI: Message = {
        id: botMessage.id,
        text: botMessage.message,
        sender: 'bot',
        timestamp: botMessage.created_at,
      };

      setMessages((prev) => [...prev, botMessageUI]);

    } catch (error: any) {
      console.error('Error sending message:', error);
      
      // Tampilkan error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: '⚠️ Maaf, terjadi kesalahan saat memproses pesan Anda. Silakan coba lagi.',
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickChat = (question: string) => {
    handleSend(question);
  };

  const handleClearChat = () => {
    Alert.alert(
      'Hapus Riwayat Chat',
      'Apakah Anda yakin ingin menghapus semua riwayat chat?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            const userId = auth.currentUser?.uid;
            if (!userId) return;

            try {
              await ChatService.clearChatHistory(userId);
              setMessages([{
                id: '0',
                text: '👋 Riwayat chat telah dihapus. Silakan mulai percakapan baru!',
                sender: 'bot',
                timestamp: new Date(),
              }]);
              setShowQuickChats(true);
            } catch (error) {
              Alert.alert('Error', 'Gagal menghapus riwayat chat');
            }
          },
        },
      ]
    );
  };

  // Format message text (support bold with **)
  const formatMessageText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <Text key={index} style={styles.boldText}>
            {part.slice(2, -2)}
          </Text>
        );
      }
      return <Text key={index}>{part}</Text>;
    });
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={{ marginTop: 12, color: '#6B7280' }}>Memuat riwayat chat...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#10B981" />

      {/* Header with Gradient */}
      <LinearGradient colors={['#10B981', '#059669']} style={styles.header}>
        <View style={styles.headerContent}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.backButton,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </Pressable>
          <View style={styles.headerInfo}>
            <View style={styles.botAvatar}>
              <Image 
              source={BOT_AVATAR} 
              style={styles.botAvatarImage}
              resizeMode="cover"
            />
            </View>

            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>Aiva</Text>
              <View style={styles.onlineIndicator}>
                <View style={styles.onlineDot} />
                <Text style={styles.headerSubtitle}>Online</Text>
              </View>
            </View>
          </View>

          <Pressable
            onPress={handleClearChat}
            style={({ pressed }) => [
              styles.clearButton,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
          </Pressable>
        </View>
      </LinearGradient>

      {/* Chat Area */}
      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.chatArea}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Messages */}
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageContainer,
                message.sender === 'user'
                  ? styles.userMessageContainer
                  : styles.botMessageContainer,
              ]}
            >
              {message.sender === 'bot' && (
                <View style={styles.botAvatarSmall}>
                  <Image 
                    source={BOT_AVATAR} 
                    style={styles.botAvatarSmallImage}
                    resizeMode="cover"
                  />
                </View>
              )}
              <View
                style={[
                  styles.messageBubble,
                  message.sender === 'user'
                    ? styles.userMessageBubble
                    : styles.botMessageBubble,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    message.sender === 'user'
                      ? styles.userMessageText
                      : styles.botMessageText,
                  ]}
                >
                  {formatMessageText(message.text)}
                </Text>
                <Text
                  style={[
                    styles.timestamp,
                    message.sender === 'user'
                      ? styles.userTimestamp
                      : styles.botTimestamp,
                  ]}
                >
                  {message.timestamp.toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            </View>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <View style={[styles.messageContainer, styles.botMessageContainer]}>
              <View style={styles.botAvatarSmall}>
                <Image 
                  source={BOT_AVATAR} 
                  style={styles.botAvatarSmallImage}
                  resizeMode="cover"
                />
              </View>
              <View style={[styles.messageBubble, styles.botMessageBubble]}>
                <View style={styles.typingIndicator}>
                  <Animated.View
                    style={[
                      styles.typingDot,
                      { transform: [{ translateY: typingDot1 }] },
                    ]}
                  />
                  <Animated.View
                    style={[
                      styles.typingDot,
                      { transform: [{ translateY: typingDot2 }] },
                    ]}
                  />
                  <Animated.View
                    style={[
                      styles.typingDot,
                      { transform: [{ translateY: typingDot3 }] },
                    ]}
                  />
                </View>
              </View>
            </View>
          )}

          {/* Quick Chat Cards */}
          {showQuickChats && messages.length === 1 && (
            <View style={styles.quickBubblesContainer}>
              <View style={styles.quickBubblesWrap}>
                {QUICK_CHAT_BUBBLES.map((bubble) => (
                  <Pressable
                    key={bubble.id}
                    style={
                      styles.quickBubble
                    }
                    onPress={() => handleQuickChat(bubble.question)}
                  >
                    <Text style={styles.quickBubbleEmoji}>{bubble.icon}</Text>
                    <Text style={styles.quickBubbleText}>{bubble.text}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          <View style={{ height: 16 }} />
        </ScrollView>

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Tanyakan tentang kesehatan..."
              placeholderTextColor="#9CA3AF"
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
            />
            <Pressable
              onPress={() => handleSend()}
              disabled={!inputText.trim() || isTyping}
              style={({ pressed }) => [
                styles.sendButton,
                {
                  opacity: inputText.trim() && !isTyping ? (pressed ? 0.8 : 1) : 0.5,
                  backgroundColor: inputText.trim() && !isTyping ? '#10B981' : '#10B981',
                },
              ]}
            >
              <Ionicons name="send" size={20} bottom={8} color="#10B981" />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
        <Text style={styles.disclaimer}>
            💡 Informasi dari AI, konsultasi dokker untuk diagnosis akurat
        </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingTop: 40,
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 4,
  },
  clearButton: { 
    padding: 4,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  botAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  botAvatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
  },
  botAvatarSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    overflow: 'hidden', // ← TAMBAHKAN INI
  },
  botAvatarSmallImage: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  onlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    marginRight: 6,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  chatContainer: {
    flex: 1,
  },
  chatArea: {
    flex: 1,
  },
  chatContent: {
    padding: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  botMessageContainer: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '75%',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userMessageBubble: {
    backgroundColor: '#10B981',
    borderBottomRightRadius: 4,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  botMessageBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  boldText: {
    fontWeight: '700',
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  botMessageText: {
    color: '#1F2937',
  },
  timestamp: {
    fontSize: 11,
    marginTop: 6,
  },
  userTimestamp: {
    color: '#FFFFFF',
    opacity: 0.8,
    textAlign: 'right',
  },
  botTimestamp: {
    color: '#9CA3AF',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  quickBubblesContainer: {
    marginTop: 16,
    marginBottom: 8,
  },
  quickBubblesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quickBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffffff',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#55d4a1ff',
    shadowColor: '#bc7676ff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  quickBubbleEmoji: {
    fontSize: 18,
    marginRight: 8,
  },
  quickBubbleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#56bc39ff',
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    top: 5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F9FAFB',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  disclaimer: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingHorizontal: 16,
    paddingBottom:20,
  },
});