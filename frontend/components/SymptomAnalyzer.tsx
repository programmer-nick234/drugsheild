import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { healthApi, SymptomAnalysisResult } from '@/services/healthApi';

interface SymptomAnalyzerProps {
  onClose?: () => void;
  initialSymptoms?: string;
}

const SymptomAnalyzer: React.FC<SymptomAnalyzerProps> = ({ onClose, initialSymptoms }) => {
  const [symptoms, setSymptoms] = useState(initialSymptoms || '');
  const [additionalMedications, setAdditionalMedications] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SymptomAnalysisResult | null>(null);
  const [userMedications, setUserMedications] = useState<string[]>([]);

  useEffect(() => {
    loadUserMedications();
  }, []);

  const loadUserMedications = async () => {
    try {
      const profile = await healthApi.getUserProfile();
      setUserMedications(profile.medications || []);
    } catch (error) {
      console.error('Failed to load user medications:', error);
    }
  };

  const analyzeSymptoms = async () => {
    if (!symptoms.trim()) {
      Alert.alert('Error', 'Please describe your symptoms');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // Combine user medications with additional ones
      const additionalMedList = additionalMedications
        .split(',')
        .map((med: string) => med.trim())
        .filter((med: string) => med.length > 0);
      
      const allMedications = [...userMedications, ...additionalMedList];

      const analysisResult = await healthApi.analyzeSymptoms(symptoms.trim(), allMedications);
      setResult(analysisResult);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to analyze symptoms');
    } finally {
      setLoading(false);
    }
  };

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case 'allergic_reaction': return '#FF4444';
      case 'side_effect': return '#FFA500';
      case 'unrelated': return '#4CAF50';
      case 'unknown': return '#666';
      default: return '#666';
    }
  };

  const getClassificationIcon = (classification: string) => {
    switch (classification) {
      case 'allergic_reaction': return 'warning';
      case 'side_effect': return 'alert-circle';
      case 'unrelated': return 'checkmark-circle';
      case 'unknown': return 'help-circle';
      default: return 'information-circle';
    }
  };

  const getClassificationDescription = (classification: string) => {
    switch (classification) {
      case 'allergic_reaction': return 'Symptoms may indicate an allergic reaction';
      case 'side_effect': return 'Symptoms may be medication side effects';
      case 'unrelated': return 'Symptoms appear unrelated to allergies or medications';
      case 'unknown': return 'Unable to classify symptoms clearly';
      default: return 'Classification uncertain';
    }
  };

  const getConfidenceLevel = (score: number) => {
    if (score >= 0.8) return { level: 'High', color: '#4CAF50' };
    if (score >= 0.6) return { level: 'Medium', color: '#FFA500' };
    return { level: 'Low', color: '#FF6B6B' };
  };

  const clearForm = () => {
    setSymptoms('');
    setAdditionalMedications('');
    setResult(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>AI Symptom Analysis</Text>
          {onClose && (
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          )}
        </View>

        {/* Symptom Input Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Describe Your Symptoms</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Symptoms *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe your symptoms in detail (e.g., 'red itchy rash on arms, difficulty breathing')"
              value={symptoms}
              onChangeText={setSymptoms}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <Text style={styles.inputHint}>
              Be as specific as possible. Include timing, severity, and location of symptoms.
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Additional Medications (optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter additional medications separated by commas"
              value={additionalMedications}
              onChangeText={setAdditionalMedications}
              multiline
            />
            <Text style={styles.inputHint}>
              Your current medications are already included in the analysis.
            </Text>
          </View>

          {/* Current User Medications Display */}
          {userMedications.length > 0 && (
            <View style={styles.medicationsContainer}>
              <Text style={styles.medicationsTitle}>Your Current Medications:</Text>
              <View style={styles.medicationsGrid}>
                {userMedications.map((medication: string, index: number) => (
                  <View key={index} style={styles.medicationTag}>
                    <Text style={styles.medicationText}>{medication}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[styles.analyzeButton, loading && styles.buttonDisabled]}
            onPress={analyzeSymptoms}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Ionicons name="medical" size={20} color="#fff" />
            )}
            <Text style={styles.buttonText}>
              {loading ? 'Analyzing...' : 'Analyze Symptoms'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.clearButton} onPress={clearForm}>
            <Ionicons name="refresh" size={20} color="#666" />
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        </View>

        {/* Results Section */}
        {result && (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>Analysis Results</Text>
            
            {/* Classification Card */}
            <View style={[styles.analysisCard, { borderColor: getClassificationColor(result.classification) }]}>
              <View style={styles.classificationHeader}>
                <Ionicons 
                  name={getClassificationIcon(result.classification) as any} 
                  size={24} 
                  color={getClassificationColor(result.classification)} 
                />
                <View style={styles.classificationInfo}>
                  <Text style={[styles.classification, { color: getClassificationColor(result.classification) }]}>
                    {result.classification.replace('_', ' ').toUpperCase()}
                  </Text>
                  <Text style={styles.classificationDesc}>
                    {getClassificationDescription(result.classification)}
                  </Text>
                </View>
              </View>

              {/* Confidence Score */}
              <View style={styles.confidenceContainer}>
                <Text style={styles.confidenceLabel}>Confidence Level</Text>
                <View style={styles.confidenceBar}>
                  <View 
                    style={[
                      styles.confidenceFill, 
                      { 
                        width: `${result.confidence_score * 100}%`,
                        backgroundColor: getConfidenceLevel(result.confidence_score).color
                      }
                    ]} 
                  />
                </View>
                <Text style={[styles.confidenceText, { color: getConfidenceLevel(result.confidence_score).color }]}>
                  {getConfidenceLevel(result.confidence_score).level} ({Math.round(result.confidence_score * 100)}%)
                </Text>
              </View>
              
              {/* AI Analysis */}
              {result.ai_analysis && (
                <View style={styles.aiAnalysisContainer}>
                  <View style={styles.aiHeader}>
                    <Ionicons name="sparkles" size={16} color="#8B5CF6" />
                    <Text style={styles.aiLabel}>AI Analysis</Text>
                  </View>
                  <Text style={styles.aiAnalysisText}>{result.ai_analysis}</Text>
                </View>
              )}

              {/* Recommendations */}
              <View style={styles.recommendationsContainer}>
                <Text style={styles.subsectionTitle}>Recommendations</Text>
                {result.recommendations.map((recommendation: string, index: number) => (
                  <View key={index} style={styles.recommendationItem}>
                    <Ionicons name="checkmark-circle-outline" size={16} color="#4CAF50" />
                    <Text style={styles.recommendationText}>{recommendation}</Text>
                  </View>
                ))}
              </View>

              {/* Emergency Warning for High-Risk Cases */}
              {result.classification === 'allergic_reaction' && result.confidence_score >= 0.7 && (
                <View style={styles.emergencyWarning}>
                  <Ionicons name="warning" size={20} color="#FF4444" />
                  <View style={styles.emergencyText}>
                    <Text style={styles.emergencyTitle}>⚠️ Important</Text>
                    <Text style={styles.emergencyDesc}>
                      If you are experiencing difficulty breathing, swelling of face/throat, 
                      or severe symptoms, seek immediate medical attention.
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* Medical Disclaimer */}
            <View style={styles.disclaimerContainer}>
              <Ionicons name="medical" size={16} color="#666" />
              <Text style={styles.disclaimerText}>
                This analysis is for informational purposes only and should not replace professional 
                medical advice. Consult with a healthcare provider for proper diagnosis and treatment.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 8,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  textArea: {
    height: 100,
  },
  inputHint: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
  },
  medicationsContainer: {
    marginTop: 8,
  },
  medicationsTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
    marginBottom: 8,
  },
  medicationsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  medicationTag: {
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  medicationText: {
    fontSize: 12,
    color: '#2e7d32',
    fontWeight: '500',
  },
  actionContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  analyzeButton: {
    flex: 1,
    backgroundColor: '#28a745',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  clearButton: {
    backgroundColor: '#f0f0f0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  clearButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  resultsContainer: {
    marginTop: 8,
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  analysisCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    marginBottom: 16,
  },
  classificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  classificationInfo: {
    flex: 1,
  },
  classification: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  classificationDesc: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  confidenceContainer: {
    marginBottom: 16,
  },
  confidenceLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
    marginBottom: 8,
  },
  confidenceBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 6,
  },
  confidenceFill: {
    height: '100%',
    borderRadius: 4,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: '500',
  },
  aiAnalysisContainer: {
    backgroundColor: '#f8f4ff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  aiLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  aiAnalysisText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  recommendationsContainer: {
    marginBottom: 8,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
    gap: 8,
  },
  recommendationText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  emergencyWarning: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF4444',
    gap: 10,
  },
  emergencyText: {
    flex: 1,
  },
  emergencyTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#c62828',
    marginBottom: 4,
  },
  emergencyDesc: {
    fontSize: 13,
    color: '#c62828',
    lineHeight: 18,
  },
  disclaimerContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
    fontStyle: 'italic',
  },
});

export default SymptomAnalyzer;