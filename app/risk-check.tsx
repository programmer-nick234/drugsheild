import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as Animatable from 'react-native-animatable';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { InputField } from '@/components/ui/input-field';
import { Button } from '@/components/ui/button';
import { ResultCard } from '@/components/ui/result-card';
import { BottomNavBar } from '@/components/ui/bottom-nav-bar';
import { healthApi, RiskCheckRequest, RiskCheckResponse } from '@/services/healthApi';
import { storageService } from '@/services/storageService';

export default function RiskCheckScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RiskCheckResponse | null>(null);
  const [formData, setFormData] = useState({
    allergies: '',
    drugName: '',
  });

  const handleCheckRisk = async () => {
    if (!formData.allergies.trim() || !formData.drugName.trim()) {
      Alert.alert('Missing Information', 'Please enter both your allergies and the drug name.');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const request: RiskCheckRequest = {
        allergies: formData.allergies.trim(),
        drugName: formData.drugName.trim(),
      };

      const response = await healthApi.checkDrugRisk(request);
      setResult(response);

      // Save to local storage
      await storageService.saveHealthRecord({
        type: 'risk-check',
        timestamp: new Date().toISOString(),
        data: response,
        input: `${formData.drugName} (Allergies: ${formData.allergies})`,
      });

    } catch (error) {
      console.error('Error checking drug risk:', error);
      Alert.alert('Error', 'Failed to check drug risk. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveResult = async () => {
    if (!result) return;
    
    Alert.alert(
      'Result Saved',
      'The risk assessment has been saved to your health summary.',
      [{ text: 'OK' }]
    );
  };

  const handleNewCheck = () => {
    setResult(null);
    setFormData({
      allergies: '',
      drugName: '',
    });
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animatable.View animation="fadeInDown" duration={800} style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            Drug Risk Checker
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Check if a medicine is safe based on your known allergies
          </ThemedText>
        </Animatable.View>

        {/* Input Form */}
        {!result && (
          <Animatable.View animation="fadeInUp" delay={300} duration={800}>
            <ThemedView style={styles.formContainer}>
              <InputField
                label="Your Known Allergies"
                placeholder="e.g., Penicillin, Sulfa drugs, Aspirin"
                value={formData.allergies}
                onChangeText={(text: string) => setFormData(prev => ({ ...prev, allergies: text }))}
                multiline
                numberOfLines={3}
              />

              <InputField
                label="Drug Name to Check"
                placeholder="e.g., Amoxicillin, Ibuprofen, Paracetamol"
                value={formData.drugName}
                onChangeText={(text: string) => setFormData(prev => ({ ...prev, drugName: text }))}
              />

              <View style={styles.buttonContainer}>
                <Button
                  title="Check Risk Level"
                  onPress={handleCheckRisk}
                  loading={loading}
                  style={styles.checkButton}
                />
              </View>

              <View style={styles.infoBox}>
                <ThemedText style={styles.infoEmoji}>i</ThemedText>
                <ThemedText style={styles.infoText}>
                  This AI assessment is for informational purposes only. Always consult your doctor before taking new medications.
                </ThemedText>
              </View>
            </ThemedView>
          </Animatable.View>
        )}

        {/* Results */}
        {result && (
          <View style={styles.resultSection}>
            <ResultCard
              risk={result.risk}
              advice={result.advice}
              animated={true}
            />

            <Animatable.View animation="fadeInUp" delay={600} duration={600}>
              <View style={styles.actionButtons}>
                <Button
                  title="Save Result"
                  onPress={handleSaveResult}
                  variant="primary"
                  style={styles.actionButton}
                />
                <Button
                  title="New Check"
                  onPress={handleNewCheck}
                  variant="secondary"
                  style={styles.actionButton}
                />
              </View>
            </Animatable.View>

            {result.risk === 'High' && (
              <Animatable.View animation="shake" delay={800} duration={1000}>
                <ThemedView style={styles.emergencyBanner}>
                  <ThemedText style={styles.emergencyText}>
                    ⚠ HIGH RISK DETECTED
                  </ThemedText>
                  <ThemedText style={styles.emergencySubtext}>
                    Do not take this medication. Contact your healthcare provider immediately.
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
  buttonContainer: {
    marginTop: 24,
    marginBottom: 16,
  },
  checkButton: {
    paddingVertical: 18,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
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
    color: '#1565C0',
    lineHeight: 20,
  },
  resultSection: {
    marginTop: 24,
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