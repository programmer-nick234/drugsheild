import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, RiskCheckResponse, SymptomAnalysisResponse } from '@/services/healthApi';

export interface HealthRecord {
  id: string;
  type: 'risk-check' | 'symptom-analysis';
  timestamp: string;
  data: RiskCheckResponse | SymptomAnalysisResponse;
  input: string;
}

export const storageService = {
  // User Profile
  saveUserProfile: async (profile: UserProfile): Promise<void> => {
    try {
      await AsyncStorage.setItem('user_profile', JSON.stringify(profile));
    } catch (error) {
      console.error('Error saving user profile:', error);
    }
  },

  getUserProfile: async (): Promise<UserProfile | null> => {
    try {
      const profileData = await AsyncStorage.getItem('user_profile');
      return profileData ? JSON.parse(profileData) : null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  },

  // Health Records
  saveHealthRecord: async (record: Omit<HealthRecord, 'id'>): Promise<void> => {
    try {
      const existingRecords = await storageService.getHealthRecords();
      const newRecord: HealthRecord = {
        ...record,
        id: Date.now().toString(),
      };
      const updatedRecords = [newRecord, ...existingRecords].slice(0, 50); // Keep last 50 records
      await AsyncStorage.setItem('health_records', JSON.stringify(updatedRecords));
    } catch (error) {
      console.error('Error saving health record:', error);
    }
  },

  getHealthRecords: async (): Promise<HealthRecord[]> => {
    try {
      const recordsData = await AsyncStorage.getItem('health_records');
      return recordsData ? JSON.parse(recordsData) : [];
    } catch (error) {
      console.error('Error getting health records:', error);
      return [];
    }
  },

  clearHealthRecords: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem('health_records');
    } catch (error) {
      console.error('Error clearing health records:', error);
    }
  },

  // Onboarding status
  setOnboardingCompleted: async (): Promise<void> => {
    try {
      await AsyncStorage.setItem('onboarding_completed', 'true');
    } catch (error) {
      console.error('Error setting onboarding completed:', error);
    }
  },

  isOnboardingCompleted: async (): Promise<boolean> => {
    try {
      const completed = await AsyncStorage.getItem('onboarding_completed');
      return completed === 'true';
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      return false;
    }
  },

  // Clear all data
  clearAllData: async (): Promise<void> => {
    try {
      await AsyncStorage.multiRemove(['user_profile', 'health_records', 'onboarding_completed']);
    } catch (error) {
      console.error('Error clearing all data:', error);
    }
  },
};