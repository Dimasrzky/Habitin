// app/screens/chatbot/index.tsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
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

// Types
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface SuggestedQuestion {
  id: string;
  text: string;
  icon: keyof typeof Ionicons.glyphMap;
}

// Sample suggested questions
const SUGGESTED_QUESTIONS: SuggestedQuestion[] = [
  { id: '1', text: 'Apa itu diabetes?', icon: 'help-circle-outline' },
  { id: '2', text: 'Tips menjaga kesehatan jantung', icon: 'heart-outline' },
  { id: '3', text: 'Cara menurunkan kolesterol', icon: 'trending-down-outline' },
  { id: '4', text: 'Makanan sehat untuk diet', icon: 'nutrition-outline' },
];

// Bot responses (simple mock - you can integrate with AI API later)
const getBotResponse = (userMessage: string): string => {
  const lowerMessage = userMessage.toLowerCase();

  if (lowerMessage.includes('diabetes')) {
    return 'Diabetes adalah kondisi di mana kadar gula darah terlalu tinggi. Ada 2 tipe utama: Tipe 1 (tubuh tidak memproduksi insulin) dan Tipe 2 (tubuh tidak menggunakan insulin dengan baik). Penting untuk mengontrol gula darah dengan diet sehat, olahraga teratur, dan obat jika diperlukan.';
  }

  if (lowerMessage.includes('jantung')) {
    return 'Tips menjaga kesehatan jantung:\n\n1. Olahraga teratur 30 menit sehari\n2. Konsumsi makanan rendah lemak jenuh\n3. Hindari merokok dan alkohol\n4. Kelola stres dengan baik\n5. Cek tekanan darah secara rutin\n6. Tidur cukup 7-8 jam per hari';
  }

  if (lowerMessage.includes('kolesterol')) {
    return 'Cara menurunkan kolesterol:\n\n1. Kurangi makanan berlemak tinggi\n2. Konsumsi serat dari buah dan sayur\n3. Pilih minyak sehat seperti minyak zaitun\n4. Olahraga teratur minimal 150 menit/minggu\n5. Jaga berat badan ideal\n6. Hindari makanan cepat saji';
  }

  if (lowerMessage.includes('diet') || lowerMessage.includes('makanan')) {
    return 'Makanan sehat untuk diet:\n\n• Sayuran hijau (bayam, brokoli, kangkung)\n• Buah-buahan segar (apel, pisang, berry)\n• Protein tanpa lemak (ayam, ikan, tahu)\n• Karbohidrat kompleks (oat, quinoa, ubi)\n• Kacang-kacangan dan biji-bijian\n• Air putih minimal 8 gelas/hari';
  }

  if (lowerMessage.includes('halo') || lowerMessage.includes('hai') || lowerMessage.includes('hi')) {
    return 'Halo! Saya asisten kesehatan Habitin. Saya siap membantu Anda dengan informasi kesehatan. Ada yang bisa saya bantu?';
  }

  if (lowerMessage.includes('terima kasih') || lowerMessage.includes('thanks')) {
    return 'Sama-sama! Senang bisa membantu Anda. Jangan ragu untuk bertanya lagi ya!';
  }

  return 'Terima kasih atas pertanyaannya! Saya akan berusaha memberikan informasi kesehatan yang bermanfaat. Untuk pertanyaan lebih spesifik, silakan konsultasi dengan dokter profesional.';
};

export default function ChatbotScreen() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      text: 'Halo! Saya asisten kesehatan Habitin 👋\n\nSaya siap membantu Anda dengan informasi seputar kesehatan. Silakan pilih pertanyaan di bawah atau ketik pertanyaan Anda sendiri!',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);

  // Auto scroll to bottom when new message arrives
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

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
    setShowSuggestions(false);

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
    }, 1000);
  };

  const handleSuggestedQuestion = (question: string) => {
    handleSend(question);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
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
        <View style={styles.headerInfo}>
          <View style={styles.botAvatar}>
            <Ionicons name="chatbubble-ellipses" size={24} color="#FFFFFF" />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Asisten Kesehatan</Text>
            <Text style={styles.headerSubtitle}>Online • Siap membantu</Text>
          </View>
        </View>
        <View style={{ width: 24 }} />
      </View>

      {/* Chat Area */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.chatArea}
        contentContainerStyle={styles.chatContent}
        showsVerticalScrollIndicator={false}
      >
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
                <Ionicons name="chatbubble-ellipses" size={16} color="#FFFFFF" />
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
                {message.text}
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
              <Ionicons name="chatbubble-ellipses" size={16} color="#FFFFFF" />
            </View>
            <View style={[styles.messageBubble, styles.botMessageBubble]}>
              <View style={styles.typingIndicator}>
                <View style={styles.typingDot} />
                <View style={[styles.typingDot, styles.typingDotDelay1]} />
                <View style={[styles.typingDot, styles.typingDotDelay2]} />
              </View>
            </View>
          </View>
        )}

        {/* Suggested Questions */}
        {showSuggestions && messages.length === 1 && (
          <View style={styles.suggestionsContainer}>
            <Text style={styles.suggestionsTitle}>Pertanyaan Populer:</Text>
            {SUGGESTED_QUESTIONS.map((question) => (
              <Pressable
                key={question.id}
                style={({ pressed }) => [
                  styles.suggestionCard,
                  { opacity: pressed ? 0.7 : 1 },
                ]}
                onPress={() => handleSuggestedQuestion(question.text)}
              >
                <Ionicons
                  name={question.icon}
                  size={20}
                  color="#ABE7B2"
                  style={styles.suggestionIcon}
                />
                <Text style={styles.suggestionText}>{question.text}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Ketik pertanyaan Anda..."
            placeholderTextColor="#9CA3AF"
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />
          <Pressable
            onPress={() => handleSend()}
            disabled={!inputText.trim()}
            style={({ pressed }) => [
              styles.sendButton,
              {
                opacity: inputText.trim() ? (pressed ? 0.7 : 1) : 0.5,
              },
            ]}
          >
            <Ionicons
              name="send"
              size={20}
              bottom={6}
              color={inputText.trim() ? '#30bb30ff' : '#30bb30ff'}
            />
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
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
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  botAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#93BFC7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#ABE7B2',
  },
  chatArea: {
    flex: 1,
  },
  chatContent: {
    padding: 16,
    paddingBottom: 8,
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
    backgroundColor: '#93BFC7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: '75%',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  userMessageBubble: {
    backgroundColor: '#ABE7B2',
    borderBottomRightRadius: 4,
  },
  botMessageBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userMessageText: {
    color: '#1F2937',
  },
  botMessageText: {
    color: '#374151',
  },
  timestamp: {
    fontSize: 10,
    marginTop: 4,
  },
  userTimestamp: {
    color: '#065F46',
    textAlign: 'right',
  },
  botTimestamp: {
    color: '#9CA3AF',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#9CA3AF',
  },
  typingDotDelay1: {
    opacity: 0.7,
  },
  typingDotDelay2: {
    opacity: 0.5,
  },
  suggestionsContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
  },
  suggestionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  suggestionIcon: {
    marginRight: 12,
  },
  suggestionText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
    maxHeight: 100,
    paddingVertical: 6,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ABE7B2',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});
