import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Alert, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import * as Animatable from 'react-native-animatable';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { BottomNavBar } from '@/components/ui/bottom-nav-bar';
import { storageService, HealthRecord } from '@/services/storageService';
import { healthApi, UserProfile } from '@/services/healthApi';

export default function ProfileScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState({
    totalChecks: 0,
    riskChecks: 0,
    symptomAnalyses: 0,
    chatMessages: 0,
  });

  const loadProfile = async () => {
    try {
      // For now, use mock data since we don't have authentication
      const mockProfile: UserProfile = {
        age: 30,
        weight: 70,
        height: 175,
        gender: 'other',
        allergies: ['Penicillin'],
        emergency_contact: 'Dr. Smith - +1234567890'
      };
      setProfile(mockProfile);

      // Load stats from storage
      const records = await storageService.getHealthRecords();
      setStats({
        totalChecks: records.length,
        riskChecks: records.filter((r: any) => r.type === 'risk-check').length,
        symptomAnalyses: records.filter((r: any) => r.type === 'symptom-analysis').length,
        chatMessages: records.filter((r: any) => r.type === 'chat').length,
      });
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProfile();
    setRefreshing(false);
  };

  const handleEditProfile = () => {
    Alert.alert(
      'Edit Profile',
      'Profile editing will be available in the next update.',
      [{ text: 'OK' }]
    );
  };

  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      'Your health data export feature will be available soon.',
      [{ text: 'OK' }]
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <Animatable.View animation="fadeInDown" duration={800}>
          <View style={styles.header}>
            <ThemedText type="title" style={styles.title}>
              Health Profile
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              Your personal health information
            </ThemedText>
          </View>
        </Animatable.View>

        {/* Profile Information */}
        <Animatable.View animation="fadeInUp" delay={200} duration={800}>
          <ThemedView style={styles.profileContainer}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              Personal Information
            </ThemedText>
            
            {profile && (
              <>
                <View style={styles.infoRow}>
                  <ThemedText style={styles.infoLabel}>Age:</ThemedText>
                  <ThemedText style={styles.infoValue}>{profile.age} years</ThemedText>
                </View>
                <View style={styles.infoRow}>
                  <ThemedText style={styles.infoLabel}>Weight:</ThemedText>
                  <ThemedText style={styles.infoValue}>{profile.weight} kg</ThemedText>
                </View>
                <View style={styles.infoRow}>
                  <ThemedText style={styles.infoLabel}>Height:</ThemedText>
                  <ThemedText style={styles.infoValue}>{profile.height} cm</ThemedText>
                </View>
                <View style={styles.infoRow}>
                  <ThemedText style={styles.infoLabel}>Gender:</ThemedText>
                  <ThemedText style={styles.infoValue}>{profile.gender}</ThemedText>
                </View>
              </>
            )}
            
            <Button
              title="Edit Profile"
              onPress={handleEditProfile}
              style={styles.editButton}
            />
          </ThemedView>
        </Animatable.View>

        {/* Medical Information */}
        <Animatable.View animation="fadeInUp" delay={300} duration={800}>
          <ThemedView style={styles.medicalContainer}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              Medical Information
            </ThemedText>
            
            <View style={styles.medicalSection}>
              <ThemedText style={styles.medicalLabel}>Current Medications:</ThemedText>
              <ThemedText style={styles.medicalItem}>• Lisinopril</ThemedText>
              <ThemedText style={styles.medicalItem}>• Metformin</ThemedText>
            </View>

            <View style={styles.medicalSection}>
              <ThemedText style={styles.medicalLabel}>Allergies:</ThemedText>
              {profile?.allergies?.map((allergy: string, index: number) => (
                <ThemedText key={index} style={styles.medicalItem}>• {allergy}</ThemedText>
              ))}
            </View>

            <View style={styles.medicalSection}>
              <ThemedText style={styles.medicalLabel}>Medical Conditions:</ThemedText>
              <ThemedText style={styles.medicalItem}>• Hypertension</ThemedText>
              <ThemedText style={styles.medicalItem}>• Type 2 Diabetes</ThemedText>
            </View>
          </ThemedView>
        </Animatable.View>

        {/* Stats */}
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
                <ThemedText style={[styles.statNumber, { color: '#FF9800' }]}>{stats.symptomAnalyses}</ThemedText>
                <ThemedText style={styles.statLabel}>Symptom Analyses</ThemedText>
              </View>
              <View style={styles.statItem}>
                <ThemedText style={[styles.statNumber, { color: '#2196F3' }]}>{stats.chatMessages}</ThemedText>
                <ThemedText style={styles.statLabel}>AI Chats</ThemedText>
              </View>
            </View>
          </ThemedView>
        </Animatable.View>

        {/* Actions */}
        <Animatable.View animation="fadeInUp" delay={500} duration={800}>
          <View style={styles.actionsContainer}>
            <Button
              title="Export Health Data"
              onPress={handleExportData}
              style={styles.actionButton}
            />
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
  scrollContent: {
    flexGrow: 1,
    paddingTop: 60,
    paddingBottom: 100,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
  profileContainer: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 16,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#666',
  },
  editButton: {
    marginTop: 16,
  },
  medicalContainer: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  medicalSection: {
    marginBottom: 16,
  },
  medicalLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  medicalItem: {
    fontSize: 14,
    paddingLeft: 8,
    paddingVertical: 2,
    color: '#666',
  },
  statsContainer: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
    color: '#666',
  },
  actionsContainer: {
    marginTop: 20,
  },
  actionButton: {
    marginBottom: 12,
  },
});