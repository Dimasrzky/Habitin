// app/screens/chatbot/index.tsx
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
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

interface QuickChatCard {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  gradient: string[];
  question: string;
}

// =====================================================
// QUICK CHAT CARDS DATA
// =====================================================

const QUICK_CHAT_BUBBLES = [
  { id: '4', icon: '💼', text: 'Buat hariku jadi lebih produktif', question: 'Tips meningkatkan produktivitas harian' },
  { id: '5', icon: '🩺', text: 'Info Diabetes', question: 'Apa itu diabetes dan cara mencegahnya?' },
  { id: '6', icon: '❤️', text: 'Kesehatan Jantung', question: 'Tips menjaga kesehatan jantung' },
  { id: '7', icon: '🥗', text: 'Diet Sehat', question: 'Panduan makanan sehat untuk diet' },
  { id: '8', icon: '🏃', text: 'Olahraga', question: 'Berapa lama harus olahraga per hari?' },
];


// =====================================================
// BOT RESPONSE LOGIC
// =====================================================

const getBotResponse = (userMessage: string): string => {
  const lowerMessage = userMessage.toLowerCase();

  if (lowerMessage.includes('diabetes')) {
    return '🩺 **Diabetes: Panduan Lengkap**\n\nDiabetes adalah kondisi kronis di mana kadar gula darah terlalu tinggi.\n\n**Tipe Diabetes:**\n• Tipe 1: Tubuh tidak memproduksi insulin\n• Tipe 2: Tubuh tidak menggunakan insulin dengan baik\n\n**Cara Mencegah:**\n✅ Jaga berat badan ideal\n✅ Olahraga teratur 150 menit/minggu\n✅ Konsumsi makanan rendah gula\n✅ Hindari makanan olahan\n✅ Cek gula darah rutin\n\n💡 Konsultasikan dengan dokter untuk pemeriksaan lebih lanjut!';
  }

  if (lowerMessage.includes('jantung') || lowerMessage.includes('heart')) {
    return '❤️ **Tips Menjaga Kesehatan Jantung**\n\n**Gaya Hidup Sehat:**\n1️⃣ Olahraga aerobik 30 menit/hari\n2️⃣ Konsumsi makanan rendah lemak jenuh\n3️⃣ Perbanyak omega-3 dari ikan\n4️⃣ Kelola stres dengan meditasi\n5️⃣ Hindari merokok & alkohol\n6️⃣ Tidur cukup 7-8 jam/hari\n\n**Makanan Baik untuk Jantung:**\n🥗 Sayuran hijau\n🐟 Ikan salmon & tuna\n🥜 Kacang-kacangan\n🫒 Minyak zaitun\n🍎 Buah berry\n\n⚠️ Cek tekanan darah rutin minimal 6 bulan sekali!';
  }

  if (lowerMessage.includes('kolesterol')) {
    return '📊 **Cara Menurunkan Kolesterol**\n\n**Perubahan Pola Makan:**\n🥬 Perbanyak serat larut (oat, apel, wortel)\n🚫 Hindari lemak trans & jenuh\n🫒 Gunakan minyak sehat (zaitun, kanola)\n🐟 Konsumsi ikan omega-3 2x/minggu\n🥜 Tambahkan kacang almond\n\n**Lifestyle:**\n🏃 Olahraga 150 menit/minggu\n⚖️ Jaga berat badan ideal\n🚭 Berhenti merokok\n😴 Tidur teratur\n\n**Target Kolesterol:**\n• Total: < 200 mg/dL\n• LDL (jahat): < 100 mg/dL\n• HDL (baik): > 60 mg/dL\n\n💊 Konsultasi dokter jika perlu obat penurun kolesterol.';
  }

  if (lowerMessage.includes('diet') || lowerMessage.includes('makanan')) {
    return '🍎 **Panduan Makanan Diet Sehat**\n\n**Sayuran (50% piring):**\n🥬 Bayam, brokoli, kangkung\n🥕 Wortel, tomat, paprika\n🥒 Timun, selada, kubis\n\n**Protein (25% piring):**\n🍗 Ayam tanpa kulit\n🐟 Ikan (salmon, tuna, kakap)\n🥚 Telur rebus\n🫘 Tahu, tempe, edamame\n\n**Karbohidrat (25% piring):**\n🍚 Nasi merah, quinoa\n🍠 Ubi, kentang rebus\n🌾 Oat, gandum utuh\n\n**Snack Sehat:**\n🥜 Kacang almond, walnut\n🍎 Buah segar (apel, pisang, berry)\n🥤 Yogurt plain\n\n💧 Minum air putih minimal 8 gelas/hari!\n\n⏰ **Jadwal Makan:**\n• Sarapan: 07.00-08.00\n• Makan Siang: 12.00-13.00\n• Makan Malam: 18.00-19.00';
  }

  if (lowerMessage.includes('olahraga') || lowerMessage.includes('exercise')) {
    return '🏃 **Panduan Olahraga yang Tepat**\n\n**Frekuensi Ideal:**\n📅 Minimal 150 menit/minggu\n📅 Atau 30 menit x 5 hari/minggu\n\n**Jenis Olahraga:**\n\n**Cardio (3-5x/minggu):**\n🏃 Jogging, lari\n🚴 Bersepeda\n🏊 Renang\n🚶 Jalan cepat\n\n**Strength Training (2-3x/minggu):**\n💪 Angkat beban\n🧘 Bodyweight exercises\n🤸 Push-up, squat, plank\n\n**Flexibility (Setiap hari):**\n🧘‍♀️ Yoga\n🤸 Stretching\n\n**Tips:**\n✅ Mulai dengan intensitas ringan\n✅ Tingkatkan bertahap\n✅ Istirahat 1-2 hari/minggu\n✅ Pemanasan 5-10 menit\n✅ Pendinginan 5-10 menit\n\n⚠️ Konsultasi dokter sebelum memulai program olahraga berat!';
  }

  if (lowerMessage.includes('tidur') || lowerMessage.includes('sleep')) {
    return '😴 **Panduan Tidur Berkualitas**\n\n**Durasi Ideal:**\n• Dewasa: 7-9 jam/malam\n• Remaja: 8-10 jam/malam\n• Lansia: 7-8 jam/malam\n\n**Tips Tidur Nyenyak:**\n\n🌙 **Sebelum Tidur:**\n✅ Matikan gadget 1 jam sebelumnya\n✅ Redupkan lampu kamar\n✅ Suhu ruangan sejuk (18-22°C)\n✅ Hindari kafein 6 jam sebelumnya\n✅ Mandi air hangat\n\n📅 **Rutinitas:**\n✅ Tidur & bangun di jam yang sama\n✅ Hindari tidur siang > 30 menit\n✅ Olahraga teratur (tidak dekat jam tidur)\n✅ Hindari makan berat 2-3 jam sebelum tidur\n\n🧘 **Relaksasi:**\n• Meditasi 10 menit\n• Pernapasan dalam\n• Baca buku ringan\n\n⚠️ Jika insomnia berlanjut > 2 minggu, konsultasi dokter!';
  }

  if (lowerMessage.includes('halo') || lowerMessage.includes('hai') || lowerMessage.includes('hi') || lowerMessage.includes('hello')) {
    return '👋 **Halo! Selamat datang di Asisten Kesehatan Habitin!**\n\nSaya siap membantu Anda dengan:\n\n🩺 Informasi kesehatan\n💊 Tips pencegahan penyakit\n🥗 Panduan nutrisi & diet\n🏃 Program olahraga\n😴 Kualitas tidur\n\nSilakan pilih topik di bawah atau tanyakan langsung kepada saya! 😊';
  }

  if (lowerMessage.includes('terima kasih') || lowerMessage.includes('thanks') || lowerMessage.includes('thank you')) {
    return '🙏 **Sama-sama!**\n\nSenang bisa membantu Anda! 😊\n\nJangan ragu untuk bertanya lagi kapan saja. Kesehatan Anda adalah prioritas kami!\n\n💚 **Stay healthy with Habitin!**';
  }

  return '💬 Terima kasih atas pertanyaannya!\n\nUntuk informasi kesehatan yang lebih spesifik dan personal, saya sarankan untuk berkonsultasi langsung dengan dokter profesional.\n\n📍 **Anda bisa:**\n• Kunjungi klinik/rumah sakit terdekat\n• Konsultasi online dengan dokter\n• Hubungi hotline kesehatan: 119\n\nAda pertanyaan lain yang bisa saya bantu? 😊';
};

// =====================================================
// MAIN COMPONENT
// =====================================================

export default function ChatbotScreen() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      text: '👋 Halo! Saya **Asisten Kesehatan Habitin**.\n\nSaya siap membantu Anda dengan informasi kesehatan yang terpercaya.\n\n✨ Pilih topik di bawah atau ketik pertanyaan Anda sendiri!',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickChats, setShowQuickChats] = useState(true);

  // Animation
  const typingDot1 = useRef(new Animated.Value(0)).current;
  const typingDot2 = useRef(new Animated.Value(0)).current;
  const typingDot3 = useRef(new Animated.Value(0)).current;

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

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setShowQuickChats(false);

    // Show typing indicator
    setIsTyping(true);

    // Simulate bot thinking time
    setTimeout(() => {
      const botResponse = getBotResponse(messageText);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleQuickChat = (question: string) => {
    handleSend(question);
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
              <Ionicons name="sparkles" size={24} color="#10B981" />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>Asisten Kesehatan</Text>
              <View style={styles.onlineIndicator}>
                <View style={styles.onlineDot} />
                <Text style={styles.headerSubtitle}>Online</Text>
              </View>
            </View>
          </View>
          <View style={{ width: 24 }} />
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
                  <Ionicons name="sparkles" size={14} color="#10B981" />
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
                <Ionicons name="sparkles" size={14} color="#10B981" />
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