import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as Animatable from 'react-native-animatable';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { InputField } from '@/components/ui/input-field';
import { Button } from '@/components/ui/button';
import { BottomNavBar } from '@/components/ui/bottom-nav-bar';
import { healthApi, SymptomAnalysisResult } from '@/services/healthApi';
import { storageService } from '@/services/storageService';

type Classification = 'Allergic Reaction' | 'Side Effect' | 'Unrelated';

interface SymptomResultCardProps {
  classification: Classification;
  explanation: string;
}

function SymptomResultCard({ classification, explanation }: SymptomResultCardProps) {
  const getClassificationColor = (classification: Classification): string => {
    switch (classification) {
      case 'Allergic Reaction':
        return '#F44336'; // Red
      case 'Side Effect':
        return '#FF9800'; // Orange
      case 'Unrelated':
        return '#4CAF50'; // Green
      default:
        return '#757575'; // Gray
    }
  };

  const getClassificationEmoji = (classification: Classification): string => {
    switch (classification) {
      case 'Allergic Reaction':
        return '⬟';
      case 'Side Effect':
        return '△';
      case 'Unrelated':
        return '○';
      default:
        return '◇';
    }
  };

  const color = getClassificationColor(classification);
  const emoji = getClassificationEmoji(classification);

  return (
    <Animatable.View animation="fadeInUp" duration={800} style={styles.resultContainer}>
      <ThemedView style={[styles.resultCard, { borderLeftColor: color }]}>
        <View style={styles.resultHeader}>
          <ThemedText style={[styles.emoji, { fontSize: 28 }]}>{emoji}</ThemedText>
          <ThemedText type="title" style={[styles.classificationTitle, { color }]}>
            {classification}
          </ThemedText>
        </View>
        <View style={styles.divider} />
        <ThemedText style={styles.explanation}>{explanation}</ThemedText>
        
        {classification === 'Allergic Reaction' && (
          <View style={[styles.warningBanner, { backgroundColor: color + '20' }]}>
            <ThemedText style={[styles.warningText, { color }]}>
              Seek immediate medical attention if symptoms are severe
            </ThemedText>
          </View>
        )}
      </ThemedView>
    </Animatable.View>
  );
}

export default function SymptomAnalyzerScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SymptomAnalysisResult | null>(null);
  const [symptoms, setSymptoms] = useState('');

  const handleAnalyzeSymptoms = async () => {
    if (!symptoms.trim()) {
      Alert.alert('Missing Information', 'Please describe your symptoms.');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await healthApi.analyzeSymptoms(symptoms.trim());
      setResult(response);

      // Save to local storage
      await storageService.saveHealthRecord({
        type: 'symptom-analysis',
        timestamp: new Date().toISOString(),
        data: response,
        input: symptoms.trim(),
      });

    } catch (error) {
      console.error('Error analyzing symptoms:', error);
      Alert.alert('Error', 'Failed to analyze symptoms. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveResult = async () => {
    if (!result) return;
    
    Alert.alert(
      'Result Saved',
      'The symptom analysis has been saved to your health summary.',
      [{ text: 'OK' }]
    );
  };

  const handleNewAnalysis = () => {
    setResult(null);
    setSymptoms('');
  };

  const commonSymptoms = [
    'Rash or skin irritation',
    'Nausea and vomiting',
    'Dizziness or lightheadedness',
    'Headache',
    'Fatigue or weakness',
    'Shortness of breath',
    'Swelling (face, lips, tongue)',
    'Stomach pain or cramps',
  ];

  const addSymptom = (symptom: string) => {
    if (symptoms.trim()) {
      setSymptoms(prev => prev + ', ' + symptom);
    } else {
      setSymptoms(symptom);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animatable.View animation="fadeInDown" duration={800} style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            Symptom Analyzer
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Get AI insights to understand if symptoms might be related to allergies or side effects
          </ThemedText>
        </Animatable.View>

        {/* Input Form */}
        {!result && (
          <Animatable.View animation="fadeInUp" delay={300} duration={800}>
            <ThemedView style={styles.formContainer}>
              <InputField
                label="Describe Your Symptoms"
                placeholder="e.g., I have a red rash on my arms and feel nauseous after taking my medication..."
                value={symptoms}
                onChangeText={setSymptoms}
                multiline
                numberOfLines={6}
                style={styles.symptomInput}
              />

              {/* Quick Symptom Buttons */}
              <View style={styles.quickSymptomsSection}>
                <ThemedText type="defaultSemiBold" style={styles.quickSymptomsTitle}>
                  Quick Add Common Symptoms:
                </ThemedText>
                <View style={styles.quickSymptomsGrid}>
                  {commonSymptoms.map((symptom, index) => (
                    <Button
                      key={index}
                      title={symptom}
                      onPress={() => addSymptom(symptom)}
                      variant="secondary"
                      style={styles.quickSymptomButton}
                    />
                  ))}
                </View>
              </View>

              <View style={styles.buttonContainer}>
                <Button
                  title="Analyze Symptoms"
                  onPress={handleAnalyzeSymptoms}
                  loading={loading}
                  style={styles.analyzeButton}
                />
              </View>

              <View style={styles.infoBox}>
                <ThemedText style={styles.infoEmoji}>◈</ThemedText>
                <ThemedText style={styles.infoText}>
                  This AI analysis is not a medical diagnosis. For serious symptoms or emergencies, contact a healthcare professional immediately.
                </ThemedText>
              </View>
            </ThemedView>
          </Animatable.View>
        )}

        {/* Results */}
        {result && (
          <View style={styles.resultSection}>
            <SymptomResultCard
              classification={
                result.classification === 'allergic_reaction' ? 'Allergic Reaction' :
                result.classification === 'side_effect' ? 'Side Effect' :
                result.classification === 'unrelated' ? 'Unrelated' : 'Unrelated'
              }
              explanation={result.ai_analysis || 'No analysis available.'}
            />

            <Animatable.View animation="fadeInUp" delay={600} duration={600}>
              <View style={styles.actionButtons}>
                <Button
                  title="Save Analysis"
                  onPress={handleSaveResult}
                  variant="primary"
                  style={styles.actionButton}
                />
                <Button
                  title="New Analysis"
                  onPress={handleNewAnalysis}
                  variant="secondary"
                  style={styles.actionButton}
                />
              </View>
            </Animatable.View>

            {result.classification === 'allergic_reaction' && (
              <Animatable.View animation="shake" delay={800} duration={1000}>
                <ThemedView style={styles.emergencyBanner}>
                  <ThemedText style={styles.emergencyText}>
                    ⬟ POSSIBLE ALLERGIC REACTION
                  </ThemedText>
                  <ThemedText style={styles.emergencySubtext}>
                    If symptoms are severe or worsening, seek immediate medical attention. Consider calling emergency services.
                  </ThemedText>
                </ThemedView>
              </Animatable.View>
            )}
          </View>
        )}
      </ScrollView>
      <BottomNavBar />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.8,
    lineHeight: 22,
  },
  formContainer: {
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  symptomInput: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  quickSymptomsSection: {
    marginTop: 20,
  },
  quickSymptomsTitle: {
    fontSize: 14,
    marginBottom: 12,
  },
  quickSymptomsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickSymptomButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 8,
  },
  buttonContainer: {
    marginTop: 24,
    marginBottom: 16,
  },
  analyzeButton: {
    paddingVertical: 18,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E8F5E8',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  infoEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#2E7D32',
    lineHeight: 20,
  },
  resultSection: {
    marginTop: 24,
  },
  resultContainer: {
    marginVertical: 16,
  },
  resultCard: {
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
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  emoji: {
    marginRight: 12,
  },
  classificationTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 12,
  },
  explanation: {
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
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  actionButton: {
    flex: 1,
  },
  emergencyBanner: {
    marginTop: 24,
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#FFEBEE',
    borderWidth: 2,
    borderColor: '#F44336',
    alignItems: 'center',
  },
  emergencyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D32F2F',
    marginBottom: 8,
  },
  emergencySubtext: {
    fontSize: 14,
    color: '#D32F2F',
    textAlign: 'center',
    lineHeight: 20,
  },
});