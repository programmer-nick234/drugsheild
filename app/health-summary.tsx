import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import * as Animatable from 'react-native-animatable';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { BottomNavBar } from '@/components/ui/bottom-nav-bar';
import { storageService, HealthRecord } from '@/services/storageService';
import { UserProfile } from '@/services/healthApi';

interface HistoryItemProps {
  record: HealthRecord;
  index: number;
}

function HistoryItem({ record, index }: HistoryItemProps) {
  const getRecordIcon = (type: 'risk-check' | 'symptom-analysis'): string => {
    return type === 'risk-check' ? '□' : '◇';
  };

  const getRecordColor = (record: HealthRecord): string => {
    if (record.type === 'risk-check') {
      const data = record.data as any;
      switch (data.risk) {
        case 'High': return '#F44336';
        case 'Medium': return '#FF9800';
        case 'Low': return '#4CAF50';
        default: return '#757575';
      }
    } else {
      const data = record.data as any;
      switch (data.classification) {
        case 'Allergic Reaction': return '#F44336';
        case 'Side Effect': return '#FF9800';
        case 'Unrelated': return '#4CAF50';
        default: return '#757575';
      }
    }
  };

  const formatDate = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const getResultText = (record: HealthRecord): string => {
    if (record.type === 'risk-check') {
      const data = record.data as any;
      return `${data.risk} Risk`;
    } else {
      const data = record.data as any;
      return data.classification;
    }
  };

  const color = getRecordColor(record);

  return (
    <Animatable.View
      animation="fadeInUp"
      delay={index * 100}
      duration={600}
      style={styles.historyItem}
    >
      <ThemedView style={[styles.historyCard, { borderLeftColor: color }]}>
        <View style={styles.historyHeader}>
          <View style={styles.historyIconContainer}>
            <ThemedText style={styles.historyIcon}>
              {getRecordIcon(record.type)}
            </ThemedText>
          </View>
          <View style={styles.historyContent}>
            <ThemedText type="defaultSemiBold" style={styles.historyInput}>
              {record.input}
            </ThemedText>
            <ThemedText style={[styles.historyResult, { color }]}>
              {getResultText(record)}
            </ThemedText>
          </View>
          <ThemedText style={styles.historyTime}>
            {formatDate(record.timestamp)}
          </ThemedText>
        </View>
      </ThemedView>
    </Animatable.View>
  );
}

export default function HealthSummaryScreen() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [profile, records] = await Promise.all([
        storageService.getUserProfile(),
        storageService.getHealthRecords(),
      ]);
      
      setUserProfile(profile);
      setHealthRecords(records);
    } catch (error) {
      console.error('Error loading health summary data:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  const handleClearHistory = () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to clear all your health records? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await storageService.clearHealthRecords();
              setHealthRecords([]);
              Alert.alert('Success', 'Health history has been cleared.');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear history. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleExportReport = () => {
    Alert.alert(
      'Export Report',
      'Export functionality will be available in a future update. For now, you can take screenshots of your health summary.',
      [{ text: 'OK' }]
    );
  };

  const getStats = () => {
    const riskChecks = healthRecords.filter((r: HealthRecord) => r.type === 'risk-check');
    const symptomAnalyses = healthRecords.filter((r: HealthRecord) => r.type === 'symptom-analysis');
    
    const highRiskChecks = riskChecks.filter((r: HealthRecord) => {
      const data = r.data as any;
      return data.risk === 'High';
    });
    
    const allergicReactions = symptomAnalyses.filter((r: HealthRecord) => {
      const data = r.data as any;
      return data.classification === 'Allergic Reaction';
    });

    return {
      totalChecks: healthRecords.length,
      riskChecks: riskChecks.length,
      symptomAnalyses: symptomAnalyses.length,
      highRiskAlerts: highRiskChecks.length,
      allergicReactions: allergicReactions.length,
    };
  };

  const stats = getStats();

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ThemedText>Loading your health summary...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animatable.View animation="fadeInDown" duration={800} style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            ◐ Health Summary
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Your complete health check history and profile overview
          </ThemedText>
        </Animatable.View>

        {/* Profile Summary */}
        {userProfile && (
          <Animatable.View animation="fadeInUp" delay={200} duration={800}>
            <ThemedView style={styles.profileContainer}>
              <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                ◈ Profile Information
              </ThemedText>
              <View style={styles.profileGrid}>
                <View style={styles.profileItem}>
                  <ThemedText style={styles.profileLabel}>Name</ThemedText>
                  <ThemedText type="defaultSemiBold">{userProfile.name}</ThemedText>
                </View>
                <View style={styles.profileItem}>
                  <ThemedText style={styles.profileLabel}>Age</ThemedText>
                  <ThemedText type="defaultSemiBold">{userProfile.age} years</ThemedText>
                </View>
                <View style={styles.profileItem}>
                  <ThemedText style={styles.profileLabel}>Gender</ThemedText>
                  <ThemedText type="defaultSemiBold">{userProfile.gender}</ThemedText>
                </View>
              </View>
              
              <View style={styles.allergiesSection}>
                <ThemedText style={styles.profileLabel}>Known Allergies</ThemedText>
                {userProfile.allergies.length > 0 ? (
                  <View style={styles.allergiesList}>
                    {userProfile.allergies.map((allergy: string, index: number) => (
                      <ThemedView key={index} style={styles.allergyTag}>
                        <ThemedText style={styles.allergyText}>{allergy}</ThemedText>
                      </ThemedView>
                    ))}
                  </View>
                ) : (
                  <ThemedText style={styles.noDataText}>No known allergies</ThemedText>
                )}
              </View>

              <View style={styles.diseasesSection}>
                <ThemedText style={styles.profileLabel}>Medical Conditions</ThemedText>
                {userProfile.diseases.length > 0 ? (
                  <View style={styles.diseasesList}>
                    {userProfile.diseases.map((disease: string, index: number) => (
                      <ThemedView key={index} style={styles.diseaseTag}>
                        <ThemedText style={styles.diseaseText}>{disease}</ThemedText>
                      </ThemedView>
                    ))}
                  </View>
                ) : (
                  <ThemedText style={styles.noDataText}>No known conditions</ThemedText>
                )}
              </View>
            </ThemedView>
          </Animatable.View>
        )}

        {/* Statistics */}
        <Animatable.View animation="fadeInUp" delay={400} duration={800}>
          <ThemedView style={styles.statsContainer}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              Health Check Statistics
            </ThemedText>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <ThemedText style={styles.statNumber}>{stats.totalChecks}</ThemedText>
                <ThemedText style={styles.statLabel}>Total Checks</ThemedText>
              </View>
              <View style={styles.statItem}>
                <ThemedText style={[styles.statNumber, { color: '#4CAF50' }]}>{stats.riskChecks}</ThemedText>
                <ThemedText style={styles.statLabel}>Drug Checks</ThemedText>
              </View>
              <View style={styles.statItem}>
                <ThemedText style={[styles.statNumber, { color: '#2196F3' }]}>{stats.symptomAnalyses}</ThemedText>
                <ThemedText style={styles.statLabel}>Symptom Analyses</ThemedText>
              </View>
              <View style={styles.statItem}>
                <ThemedText style={[styles.statNumber, { color: '#F44336' }]}>{stats.highRiskAlerts}</ThemedText>
                <ThemedText style={styles.statLabel}>High Risk Alerts</ThemedText>
              </View>
            </View>
          </ThemedView>
        </Animatable.View>

        {/* Recent History */}
        <Animatable.View animation="fadeInUp" delay={600} duration={800}>
          <View style={styles.historySection}>
            <View style={styles.historySectionHeader}>
              <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                ◯ Recent History
              </ThemedText>
              {healthRecords.length > 0 && (
                <View style={styles.historyActions}>
                  <Button
                    title="Export"
                    onPress={handleExportReport}
                    variant="secondary"
                    style={styles.actionButton}
                  />
                  <Button
                    title="Clear"
                    onPress={handleClearHistory}
                    variant="danger"
                    style={styles.actionButton}
                  />
                </View>
              )}
            </View>

            {healthRecords.length > 0 ? (
              <View style={styles.historyList}>
                {healthRecords.slice(0, 10).map((record: HealthRecord, index: number) => (
                  <HistoryItem key={record.id} record={record} index={index} />
                ))}
                {healthRecords.length > 10 && (
                  <ThemedText style={styles.moreItemsText}>
                    ... and {healthRecords.length - 10} more items
                  </ThemedText>
                )}
              </View>
            ) : (
              <ThemedView style={styles.noHistoryContainer}>
                <ThemedText style={styles.noHistoryEmoji}>◐</ThemedText>
                <ThemedText type="defaultSemiBold" style={styles.noHistoryTitle}>
                  No Health Records Yet
                </ThemedText>
                <ThemedText style={styles.noHistoryText}>
                  Start using the drug risk checker or symptom analyzer to build your health history.
                </ThemedText>
              </ThemedView>
            )}
          </View>
        </Animatable.View>
      </ScrollView>
      <BottomNavBar />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  profileContainer: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 16,
  },
  profileGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 20,
  },
  profileItem: {
    flex: 1,
    minWidth: 100,
  },
  profileLabel: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 4,
  },
  allergiesSection: {
    marginBottom: 20,
  },
  allergiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  allergyTag: {
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  allergyText: {
    fontSize: 14,
    color: '#D32F2F',
  },
  diseasesSection: {},
  diseasesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  diseaseTag: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#BBDEFB',
  },
  diseaseText: {
    fontSize: 14,
    color: '#1565C0',
  },
  noDataText: {
    fontSize: 14,
    opacity: 0.6,
    fontStyle: 'italic',
  },
  statsContainer: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    minWidth: 80,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'center',
  },
  historySection: {},
  historySectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  historyActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  historyList: {},
  historyItem: {
    marginBottom: 12,
  },
  historyCard: {
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyIconContainer: {
    marginRight: 12,
  },
  historyIcon: {
    fontSize: 20,
  },
  historyContent: {
    flex: 1,
  },
  historyInput: {
    fontSize: 14,
    marginBottom: 2,
  },
  historyResult: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  historyTime: {
    fontSize: 12,
    opacity: 0.6,
  },
  moreItemsText: {
    textAlign: 'center',
    fontSize: 14,
    opacity: 0.6,
    marginTop: 16,
    fontStyle: 'italic',
  },
  noHistoryContainer: {
    alignItems: 'center',
    padding: 40,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  noHistoryEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  noHistoryTitle: {
    fontSize: 18,
    marginBottom: 8,
  },
  noHistoryText: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
    lineHeight: 20,
  },
});