import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  style?: ViewStyle;
  loading?: boolean;
}

export function Button({ 
  title, 
  onPress, 
  variant = 'primary', 
  disabled = false, 
  style,
  loading = false 
}: ButtonProps) {
  const tintColor = useThemeColor({}, 'tint');
  const buttonBackgroundColor = useThemeColor({ light: '#f8f9fa', dark: '#374151' }, 'background');
  const buttonTextColor = useThemeColor({ light: '#374151', dark: '#f8f9fa' }, 'text'); // High contrast button text
  const disabledColor = useThemeColor({ light: '#e0e0e0', dark: '#4a5568' }, 'background');
  
  const getButtonStyle = () => {
    const baseStyle = [styles.button, style];
    
    if (disabled || loading) {
      return [...baseStyle, { backgroundColor: disabledColor }];
    }
    
    switch (variant) {
      case 'primary':
        return [...baseStyle, { backgroundColor: tintColor }];
      case 'secondary':
        return [...baseStyle, styles.secondary, { 
          borderColor: buttonTextColor, 
          backgroundColor: buttonBackgroundColor 
        }];
      case 'danger':
        return [...baseStyle, { backgroundColor: '#F44336' }];
      default:
        return [...baseStyle, { backgroundColor: tintColor }];
    }
  };

  const getTextColor = () => {
    if (disabled || loading) return useThemeColor({ light: '#999', dark: '#6b7280' }, 'text');
    if (variant === 'secondary') return buttonTextColor;
    if (variant === 'primary') return '#000000'; // Dark text for CTA buttons
    return '#fff';
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      <ThemedText 
        type="defaultSemiBold" 
        style={[styles.text, { color: getTextColor() }]}
      >
        {loading ? 'Loading...' : title}
      </ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
  },
  disabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  text: {
    fontSize: 16,
  },
});