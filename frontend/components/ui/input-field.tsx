import React from 'react';
import { TextInput, TextInputProps, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

interface InputFieldProps extends TextInputProps {
  label: string;
  error?: string;
}

export function InputField({ label, error, style, ...props }: InputFieldProps) {
  const borderColor = useThemeColor({}, 'icon');
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({ light: '#f8f9fa', dark: '#2c2c2c' }, 'background');

  return (
    <View style={styles.container}>
      <ThemedText type="defaultSemiBold" style={styles.label}>
        {label}
      </ThemedText>
      <TextInput
        style={[
          styles.input,
          {
            borderColor: error ? '#ff6b6b' : borderColor,
            color: textColor,
            backgroundColor,
          },
          style,
        ]}
        placeholderTextColor={borderColor}
        {...props}
      />
      {error && (
        <ThemedText style={[styles.errorText, { color: '#ff6b6b' }]}>
          {error}
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    marginBottom: 6,
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 50,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
});