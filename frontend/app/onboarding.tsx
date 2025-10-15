import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as Animatable from 'react-native-animatable';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { InputField } from '@/components/ui/input-field';
import { Button } from '@/components/ui/button';
import { storageService } from '@/services/storageService';
import { healthApi, UserProfile } from '@/services/healthApi';

export default function OnboardingScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    allergies: '',
    diseases: '',
  });

  const [errors, setErrors] = useState({
    name: '',
    age: '',
    gender: '',
  });

  const validateForm = () => {
    const newErrors = {
      name: '',
      age: '',
      gender: '',
    };

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.age.trim()) {
      newErrors.age = 'Age is required';
    } else if (isNaN(Number(formData.age)) || Number(formData.age) < 1 || Number(formData.age) > 150) {
      newErrors.age = 'Please enter a valid age';
    }

    if (!formData.gender.trim()) {
      newErrors.gender = 'Gender is required';
    }

    setErrors(newErrors);
    return Object.values(newErrors).every(error => error === '');
  };

  const handleSaveProfile = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      const profile: UserProfile = {
        name: formData.name.trim(),
        gender: formData.gender.trim() as 'male' | 'female' | 'other',
        allergies: formData.allergies.split(',').map((item: string) => item.trim()).filter(Boolean),
        diseases: formData.diseases.split(',').map((item: string) => item.trim()).filter(Boolean),
      };

      // Save to local storage
      await storageService.saveUserProfile(profile);

      // Try to register with backend (optional)
      try {
        await healthApi.registerUser(profile);
      } catch (error) {
        console.log('Backend registration failed, but continuing with local storage');
      }

      // Mark onboarding as completed
      await storageService.setOnboardingCompleted();

      // Navigate to home
      router.replace('/home');

    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save your profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: '#E3F2FD' }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animatable.View animation="fadeInDown" duration={800} style={styles.header}>
          <ThemedText style={styles.emoji}>◈</ThemedText>
          <ThemedText type="title" style={styles.title}>
            Welcome to DrugShield!
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Let's set up your health profile to provide personalized care
          </ThemedText>
        </Animatable.View>

        <Animatable.View animation="fadeInUp" delay={300} duration={800}>
          <ThemedView style={styles.formContainer}>
            <InputField
              label="Full Name *"
              placeholder="Enter your full name"
              value={formData.name}
              onChangeText={(text: string) => setFormData(prev => ({ ...prev, name: text }))}
              error={errors.name}
            />

            <InputField
              label="Age *"
              placeholder="Enter your age"
              value={formData.age}
              onChangeText={(text: string) => setFormData(prev => ({ ...prev, age: text }))}
              keyboardType="numeric"
              error={errors.age}
            />

            <InputField
              label="Gender *"
              placeholder="e.g., Male, Female, Other"
              value={formData.gender}
              onChangeText={(text: string) => setFormData(prev => ({ ...prev, gender: text }))}
              error={errors.gender}
            />

            <InputField
              label="Known Allergies (Optional)"
              placeholder="e.g., Penicillin, Peanuts, Shellfish (comma separated)"
              value={formData.allergies}
              onChangeText={(text: string) => setFormData(prev => ({ ...prev, allergies: text }))}
              multiline
              numberOfLines={3}
            />

            <InputField
              label="Medical Conditions (Optional)"
              placeholder="e.g., Diabetes, Hypertension, Asthma (comma separated)"
              value={formData.diseases}
              onChangeText={(text: string) => setFormData(prev => ({ ...prev, diseases: text }))}
              multiline
              numberOfLines={3}
            />

            <View style={styles.buttonContainer}>
              <Button
                title="Save & Continue"
                onPress={handleSaveProfile}
                loading={loading}
                style={styles.saveButton}
              />
            </View>

            <ThemedText style={styles.note}>
              * Required fields. Your data is stored securely on your device.
            </ThemedText>
          </ThemedView>
        </Animatable.View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1565C0',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#424242',
    textAlign: 'center',
    lineHeight: 24,
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
  saveButton: {
    paddingVertical: 18,
  },
  note: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});