import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Animatable from 'react-native-animatable';
// Using ThemedView instead of LinearGradient for better compatibility
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { storageService } from '@/services/storageService';

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const isCompleted = await storageService.isOnboardingCompleted();
        
        // Show splash for 2 seconds
        setTimeout(() => {
          if (isCompleted) {
            router.replace('/home');
          } else {
            router.replace('/onboarding');
          }
        }, 2000);
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        // Fallback to onboarding
        setTimeout(() => {
          router.replace('/onboarding');
        }, 2000);
      }
    };

    checkOnboarding();
  }, [router]);

  return (
    <ThemedView style={[styles.container, { backgroundColor: '#E3F2FD' }]}>
      <View style={styles.content}>
        <Animatable.View
          animation="bounceIn"
          duration={1500}
          style={styles.logoContainer}
        >
          <ThemedText style={styles.logo}>🛡️</ThemedText>
        </Animatable.View>
        
        <Animatable.View
          animation="fadeInUp"
          delay={500}
          duration={1000}
        >
          <ThemedText type="title" style={styles.appName}>
            DrugShield
          </ThemedText>
        </Animatable.View>
        
        <Animatable.View
          animation="fadeInUp"
          delay={800}
          duration={1000}
        >
          <ThemedText style={styles.tagline}>
            Your AI Health Guardian
          </ThemedText>
        </Animatable.View>
        
        <Animatable.View
          animation="pulse"
          iterationCount="infinite"
          delay={1200}
          style={styles.loadingContainer}
        >
          <ThemedText style={styles.loading}>
            ⚡ Initializing...
          </ThemedText>
        </Animatable.View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  logoContainer: {
    marginBottom: 30,
  },
  logo: {
    fontSize: 80,
    textAlign: 'center',
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1565C0',
    marginBottom: 16,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 18,
    color: '#424242',
    textAlign: 'center',
    marginBottom: 60,
    fontWeight: '500',
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 100,
  },
  loading: {
    fontSize: 16,
    color: '#1565C0',
    textAlign: 'center',
  },
});