import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

type RiskLevel = 'Low' | 'Medium' | 'High';

interface ResultCardProps {
  risk: RiskLevel;
  advice: string;
  style?: ViewStyle;
  animated?: boolean;
}

const getRiskColor = (risk: RiskLevel): string => {
  switch (risk) {
    case 'Low':
      return '#4CAF50'; // Green
    case 'Medium':
      return '#FF9800'; // Orange
    case 'High':
      return '#F44336'; // Red
    default:
      return '#757575'; // Gray
  }
};

const getRiskEmoji = (risk: RiskLevel): string => {
  switch (risk) {
    case 'Low':
      return '🟢';
    case 'Medium':
      return '🟠';
    case 'High':
      return '🔴';
    default:
      return '⚪';
  }
};

export function ResultCard({ risk, advice, style, animated = true }: ResultCardProps) {
  const riskColor = getRiskColor(risk);
  const emoji = getRiskEmoji(risk);

  const CardComponent = animated ? Animatable.View : View;
  const cardProps = animated ? { animation: 'fadeInUp', duration: 800 } : {};

  return (
    <CardComponent {...cardProps} style={[styles.container, style]}>
      <ThemedView style={[styles.card, { borderLeftColor: riskColor }]}>
        <View style={styles.header}>
          <ThemedText style={[styles.emoji, { fontSize: 24 }]}>{emoji}</ThemedText>
          <ThemedText type="title" style={[styles.riskTitle, { color: riskColor }]}>
            {risk} Risk
          </ThemedText>
        </View>
        <View style={styles.divider} />
        <ThemedText style={styles.advice}>{advice}</ThemedText>
        {risk === 'High' && (
          <View style={[styles.warningBanner, { backgroundColor: riskColor + '20' }]}>
            <ThemedText style={[styles.warningText, { color: riskColor }]}>
              ⚠️ Consult your doctor immediately
            </ThemedText>
          </View>
        )}
      </ThemedView>
    </CardComponent>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  emoji: {
    marginRight: 12,
  },
  riskTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 12,
  },
  advice: {
    fontSize: 16,
    lineHeight: 24,
  },
  warningBanner: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
  },
  warningText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});