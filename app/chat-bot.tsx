import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  ScrollView, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform,
  TouchableOpacity,
  Alert,
  Animated
} from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomNavBar } from '@/components/ui/bottom-nav-bar';
import { useThemeColor } from '@/hooks/use-theme-color';
import { healthApi } from '@/services/healthApi';

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  status: 'sending' | 'delivered' | 'failed';
  messageType: 'text' | 'suggestion' | 'system';
}

interface MessageBubbleProps {
  message: ChatMessage;
  onRetry?: () => void;
}

interface MessageBubbleColors {
  tintColor: string;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  timestampColor: string;
}

interface ExtendedMessageBubbleProps extends MessageBubbleProps {
  colors: MessageBubbleColors;
}

function MessageBubble({ message, onRetry, colors }: ExtendedMessageBubbleProps) {
  const { tintColor, backgroundColor, borderColor, textColor, timestampColor } = colors;
  
  return (
    <View style={[
      styles.messageBubble,
      message.isUser ? styles.userMessage : styles.assistantMessage,
    ]}>
      <View style={[
        styles.messageContainer,
        {
          backgroundColor: message.isUser ? tintColor : backgroundColor,
          borderColor: message.isUser ? 'transparent' : borderColor,
          borderWidth: message.isUser ? 0 : 1,
        }
      ]}>
        <ThemedText style={[
          styles.messageText,
          { 
            color: message.isUser ? '#ffffff' : textColor,
            fontWeight: message.messageType === 'system' ? '500' : '400'
          }
        ]}>
          {message.text}
        </ThemedText>
        
        <View style={styles.messageFooter}>
          <ThemedText style={[
            styles.timestamp,
            { color: message.isUser ? '#ffffff80' : timestampColor }
          ]}>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </ThemedText>
          
          {message.isUser && (
            <View style={styles.statusContainer}>
              {message.status === 'sending' && (
                <ThemedText style={[styles.statusIcon, { color: '#ffffff60' }]}>○</ThemedText>
              )}
              {message.status === 'delivered' && (
                <ThemedText style={[styles.statusIcon, { color: '#ffffff80' }]}>✓✓</ThemedText>
              )}
              {message.status === 'failed' && (
                <TouchableOpacity onPress={onRetry} style={styles.retryButton}>
                  <ThemedText style={[styles.statusIcon, { color: '#ff4757' }]}>⟲</ThemedText>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

interface TypingIndicatorProps {
  backgroundColor: string;
  borderColor: string;
}

function TypingIndicator({ backgroundColor, borderColor }: TypingIndicatorProps) {
  
  return (
    <View style={[styles.messageBubble, styles.assistantMessage]}>
      <View style={[
        styles.messageContainer,
        styles.typingContainer,
        { backgroundColor, borderColor }
      ]}>
        <View style={styles.typingDots}>
          <View style={[styles.dot, styles.dot1]} />
          <View style={[styles.dot, styles.dot2]} />
          <View style={[styles.dot, styles.dot3]} />
        </View>
        <ThemedText style={styles.typingText}>
          AI Assistant is analyzing your question...
        </ThemedText>
      </View>
    </View>
  );
}

export default function ChatBotScreen() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  
  // All theme colors at the top to avoid React Compiler issues
  const backgroundColor = useThemeColor({}, 'background');
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({ light: '#e9ecef', dark: '#404040' }, 'icon');
  const textColor = useThemeColor({}, 'text');
  const placeholderTextColor = useThemeColor({ light: '#9ca3af', dark: '#6b7280' }, 'text');
  const suggestionBackgroundColor = useThemeColor({ light: '#f8fafc', dark: '#1f2937' }, 'background');
  const buttonBackgroundColor = useThemeColor({ light: '#f8f9fa', dark: '#374151' }, 'background');
  const buttonTextColor = useThemeColor({ light: '#374151', dark: '#f8f9fa' }, 'text'); // High contrast button text
  const messageBubbleBackgroundColor = useThemeColor({ light: '#f8f9fa', dark: '#2c2c2c' }, 'background');
  const timestampColor = useThemeColor({ light: '#6c757d', dark: '#adb5bd' }, 'text');
  
  // Message bubble colors object
  const messageBubbleColors: MessageBubbleColors = {
    tintColor,
    backgroundColor: messageBubbleBackgroundColor,
    borderColor,
    textColor,
    timestampColor,
  };
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: "Hello! I'm your AI Health Assistant. I can help you with drug safety information, medication interactions, side effects analysis, and general health guidance.\n\nHow can I assist you today?",
      isUser: false,
      timestamp: new Date(),
      status: 'delivered',
      messageType: 'system',
    },
  ]);
  
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline' | 'connecting'>('online');
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [isInputFocused, setIsInputFocused] = useState(false);

  const suggestedQuestions = [
    "Is it safe to take multiple medications together?",
    "What should I do about medication side effects?",
    "How do I identify drug allergic reactions?",
    "Can I take expired medications safely?",
    "What's the difference between generic and brand drugs?",
    "How do I manage medication interactions?",
  ];

  useEffect(() => {
    // Auto scroll to bottom when new messages are added
    const timer = setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
    
    return () => clearTimeout(timer);
  }, [messages, isTyping]);

  const sendMessage = async (messageText: string) => {
    try {
      if (!messageText.trim() || isTyping) return;

      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        text: messageText.trim(),
        isUser: true,
        timestamp: new Date(),
        status: 'sending',
        messageType: 'text',
      };

      setMessages(prev => [...prev, userMessage]);
      setInputText('');
      setIsTyping(true);
      setConnectionStatus('connecting');

      // Update message status to delivered
      setTimeout(() => {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === userMessage.id 
              ? { ...msg, status: 'delivered' as const }
              : msg
          )
        );
      }, 500);

      const response = await healthApi.chatWithAI(messageText.trim());
      setConnectionStatus('online');
      
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: response.response,
        isUser: false,
        timestamp: new Date(),
        status: 'delivered',
        messageType: 'text',
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      setConnectionStatus('offline');
      
      // Find the user message and mark it as failed
      setMessages(prev => 
        prev.map(msg => 
          msg.isUser && msg.text === messageText.trim()
            ? { ...msg, status: 'failed' as const }
            : msg
        )
      );
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 2).toString(),
        text: "I'm currently experiencing technical difficulties. Please check your connection and try again. For urgent medical concerns, contact a healthcare professional immediately.",
        isUser: false,
        timestamp: new Date(),
        status: 'delivered',
        messageType: 'system',
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    try {
      setIsInputFocused(false); // Reset focus state
      sendMessage(question);
    } catch (error) {
      console.error('Error handling suggested question:', error);
      Alert.alert('Error', 'Failed to send suggestion. Please try again.');
    }
  };

  const clearChat = () => {
    Alert.alert(
      'Clear Conversation',
      'Are you sure you want to clear all messages? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            setMessages([
              {
                id: '1',
                text: "Hello! I'm your AI Health Assistant. I can help you with drug safety information, medication interactions, side effects analysis, and general health guidance.\n\nHow can I assist you today?",
                isUser: false,
                timestamp: new Date(),
                status: 'delivered',
                messageType: 'system',
              },
            ]);
          },
        },
      ]
    );
  };

  const retryFailedMessage = (messageId: string) => {
    const failedMessage = messages.find(msg => msg.id === messageId);
    if (failedMessage && failedMessage.isUser) {
      sendMessage(failedMessage.text);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        {/* Professional Header */}
        <View style={[styles.header, { backgroundColor, borderBottomColor: borderColor }]}>
          <View style={styles.headerContent}>            
            <View style={styles.headerCenter}>
              <ThemedText style={styles.headerTitle}>
                AI Health Assistant
              </ThemedText>
              <View style={styles.headerStatusContainer}>
                <View style={[
                  styles.statusDot,
                  { backgroundColor: connectionStatus === 'online' ? '#22c55e' : 
                    connectionStatus === 'connecting' ? '#f59e0b' : '#ef4444' }
                ]} />
                <ThemedText style={styles.statusText}>
                  {connectionStatus === 'online' ? 'Online' : 
                   connectionStatus === 'connecting' ? 'Connecting...' : 'Offline'}
                </ThemedText>
              </View>
            </View>
            
            <TouchableOpacity 
              style={[
                styles.clearButton,
                { 
                  backgroundColor: buttonBackgroundColor,
                  borderColor: buttonTextColor,
                  borderWidth: 1.5,
                }
              ]}
              onPress={clearChat}
            >
              <ThemedText style={[styles.clearButtonText, { color: buttonTextColor }]}>
                Clear
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Chat Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.chatContainer}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map((message) => (
            <MessageBubble 
              key={message.id} 
              message={message} 
              colors={messageBubbleColors}
              onRetry={() => retryFailedMessage(message.id)}
            />
          ))}
          
          {isTyping && (
            <TypingIndicator 
              backgroundColor={messageBubbleBackgroundColor} 
              borderColor={borderColor} 
            />
          )}
        </ScrollView>

        {/* Suggested Questions */}
        {showSuggestions && !isTyping && !isInputFocused && (
          <View style={[styles.suggestionsContainer, { borderTopColor: borderColor }]}>
            <ThemedText style={styles.suggestionsTitle}>
              {messages.length <= 1 ? 'Suggested Questions:' : 'Quick Questions:'}
            </ThemedText>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.suggestionsContent}
            >
              {suggestedQuestions.map((question, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.suggestionButton, 
                    { 
                      borderColor: buttonTextColor,
                      backgroundColor: suggestionBackgroundColor,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.15,
                      shadowRadius: 3,
                      elevation: 3,
                    }
                  ]}
                  onPress={() => handleSuggestedQuestion(question)}
                >
                  <ThemedText style={[styles.suggestionText, { color: buttonTextColor }]}>
                    {question}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Show Suggestions Button when hidden and not typing */}
        {!showSuggestions && !isTyping && !isInputFocused && (
          <View style={[styles.showSuggestionsContainer, { borderTopColor: borderColor }]}>
            <TouchableOpacity 
              style={[styles.showSuggestionsButton, { backgroundColor: tintColor }]}
              onPress={() => setShowSuggestions(true)}
            >
              <ThemedText style={styles.showSuggestionsButtonText}>
                💡 Show Quick Questions
              </ThemedText>
            </TouchableOpacity>
          </View>
        )}

        {/* Message Input */}
        <View style={[styles.inputContainer, { backgroundColor, borderTopColor: borderColor }]}>
          <View style={[styles.inputWrapper, { borderColor }]}>
            <TextInput
              style={[styles.textInput, { color: textColor }]}
              placeholder="Type your health question here..."
              placeholderTextColor={placeholderTextColor}
              value={inputText}
              onChangeText={(text) => {
                try {
                  setInputText(text);
                } catch (error) {
                  console.error('Error updating input text:', error);
                }
              }}
              onFocus={() => {
                try {
                  setIsInputFocused(true);
                } catch (error) {
                  console.error('Error handling focus:', error);
                }
              }}
              onBlur={() => {
                try {
                  setIsInputFocused(false);
                } catch (error) {
                  console.error('Error handling blur:', error);
                }
              }}
              multiline
              maxLength={1000}
              editable={!isTyping}
              blurOnSubmit={false}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                { 
                  backgroundColor: (inputText.trim() && !isTyping) ? tintColor : '#d1d5db',
                }
              ]}
              onPress={() => {
                try {
                  sendMessage(inputText);
                } catch (error) {
                  console.error('Error sending message:', error);
                  Alert.alert('Error', 'Failed to send message. Please try again.');
                }
              }}
              disabled={!inputText.trim() || isTyping}
            >
              <ThemedText style={styles.sendButtonText}>
                {isTyping ? '...' : 'Send'}
              </ThemedText>
            </TouchableOpacity>
          </View>
          
          <ThemedText style={styles.disclaimer}>
            ⚠ This AI provides general information only. Always consult healthcare professionals for medical advice.
          </ThemedText>
        </View>
      </KeyboardAvoidingView>
      <BottomNavBar />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    minHeight: Platform.OS === 'ios' ? 100 : 80,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },

  headerCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    paddingVertical: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'center',
  },
  headerStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
    paddingVertical: 2,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '500',
    opacity: 0.9,
  },
  clearButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    minWidth: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  chatContainer: {
    flex: 1,
  },
  chatContent: {
    padding: 16,
    paddingBottom: 20,
  },
  messageBubble: {
    marginVertical: 4,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  assistantMessage: {
    alignItems: 'flex-start',
  },
  messageContainer: {
    maxWidth: '85%',
    borderRadius: 18,
    borderWidth: 1,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  timestamp: {
    fontSize: 12,
  },
  statusContainer: {
    marginLeft: 8,
  },
  statusIcon: {
    fontSize: 12,
  },
  retryButton: {
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  typingContainer: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  typingDots: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6b7280',
  },
  dot1: {
    // Animation handled by Animated API if needed
  },
  dot2: {
    // Animation handled by Animated API if needed
  },
  dot3: {
    // Animation handled by Animated API if needed
  },
  typingText: {
    fontSize: 12,
    opacity: 0.7,
  },
  suggestionsContainer: {
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 8,
    borderTopWidth: 1,
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  showSuggestionsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  showSuggestionsButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
  },
  showSuggestionsButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  suggestionsContent: {
    paddingRight: 16,
  },
  suggestionButton: {
    borderWidth: 2,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginRight: 12,
    maxWidth: 300,
    minHeight: 44,
    justifyContent: 'center',
  },
  suggestionText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 20,
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    borderTopWidth: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
    minHeight: 48,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 12,
    textAlignVertical: 'center',
  },
  sendButton: {
    borderRadius: 22,
    paddingHorizontal: 24,
    paddingVertical: 12,
    minWidth: 70,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  sendButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  disclaimer: {
    fontSize: 11,
    opacity: 0.7,
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 8,
  },
});