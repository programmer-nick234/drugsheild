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
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { healthApi, DrugRiskAnalysisResult } from '@/services/healthApi';

interface DrugRiskAnalysisProps {
  onClose?: () => void;
  initialDrugName?: string;
}

const DrugRiskAnalysis: React.FC<DrugRiskAnalysisProps> = ({ onClose, initialDrugName }) => {
  const [drugName, setDrugName] = useState(initialDrugName || '');
  const [additionalAllergies, setAdditionalAllergies] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DrugRiskAnalysisResult | null>(null);
  const [userAllergies, setUserAllergies] = useState<string[]>([]);

  useEffect(() => {
    loadUserAllergies();
  }, []);

  const loadUserAllergies = async () => {
    try {
      const profile = await healthApi.getUserProfile();
      setUserAllergies(profile.allergies || []);
    } catch (error) {
      console.error('Failed to load user allergies:', error);
    }
  };

  const analyzeDrugRisk = async () => {
    if (!drugName.trim()) {
      Alert.alert('Error', 'Please enter a drug name');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // Combine user allergies with additional ones
      const additionalAllergyList = additionalAllergies
        .split(',')
        .map(allergy => allergy.trim())
        .filter(allergy => allergy.length > 0);
      
      const allAllergies = [...userAllergies, ...additionalAllergyList];

      const riskResult = await healthApi.analyzeDrugRisk(drugName.trim(), allAllergies);
      setResult(riskResult);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to analyze drug risk');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return '#FF4444';
      case 'medium': return '#FFA500';
      case 'low': return '#4CAF50';
      default: return '#666';
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return 'warning';
      case 'medium': return 'alert-circle';
      case 'low': return 'checkmark-circle';
      default: return 'information-circle';
    }
  };

  const clearForm = () => {
    setDrugName('');
    setAdditionalAllergies('');
    setResult(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>AI Drug Risk Analysis</Text>
          {onClose && (
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          )}
        </View>

        {/* Drug Input Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Drug Information</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Drug Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter drug name (e.g., Penicillin, Ibuprofen)"
              value={drugName}
              onChangeText={setDrugName}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Additional Allergies (optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter additional allergies separated by commas"
              value={additionalAllergies}
              onChangeText={setAdditionalAllergies}
              multiline
            />
            <Text style={styles.inputHint}>
              Separate multiple allergies with commas. Your known allergies are already included.
            </Text>
          </View>

          {/* Current User Allergies Display */}
          {userAllergies.length > 0 && (
            <View style={styles.allergiesContainer}>
              <Text style={styles.allergiesTitle}>Your Known Allergies:</Text>
              <View style={styles.allergiesGrid}>
                {userAllergies.map((allergy, index) => (
                  <View key={index} style={styles.allergyTag}>
                    <Text style={styles.allergyText}>{allergy}</Text>
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
            onPress={analyzeDrugRisk}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Ionicons name="analytics" size={20} color="#fff" />
            )}
            <Text style={styles.buttonText}>
              {loading ? 'Analyzing...' : 'Analyze Risk'}
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
            
            {/* Risk Level */}
            <View style={[styles.riskCard, { borderColor: getRiskColor(result.risk_level) }]}>
              <View style={styles.riskHeader}>
                <Ionicons 
                  name={getRiskIcon(result.risk_level) as any} 
                  size={24} 
                  color={getRiskColor(result.risk_level)} 
                />
                <Text style={[styles.riskLevel, { color: getRiskColor(result.risk_level) }]}>
                  {result.risk_level.toUpperCase()} RISK
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

              {/* Potential Reactions */}
              {result.potential_reactions && result.potential_reactions.length > 0 && (
                <View style={styles.reactionsContainer}>
                  <Text style={styles.subsectionTitle}>Potential Reactions</Text>
                  {result.potential_reactions.map((reaction: string, index: number) => (
                    <View key={index} style={styles.reactionItem}>
                      <Ionicons name="alert-circle-outline" size={16} color="#FF6B6B" />
                      <Text style={styles.reactionText}>{reaction}</Text>
                    </View>
                  ))}
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

              {/* AI Analysis */}
              {result.ai_analysis && (
                <View style={styles.aiAnalysisContainer}>
                  <View style={styles.aiHeader}>
                    <MaterialIcons name="psychology" size={16} color="#8B5CF6" />
                    <Text style={styles.aiLabel}>AI Analysis</Text>
                  </View>
                  <Text style={styles.aiAnalysisText}>{result.ai_analysis}</Text>
                </View>
              )}
            </View>

            {/* Medical Disclaimer */}
            <View style={styles.disclaimerContainer}>
              <Ionicons name="medical" size={16} color="#666" />
              <Text style={styles.disclaimerText}>
                This analysis is for informational purposes only. Always consult with a healthcare 
                professional before starting or stopping any medication.
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
  inputHint: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
  },
  allergiesContainer: {
    marginTop: 8,
  },
  allergiesTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
    marginBottom: 8,
  },
  allergiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  allergyTag: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  allergyText: {
    fontSize: 12,
    color: '#1976d2',
    fontWeight: '500',
  },
  actionContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  analyzeButton: {
    flex: 1,
    backgroundColor: '#007AFF',
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
  riskCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    marginBottom: 16,
  },
  riskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  riskLevel: {
    fontSize: 18,
    fontWeight: 'bold',
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
  reactionsContainer: {
    marginBottom: 16,
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
  reactionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
    gap: 8,
  },
  reactionText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
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
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff3cd',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    gap: 8,
  },
  noteText: {
    flex: 1,
    fontSize: 12,
    color: '#856404',
    lineHeight: 16,
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

export default DrugRiskAnalysis;