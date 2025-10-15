import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { healthApi, ChatResponse } from '../services/healthApi';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  messageType?: string;
}

interface HealthChatBotProps {
  onClose?: () => void;
  initialMessage?: string;
}

const HealthChatBot: React.FC<HealthChatBotProps> = ({ onClose, initialMessage }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedMessageType, setSelectedMessageType] = useState<'general' | 'allergy' | 'medication' | 'emergency'>('general');
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    // Add welcome message
    const welcomeMessage: Message = {
      id: 'welcome',
      text: "Hello! I'm your AI Health Assistant. I can help you with questions about allergies, medications, and general health concerns. How can I assist you today?",
      isUser: false,
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);

    // Send initial message if provided
    if (initialMessage) {
      handleSendMessage(initialMessage);
    }
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom when new messages are added
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const handleSendMessage = async (messageText?: string) => {
    const text = messageText || inputText.trim();
    if (!text) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser: true,
      timestamp: new Date(),
      messageType: selectedMessageType,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    try {
      const response = await healthApi.sendChatMessage(text, selectedMessageType);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.response,
        isUser: false,
        timestamp: new Date(),
        messageType: response.message_type,
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error: any) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, I'm having trouble responding right now. Please try again or consult with a healthcare professional for important health questions.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      console.error('Chat error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case 'allergy': return '#FF6B6B';
      case 'medication': return '#4ECDC4';
      case 'emergency': return '#FF4444';
      case 'general': return '#6C5CE7';
      default: return '#666';
    }
  };

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case 'allergy': return 'warning-outline';
      case 'medication': return 'medical-outline';
      case 'emergency': return 'alert-circle-outline';
      case 'general': return 'chatbubble-outline';
      default: return 'information-circle-outline';
    }
  };

  const clearChat = () => {
    Alert.alert(
      'Clear Chat',
      'Are you sure you want to clear all messages?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: () => {
            setMessages([]);
            setInputText('');
          }
        },
      ]
    );
  };

  const suggestedQuestions = [
    { text: "Is it safe to take ibuprofen with my allergies?", type: 'medication' as const },
    { text: "I have a rash after taking medication", type: 'allergy' as const },
    { text: "What should I do if I miss a dose?", type: 'medication' as const },
    { text: "How do I know if I'm having an allergic reaction?", type: 'allergy' as const },
  ];

  const renderMessage = (message: Message) => (
    <View key={message.id} style={[styles.messageContainer, message.isUser ? styles.userMessage : styles.botMessage]}>
      <View style={[styles.messageBubble, message.isUser ? styles.userBubble : styles.botBubble]}>
        {!message.isUser && message.messageType && (
          <View style={styles.messageTypeIndicator}>
            <Ionicons 
              name={getMessageTypeIcon(message.messageType) as any} 
              size={12} 
              color={getMessageTypeColor(message.messageType)} 
            />
            <Text style={[styles.messageTypeText, { color: getMessageTypeColor(message.messageType) }]}>
              {message.messageType}
            </Text>
          </View>
        )}
        <Text style={[styles.messageText, message.isUser ? styles.userText : styles.botText]}>
          {message.text}
        </Text>
        <Text style={styles.timestamp}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.aiIndicator}>
              <Ionicons name="sparkles" size={16} color="#8B5CF6" />
            </View>
            <Text style={styles.headerTitle}>AI Health Assistant</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={clearChat} style={styles.headerButton}>
              <Ionicons name="trash-outline" size={20} color="#666" />
            </TouchableOpacity>
            {onClose && (
              <TouchableOpacity onPress={onClose} style={styles.headerButton}>
                <Ionicons name="close" size={20} color="#666" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Messages */}
        <ScrollView 
          ref={scrollViewRef}
          style={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.messagesContent}
        >
          {messages.map(renderMessage)}
          
          {/* Loading indicator */}
          {loading && (
            <View style={[styles.messageContainer, styles.botMessage]}>
              <View style={[styles.messageBubble, styles.botBubble, styles.loadingBubble]}>
                <ActivityIndicator size="small" color="#666" />
                <Text style={styles.loadingText}>AI is thinking...</Text>
              </View>
            </View>
          )}

          {/* Suggested questions when chat is empty */}
          {messages.length === 0 && !loading && (
            <View style={styles.suggestionsContainer}>
              <Text style={styles.suggestionsTitle}>Try asking:</Text>
              {suggestedQuestions.map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestionButton}
                  onPress={() => {
                    setSelectedMessageType(suggestion.type);
                    handleSendMessage(suggestion.text);
                  }}
                >
                  <Ionicons 
                    name={getMessageTypeIcon(suggestion.type) as any} 
                    size={16} 
                    color={getMessageTypeColor(suggestion.type)} 
                  />
                  <Text style={styles.suggestionText}>{suggestion.text}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Input Section */}
        <View style={styles.inputSection}>
          {/* Message Type Selector */}
          <View style={styles.messageTypeSelector}>
            {['general', 'allergy', 'medication', 'emergency'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeButton,
                  selectedMessageType === type && styles.typeButtonSelected
                ]}
                onPress={() => setSelectedMessageType(type as any)}
              >
                <Ionicons 
                  name={getMessageTypeIcon(type) as any} 
                  size={16} 
                  color={selectedMessageType === type ? '#fff' : getMessageTypeColor(type)} 
                />
                <Text style={[
                  styles.typeButtonText,
                  selectedMessageType === type && styles.typeButtonTextSelected
                ]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Input Bar */}
          <View style={styles.inputBar}>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask a health question..."
              multiline
              maxLength={500}
              editable={!loading}
            />
            <TouchableOpacity
              style={[styles.sendButton, (!inputText.trim() || loading) && styles.sendButtonDisabled]}
              onPress={() => handleSendMessage()}
              disabled={!inputText.trim() || loading}
            >
              <Ionicons name="send" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Disclaimer */}
          <View style={styles.disclaimer}>
            <Ionicons name="information-circle-outline" size={12} color="#999" />
            <Text style={styles.disclaimerText}>
              For emergencies, call emergency services. This AI provides general information only.
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const { width: screenWidth } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  keyboardContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  aiIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f0ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    padding: 8,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },
  messageContainer: {
    marginBottom: 16,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  botMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: screenWidth * 0.8,
    borderRadius: 16,
    padding: 12,
  },
  userBubble: {
    backgroundColor: '#007AFF',
  },
  botBubble: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  messageTypeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  messageTypeText: {
    fontSize: 10,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#fff',
  },
  botText: {
    color: '#333',
  },
  timestamp: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  suggestionsContainer: {
    marginTop: 32,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  suggestionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  suggestionText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    lineHeight: 18,
  },
  inputSection: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  messageTypeSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    gap: 4,
  },
  typeButtonSelected: {
    backgroundColor: '#007AFF',
  },
  typeButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  typeButtonTextSelected: {
    color: '#fff',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginBottom: 8,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
    backgroundColor: '#fafafa',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 4,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 10,
    color: '#999',
    lineHeight: 14,
  },
});

export default HealthChatBot;