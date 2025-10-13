import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, ScrollView, RefreshControl } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import * as Animatable from 'react-native-animatable';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { HomeCard } from '@/components/ui/home-card';
import { BottomNavBar } from '@/components/ui/bottom-nav-bar';
import { storageService } from '@/services/storageService';
import { UserProfile } from '@/services/healthApi';

export default function HomeScreen() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [recentCheckCount, setRecentCheckCount] = useState(0);
  const [hasAllergyAlerts, setHasAllergyAlerts] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadUserData = async () => {
    try {
      const profile = await storageService.getUserProfile();
      setUserProfile(profile);
      
      // Get recent health records
      const records = await storageService.getHealthRecords();
      const today = new Date().toDateString();
      const todayRecords = records.filter(record => 
        new Date(record.timestamp).toDateString() === today
      );
      setRecentCheckCount(todayRecords.length);
      
      // Check for high-risk alerts
      const highRiskAlerts = records
        .filter(record => record.type === 'risk-check')
        .slice(0, 5) // Last 5 checks
        .some(record => {
          const data = record.data as any;
          return data.risk_level === 'high'; // Updated to match new API structure
        });
      setHasAllergyAlerts(highRiskAlerts);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadUserData();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserData();
    setRefreshing(false);
  };

  const getGreetingMessage = () => {
    if (!userProfile) return "Welcome to DrugShield!";
    
    const hour = new Date().getHours();
    let greeting = "Hello";
    
    if (hour < 12) {
      greeting = "Good morning";
    } else if (hour < 17) {
      greeting = "Good afternoon";
    } else {
      greeting = "Good evening";
    }
    
    const displayName = userProfile.name || 
                       (userProfile.user ? `${userProfile.user.first_name} ${userProfile.user.last_name}`.trim() : '') ||
                       userProfile.user?.username ||
                       'User';
    
    return `${greeting} ${displayName}!`;
  };

  const getStatusMessage = () => {
    if (hasAllergyAlerts) {
      return "⚠️ You have high-risk drug alerts. Please review your health summary.";
    }
    
    if (recentCheckCount > 0) {
      return `You have ${recentCheckCount} health check${recentCheckCount > 1 ? 's' : ''} today and no allergy alerts.`;
    }
    
    return "No health checks today. Stay safe and healthy!";
  };

  const homeCards = [
    {
      title: "Check Drug Risk",
      description: "Analyze medicine safety based on your allergies",
      icon: "◇",
      onPress: () => router.push('/risk-check'),
      delay: 100,
    },
    {
      title: "Analyze Symptoms",
      description: "Get AI insights on your health symptoms",
      icon: "○",
      onPress: () => router.push('/symptom-analyzer'),
      delay: 200,
    },
    {
      title: "Health Summary",
      description: "View your medical history and reports",
      icon: "△",
      onPress: () => router.push('/health-summary'),
      delay: 300,
    },
    {
      title: "AI Chat Assistant",
      description: "Ask health questions to our AI doctor",
      icon: "◐",
      onPress: () => router.push('/chat-bot'),
      delay: 400,
    },
  ];

  return (
    <ThemedView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header Section */}
        <Animatable.View animation="fadeInDown" duration={800} style={styles.header}>
          <View style={styles.welcomeContainer}>
            <ThemedText type="title" style={styles.greeting}>
              {getGreetingMessage()}
            </ThemedText>
            <ThemedText style={styles.statusMessage}>
              {getStatusMessage()}
            </ThemedText>
          </View>
        </Animatable.View>

        {/* Quick Stats */}
        <Animatable.View animation="fadeInUp" delay={300} duration={800}>
          <ThemedView style={styles.statsContainer}>
            <View style={styles.statItem}>
              <ThemedText style={styles.statNumber}>{recentCheckCount}</ThemedText>
              <ThemedText style={styles.statLabel}>Today's Checks</ThemedText>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <ThemedText style={styles.statNumber}>
                {userProfile?.allergies?.length || 0}
              </ThemedText>
              <ThemedText style={styles.statLabel}>Known Allergies</ThemedText>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <ThemedText style={[styles.statNumber, { color: hasAllergyAlerts ? '#F44336' : '#4CAF50' }]}>
                {hasAllergyAlerts ? '⚠️' : '✅'}
              </ThemedText>
              <ThemedText style={styles.statLabel}>Safety Status</ThemedText>
            </View>
          </ThemedView>
        </Animatable.View>

        {/* Main Features */}
        <View style={styles.cardsContainer}>
          <Animatable.View animation="fadeInUp" delay={500} duration={600}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              Health Tools
            </ThemedText>
          </Animatable.View>
          
          {homeCards.map((card, index) => (
            <HomeCard
              key={index}
              title={card.title}
              description={card.description}
              icon={card.icon}
              onPress={card.onPress}
              delay={card.delay}
            />
          ))}
        </View>

        {/* Emergency Section */}
        <Animatable.View animation="fadeInUp" delay={900} duration={600}>
          <ThemedView style={styles.emergencyContainer}>
            <ThemedText style={styles.emergencyEmoji}>⚠</ThemedText>
            <ThemedText type="defaultSemiBold" style={styles.emergencyTitle}>
              Medical Emergency?
            </ThemedText>
            <ThemedText style={styles.emergencyText}>
              Call emergency services immediately. This app is for informational purposes only.
            </ThemedText>
          </ThemedView>
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
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  welcomeContainer: {
    marginBottom: 16,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statusMessage: {
    fontSize: 16,
    opacity: 0.8,
    lineHeight: 22,
  },
  statsContainer: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
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
  statDivider: {
    width: 1,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 16,
  },
  cardsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  emergencyContainer: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FF5722',
    backgroundColor: '#FFEBEE',
  },
  emergencyEmoji: {
    fontSize: 32,
    marginBottom: 12,
  },
  emergencyTitle: {
    fontSize: 18,
    color: '#D32F2F',
    marginBottom: 8,
  },
  emergencyText: {
    fontSize: 14,
    color: '#D32F2F',
    textAlign: 'center',
    lineHeight: 20,
  },
});