import React from 'react';
import { TouchableOpacity, StyleSheet, View, ViewStyle } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';

interface HomeCardProps {
  title: string;
  description: string;
  icon: string;
  onPress: () => void;
  style?: ViewStyle;
  delay?: number;
}

export function HomeCard({ title, description, icon, onPress, style, delay = 0 }: HomeCardProps) {
  const tintColor = useThemeColor({}, 'tint');
  const cardBackground = useThemeColor({ light: '#fff', dark: '#2c2c2c' }, 'background');

  return (
    <Animatable.View
      animation="fadeInUp"
      delay={delay}
      duration={600}
      style={[styles.container, style]}
    >
      <TouchableOpacity
        style={[
          styles.card,
          {
            backgroundColor: cardBackground,
            shadowColor: tintColor,
          },
        ]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <View style={[styles.iconContainer, { backgroundColor: tintColor + '20' }]}>
          <ThemedText style={[styles.icon, { color: tintColor }]}>{icon}</ThemedText>
        </View>
        <View style={styles.content}>
          <ThemedText type="defaultSemiBold" style={styles.title}>
            {title}
          </ThemedText>
          <ThemedText style={styles.description}>
            {description}
          </ThemedText>
        </View>
        <View style={[styles.arrow, { borderLeftColor: tintColor }]} />
      </TouchableOpacity>
    </Animatable.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  icon: {
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    opacity: 0.7,
  },
  arrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderTopWidth: 6,
    borderBottomWidth: 6,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
});