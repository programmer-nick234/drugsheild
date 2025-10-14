import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, RiskCheckResult, SymptomAnalysisResult } from '@/services/healthApi';

export interface HealthRecord {
  id: string;
  type: 'risk-check' | 'symptom-analysis';
  timestamp: string;
  data: RiskCheckResult | SymptomAnalysisResult;
  input: string;
}

export interface StorageKeys {
  USER_PROFILE: '@user_profile';
  AUTH_TOKEN: '@auth_token';
  HEALTH_DATA: '@health_data';
  ONBOARDING_COMPLETE: '@onboarding_complete';
}

const STORAGE_KEYS: StorageKeys = {
  USER_PROFILE: '@user_profile',
  AUTH_TOKEN: '@auth_token',
  HEALTH_DATA: '@health_data',
  ONBOARDING_COMPLETE: '@onboarding_complete'
};

export class StorageService {
  static async setItem(key: keyof StorageKeys, value: any): Promise<void> {
    try {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      await AsyncStorage.setItem(STORAGE_KEYS[key], stringValue);
    } catch (error) {
      console.error(`Failed to save ${key} to storage:`, error);
      throw error;
    }
  }

  static async getItem<T = string>(key: keyof StorageKeys): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEYS[key]);
      if (value === null) return null;
      
      try {
        return JSON.parse(value) as T;
      } catch {
        return value as T;
      }
    } catch (error) {
      console.error(`Failed to get ${key} from storage:`, error);
      return null;
    }
  }

  static async removeItem(key: keyof StorageKeys): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS[key]);
    } catch (error) {
      console.error(`Failed to remove ${key} from storage:`, error);
      throw error;
    }
  }

  static async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Failed to clear storage:', error);
      throw error;
    }
  }

  // Convenience methods for specific data types
  static async getUserProfile(): Promise<UserProfile | null> {
    return this.getItem('USER_PROFILE');
  }

  static async setUserProfile(profile: UserProfile): Promise<void> {
    return this.setItem('USER_PROFILE', profile);
  }

  static async getAuthToken(): Promise<string | null> {
    return this.getItem<string>('AUTH_TOKEN');
  }

  static async setAuthToken(token: string): Promise<void> {
    return this.setItem('AUTH_TOKEN', token);
  }

  static async removeAuthToken(): Promise<void> {
    return this.removeItem('AUTH_TOKEN');
  }

  static async isOnboardingComplete(): Promise<boolean> {
    const result = await this.getItem<boolean>('ONBOARDING_COMPLETE');
    return result === true;
  }

  static async setOnboardingComplete(complete: boolean = true): Promise<void> {
    return this.setItem('ONBOARDING_COMPLETE', complete);
  }
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

// Export the storage service as default and named export
export default StorageService;

// Export storage keys for direct use if needed
export { STORAGE_KEYS };

// Backward compatibility exports
export const StorageKey = STORAGE_KEYS;