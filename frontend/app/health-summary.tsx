import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Alert, TouchableOpacity, Dimensions } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { BottomNavBar } from '@/components/ui/bottom-nav-bar';
import { storageService, HealthRecord } from '@/services/storageService';
import { UserProfile } from '@/services/healthApi';
import { AppTheme } from '@/constants/AppTheme';

const { width: screenWidth } = Dimensions.get('window');

// Enhanced Statistics Interface
interface HealthStats {
  totalChecks: number;
  riskChecks: number;
  symptomAnalyses: number;
  highRiskAlerts: number;
  allergicReactions: number;
  weeklyTrend: number;
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
  };
  recentActivity: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
}

// Progress Bar Component
interface ProgressBarProps {
  progress: number;
  color: string;
  height?: number;
}

function ProgressBar({ progress, color, height = 8 }: ProgressBarProps) {
  return (
    <View style={[styles.progressBarContainer, { height }]}>
      <View 
        style={[
          styles.progressBarFill, 
          { 
            width: `${Math.min(progress, 100)}%`, 
            backgroundColor: color,
            height 
          }
        ]} 
      />
    </View>
  );
}

// Enhanced Health Card Component
interface HealthCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  color: string;
  trend?: number;
  onPress?: () => void;
}

function HealthCard({ title, value, subtitle, icon, color, trend, onPress }: HealthCardProps) {
  return (
    <TouchableOpacity
      style={[styles.healthCard, { borderLeftColor: color }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.healthCardHeader}>
        <ThemedText style={[styles.healthCardIcon, { color }]}>{icon}</ThemedText>
        <View style={styles.healthCardContent}>
          <ThemedText type="defaultSemiBold" style={styles.healthCardValue}>
            {value}
          </ThemedText>
          <ThemedText style={styles.healthCardTitle}>{title}</ThemedText>
          {subtitle && (
            <ThemedText style={styles.healthCardSubtitle}>{subtitle}</ThemedText>
          )}
        </View>
        {trend !== undefined && (
          <View style={styles.trendContainer}>
            <ThemedText style={[
              styles.trendText, 
              { color: trend >= 0 ? '#4CAF50' : '#F44336' }
            ]}>
              {trend >= 0 ? '↗' : '↘'} {Math.abs(trend)}%
            </ThemedText>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

// Medication Adherence Component
interface MedicationAdherenceProps {
  userProfile: UserProfile | null;
}

function MedicationAdherence({ userProfile }: MedicationAdherenceProps) {
  if (!userProfile?.medications || userProfile.medications.length === 0) {
    return null;
  }

  // Mock adherence data - in real app this would come from user tracking
  const adherenceData = userProfile.medications.map((med, index) => ({
    name: med,
    adherence: Math.max(65, Math.min(98, 75 + (index * 7) % 25)), // Mock 65-98% adherence
    lastTaken: new Date(Date.now() - (index * 2 + 1) * 60 * 60 * 1000), // Hours ago
  }));

  return (
    <View style={styles.medicationSection}>
      <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
        💊 Medication Adherence
      </ThemedText>
      {adherenceData.map((med, index) => (
        <View key={index} style={styles.medicationCard}>
          <View style={styles.medicationHeader}>
            <ThemedText type="defaultSemiBold" style={styles.medicationName}>
              {med.name}
            </ThemedText>
            <ThemedText style={[
              styles.adherencePercent,
              { color: med.adherence >= 80 ? '#4CAF50' : med.adherence >= 60 ? '#FF9800' : '#F44336' }
            ]}>
              {med.adherence}%
            </ThemedText>
          </View>
          <ProgressBar 
            progress={med.adherence} 
            color={med.adherence >= 80 ? '#4CAF50' : med.adherence >= 60 ? '#FF9800' : '#F44336'} 
            height={6}
          />
          <ThemedText style={styles.lastTakenText}>
            Last taken: {med.lastTaken.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </ThemedText>
        </View>
      ))}
    </View>
  );
}

// Risk Chart Component
interface RiskChartProps {
  data: { low: number; medium: number; high: number };
}

function RiskChart({ data }: RiskChartProps) {
  const total = data.low + data.medium + data.high;
  if (total === 0) return null;

  const lowPercent = (data.low / total) * 100;
  const mediumPercent = (data.medium / total) * 100;
  const highPercent = (data.high / total) * 100;

  return (
    <View style={styles.riskChart}>
      <ThemedText type="defaultSemiBold" style={styles.chartTitle}>
        Risk Distribution
      </ThemedText>
      <View style={styles.chartContainer}>
        <View style={styles.chartBar}>
          {data.low > 0 && (
            <View style={[styles.chartSegment, { 
              width: `${lowPercent}%`, 
              backgroundColor: '#4CAF50' 
            }]} />
          )}
          {data.medium > 0 && (
            <View style={[styles.chartSegment, { 
              width: `${mediumPercent}%`, 
              backgroundColor: '#FF9800' 
            }]} />
          )}
          {data.high > 0 && (
            <View style={[styles.chartSegment, { 
              width: `${highPercent}%`, 
              backgroundColor: '#F44336' 
            }]} />
          )}
        </View>
        <View style={styles.chartLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#4CAF50' }]} />
            <ThemedText style={styles.legendText}>Low ({data.low})</ThemedText>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#FF9800' }]} />
            <ThemedText style={styles.legendText}>Medium ({data.medium})</ThemedText>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#F44336' }]} />
            <ThemedText style={styles.legendText}>High ({data.high})</ThemedText>
          </View>
        </View>
      </View>
    </View>
  );
}

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
      switch (data.risk_level || data.risk) { // Support both old and new format
        case 'high':
        case 'High': return '#F44336';
        case 'medium':
        case 'Medium': return '#FF9800';
        case 'low':
        case 'Low': return '#4CAF50';
        default: return '#757575';
      }
    } else {
      const data = record.data as any;
      switch (data.classification) {
        case 'allergic_reaction':
        case 'Allergic Reaction': return '#F44336';
        case 'side_effect':
        case 'Side Effect': return '#FF9800';
        case 'unrelated':
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
    <View style={styles.historyItem}>
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
    </View>
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

  const getEnhancedStats = (): HealthStats => {
    const riskChecks = healthRecords.filter((r: HealthRecord) => r.type === 'risk-check');
    const symptomAnalyses = healthRecords.filter((r: HealthRecord) => r.type === 'symptom-analysis');
    
    // Risk level distribution
    const lowRiskChecks = riskChecks.filter((r: HealthRecord) => {
      const data = r.data as any;
      return (data.risk_level === 'low' || data.risk === 'Low');
    });
    
    const mediumRiskChecks = riskChecks.filter((r: HealthRecord) => {
      const data = r.data as any;
      return (data.risk_level === 'medium' || data.risk === 'Medium');
    });
    
    const highRiskChecks = riskChecks.filter((r: HealthRecord) => {
      const data = r.data as any;
      return (data.risk_level === 'high' || data.risk === 'High');
    });
    
    const allergicReactions = symptomAnalyses.filter((r: HealthRecord) => {
      const data = r.data as any;
      return data.classification === 'Allergic Reaction' || data.classification === 'allergic_reaction';
    });

    // Calculate activity for different time periods
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    const lastWeek = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000);

    const todayRecords = healthRecords.filter(r => new Date(r.timestamp) >= today).length;
    const thisWeekRecords = healthRecords.filter(r => new Date(r.timestamp) >= thisWeek).length;
    const thisMonthRecords = healthRecords.filter(r => new Date(r.timestamp) >= thisMonth).length;
    const lastWeekRecords = healthRecords.filter(r => {
      const recordDate = new Date(r.timestamp);
      return recordDate >= lastWeek && recordDate < thisWeek;
    }).length;

    // Calculate weekly trend
    const weeklyTrend = lastWeekRecords > 0 
      ? Math.round(((thisWeekRecords - lastWeekRecords) / lastWeekRecords) * 100)
      : thisWeekRecords > 0 ? 100 : 0;

    return {
      totalChecks: healthRecords.length,
      riskChecks: riskChecks.length,
      symptomAnalyses: symptomAnalyses.length,
      highRiskAlerts: highRiskChecks.length,
      allergicReactions: allergicReactions.length,
      weeklyTrend,
      riskDistribution: {
        low: lowRiskChecks.length,
        medium: mediumRiskChecks.length,
        high: highRiskChecks.length,
      },
      recentActivity: {
        today: todayRecords,
        thisWeek: thisWeekRecords,
        thisMonth: thisMonthRecords,
      },
    };
  };

  const stats = getEnhancedStats();

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
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            📊 Health Summary
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Your complete health check history and profile overview
          </ThemedText>
        </View>

        {/* Profile Summary */}
        {userProfile && (
          <View>
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
                {userProfile.allergies && userProfile.allergies.length > 0 ? (
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
                {userProfile.diseases && userProfile.diseases.length > 0 ? (
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
          </View>
        )}

        {/* Enhanced Health Dashboard */}
        <View>
          <ThemedView style={styles.enhancedStatsContainer}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              📊 Health Dashboard
            </ThemedText>
            
            {/* Health Cards Grid */}
            <View style={styles.healthCardsGrid}>
              <View style={styles.healthCardHalf}>
                <HealthCard
                  title="Total Health Checks"
                  value={stats.totalChecks}
                  subtitle="All time activity"
                  icon="📋"
                  color="#2196F3"
                  trend={stats.weeklyTrend}
                  onPress={() => Alert.alert('Health Checks', `You've performed ${stats.totalChecks} health checks in total.`)}
                />
              </View>
              <View style={styles.healthCardHalf}>
                <HealthCard
                  title="Risk Assessments"
                  value={stats.riskChecks}
                  subtitle="Drug safety checks"
                  icon="🛡️"
                  color="#4CAF50"
                  onPress={() => Alert.alert('Risk Assessments', `${stats.riskChecks} drug risk assessments completed.`)}
                />
              </View>
            </View>
            
            <View style={styles.healthCardsGrid}>
              <View style={styles.healthCardHalf}>
                <HealthCard
                  title="Symptom Analyses"
                  value={stats.symptomAnalyses}
                  subtitle="Health evaluations"
                  icon="🔍"
                  color="#FF9800"
                  onPress={() => Alert.alert('Symptom Analyses', `${stats.symptomAnalyses} symptom analyses performed.`)}
                />
              </View>
              <View style={styles.healthCardHalf}>
                <HealthCard
                  title="High Risk Alerts"
                  value={stats.highRiskAlerts}
                  subtitle="Safety warnings"
                  icon="⚠️"
                  color="#F44336"
                  onPress={() => Alert.alert('High Risk Alerts', `${stats.highRiskAlerts} high-risk situations identified.`)}
                />
              </View>
            </View>
            
            {/* Risk Distribution Chart */}
            {stats.riskChecks > 0 && (
              <RiskChart data={stats.riskDistribution} />
            )}
          </ThemedView>
        </View>

        {/* Recent Activity Overview */}
        <View>
          <ThemedView style={styles.activitySection}>
            <View style={styles.activityHeader}>
              <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                📈 Recent Activity
              </ThemedText>
            </View>
            <View style={styles.activityGrid}>
              <ThemedView style={styles.activityCard}>
                <ThemedText style={[styles.activityValue, { color: '#4CAF50' }]}>
                  {stats.recentActivity.today}
                </ThemedText>
                <ThemedText style={styles.activityLabel}>Today</ThemedText>
              </ThemedView>
              <ThemedView style={styles.activityCard}>
                <ThemedText style={[styles.activityValue, { color: '#2196F3' }]}>
                  {stats.recentActivity.thisWeek}
                </ThemedText>
                <ThemedText style={styles.activityLabel}>This Week</ThemedText>
              </ThemedView>
              <ThemedView style={styles.activityCard}>
                <ThemedText style={[styles.activityValue, { color: '#FF9800' }]}>
                  {stats.recentActivity.thisMonth}
                </ThemedText>
                <ThemedText style={styles.activityLabel}>This Month</ThemedText>
              </ThemedView>
            </View>
          </ThemedView>
        </View>

        {/* Medication Adherence Tracking */}
        {userProfile?.medications && userProfile.medications.length > 0 && (
          <View>
            <ThemedView style={styles.enhancedStatsContainer}>
              <MedicationAdherence userProfile={userProfile} />
            </ThemedView>
          </View>
        )}

        {/* Recent History */}
        <View>
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
        </View>
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
  // Enhanced Components Styles
  progressBarContainer: {
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    borderRadius: 4,
  },
  healthCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  healthCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  healthCardIcon: {
    fontSize: 28,
    marginRight: 16,
    fontWeight: 'bold',
  },
  healthCardContent: {
    flex: 1,
  },
  healthCardValue: {
    fontSize: 24,
    marginBottom: 2,
  },
  healthCardTitle: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 2,
  },
  healthCardSubtitle: {
    fontSize: 12,
    opacity: 0.5,
  },
  trendContainer: {
    alignItems: 'flex-end',
  },
  trendText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  riskChart: {
    marginBottom: 24,
  },
  chartTitle: {
    fontSize: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  chartContainer: {
    paddingHorizontal: 16,
  },
  chartBar: {
    flexDirection: 'row',
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 16,
  },
  chartSegment: {
    height: '100%',
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 2,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    opacity: 0.8,
  },
  enhancedStatsContainer: {
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
  healthCardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
  },
  healthCardHalf: {
    flex: 1,
    minWidth: (screenWidth - 72) / 2,
  },
  activitySection: {
    marginBottom: 24,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  activityGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  activityCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  activityValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  activityLabel: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'center',
  },
  // Medication Adherence Styles
  medicationSection: {
    marginBottom: 24,
  },
  medicationCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  medicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  medicationName: {
    fontSize: 16,
    flex: 1,
  },
  adherencePercent: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  lastTakenText: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 6,
  },
});