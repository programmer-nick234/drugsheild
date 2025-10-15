import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Configuration - Django backend URL
const API_BASE_URL = __DEV__ ? 'http://localhost:8000/api' : 'https://your-production-api.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

// Types
export interface UserProfile {
  id?: string;
  user?: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  name?: string; // Computed field for backward compatibility
  age?: number; // Computed field for backward compatibility
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  blood_type?: string;
  height?: number; // cm
  weight?: number; // kg
  phone_number?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  allergies?: string[]; // For backward compatibility
  diseases?: string[]; // For backward compatibility
  medications?: string[]; // For backward compatibility
}

export interface Allergy {
  id: number;
  name: string;
  severity: 'mild' | 'moderate' | 'severe';
  symptoms?: string;
  diagnosed_date?: string;
}

export interface Medication {
  id: number;
  name: string;
  dosage: string;
  frequency: string;
  start_date: string;
  end_date?: string;
  prescribing_doctor?: string;
  notes?: string;
  is_active: boolean;
}

export interface RiskCheckResult {
  risk_level: 'low' | 'medium' | 'high';
  potential_reactions: string[];
  recommendations: string[];
  record_id: number;
  ai_analysis?: string; // AI-powered analysis text
  note?: string; // Fallback note when AI is unavailable
}

// AI-powered drug risk analysis result
export interface DrugRiskAnalysisResult {
  risk_level: 'minimal' | 'low' | 'medium' | 'high';
  risk_description: string;
  confidence_score: number;
  allergy_matches?: string[];
  recommendations: string[];
  ai_analysis?: string;
  generic_name?: string;
  drug_class?: string;
  common_uses?: string;
  potential_reactions?: string[]; // For backward compatibility
}

// For backward compatibility
export type RiskCheckResponse = RiskCheckResult;
export type RiskCheckRequest = {
  drug_name: string;
  user_allergies?: string[];
};

export interface SymptomAnalysisResult {
  classification: 'allergic_reaction' | 'side_effect' | 'unrelated' | 'unknown';
  confidence_score: number;
  ai_analysis: string;
  recommendations: string[];
  analysis_id: number;
}

// For backward compatibility
export type SymptomAnalysisResponse = SymptomAnalysisResult;
export type SymptomAnalysisRequest = {
  symptoms: string;
  current_medications?: string[];
};

export interface ChatResponse {
  response: string;
  message_type: string;
  message_id: number;
}

export interface HealthSummary {
  user_profile: UserProfile;
  allergies: Allergy[];
  medications: Medication[];
  recent_risk_checks: any[];
  recent_symptom_analyses: any[];
  unread_alerts: any[];
}

// Authentication
export const authApi = {
  async register(userData: {
    username: string;
    email: string;
    password: string;
    password_confirm: string;
    first_name?: string;
    last_name?: string;
  }) {
    try {
      const response = await api.post('/auth/register/', userData);
      if (response.data.token) {
        await AsyncStorage.setItem('authToken', response.data.token);
      }
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Registration failed');
    }
  },

  async login(username: string, password: string) {
    try {
      const response = await api.post('/auth/login/', { username, password });
      if (response.data.token) {
        await AsyncStorage.setItem('authToken', response.data.token);
      }
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  },

  async logout() {
    try {
      await api.post('/auth/logout/');
      await AsyncStorage.removeItem('authToken');
    } catch (error) {
      await AsyncStorage.removeItem('authToken');
    }
  }
};

// Health API Functions
export const healthApi = {
  // User registration (for backward compatibility)
  async registerUser(profileData: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const userData = {
        username: profileData.name || 'user',
        email: profileData.user?.email || 'user@example.com',
        password: 'defaultpassword',
        password_confirm: 'defaultpassword',
        first_name: profileData.user?.first_name || '',
        last_name: profileData.user?.last_name || ''
      };
      const authResponse = await authApi.register(userData);
      
      // Update profile with additional data
      const profile = await this.updateUserProfile(profileData);
      return profile;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Registration failed');
    }
  },

  // User Profile
  async getUserProfile(): Promise<UserProfile> {
    try {
      const response = await api.get('/health/summary/');
      const profile = response.data.user_profile;
      
      // Add computed fields for backward compatibility
      if (profile.user) {
        profile.name = `${profile.user.first_name} ${profile.user.last_name}`.trim() || profile.user.username;
      }
      
      // Add age calculation if date_of_birth exists
      if (profile.date_of_birth) {
        const birthDate = new Date(profile.date_of_birth);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        profile.age = age;
      }
      
      // Add arrays for backward compatibility
      profile.allergies = response.data.allergies?.map((a: Allergy) => a.name) || [];
      profile.diseases = []; // Can be populated from additional fields
      profile.medications = response.data.medications?.map((m: Medication) => m.name) || [];
      
      return profile;
    } catch (error: any)  {
      throw new Error(error.response?.data?.error || 'Failed to fetch user profile');
    }
  },

  async updateUserProfile(profileData: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const response = await api.patch('/health/profiles/', profileData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to update user profile');
    }
  },

  // Risk Checking
  async checkDrugRisk(drugName: string, userAllergies?: string[]): Promise<RiskCheckResult> {
    try {
      const response = await api.post('/health/check-drug-risk/', {
        drug_name: drugName,
        user_allergies: userAllergies || []
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to check drug risk');
    }
  },

  // AI-Powered Drug Risk Analysis
  async analyzeDrugRisk(drugName: string, userAllergies?: string[]): Promise<DrugRiskAnalysisResult> {
    try {
      const response = await api.post('/ai/drug-risk-analysis/', {
        drug_name: drugName,
        user_allergies: userAllergies || []
      });
      return response.data;
    } catch (error: any) {
      // Fallback to regular risk check if AI endpoint fails
      console.warn('AI analysis failed, falling back to regular risk check:', error.message);
      const fallbackResult = await this.checkDrugRisk(drugName, userAllergies);
      // Convert to AI format
      return {
        risk_level: fallbackResult.risk_level as 'minimal' | 'low' | 'medium' | 'high',
        risk_description: `Risk level: ${fallbackResult.risk_level}`,
        confidence_score: 0.7, // Default confidence
        recommendations: fallbackResult.recommendations,
        ai_analysis: fallbackResult.ai_analysis || fallbackResult.note,
        potential_reactions: fallbackResult.potential_reactions
      };
    }
  },

  // Symptom Analysis
  async analyzeSymptoms(symptoms: string, medications?: string[]): Promise<SymptomAnalysisResult> {
    try {
      const response = await api.post('/health/analyze-symptoms/', {
        symptoms,
        current_medications: medications || []
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to analyze symptoms');
    }
  },

  // Backward compatibility method names
  async analyzeSymptom(request: SymptomAnalysisRequest): Promise<SymptomAnalysisResult> {
    return this.analyzeSymptoms(request.symptoms, request.current_medications);
  },

  // AI Chat
  async sendChatMessage(message: string, messageType: string = 'general'): Promise<ChatResponse> {
    try {
      const response = await api.post('/health/chat/', {
        message,
        message_type: messageType
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to get AI response');
    }
  },

  // Backward compatibility for chat
  async chatWithAI(message: string): Promise<string> {
    try {
      const response = await this.sendChatMessage(message);
      return response.response;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to chat with AI');
    }
  },

  // Health Summary
  async getHealthSummary(): Promise<HealthSummary> {
    try {
      const response = await api.get('/health/summary/');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to fetch health summary');
    }
  },

  // Health History
  async getHealthHistory(): Promise<any[]> {
    try {
      const [riskChecks, symptomAnalyses] = await Promise.all([
        this.getRiskCheckHistory(),
        this.getSymptomAnalysisHistory()
      ]);
      
      return [
        ...riskChecks.map(item => ({ ...item, type: 'risk-check' })),
        ...symptomAnalyses.map(item => ({ ...item, type: 'symptom-analysis' }))
      ].sort((a, b) => new Date(b.timestamp || b.checked_at || b.analyzed_at).getTime() - 
                      new Date(a.timestamp || a.checked_at || a.analyzed_at).getTime());
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to fetch health history');
    }
  },

  async getRiskCheckHistory(): Promise<any[]> {
    try {
      const response = await api.get('/health/risk-checks/');
      return response.data.results || response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to fetch risk check history');
    }
  },

  async getSymptomAnalysisHistory(): Promise<any[]> {
    try {
      const response = await api.get('/health/symptom-analyses/');
      return response.data.results || response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to fetch symptom analysis history');
    }
  },

  async getChatHistory(): Promise<any[]> {
    try {
      const response = await api.get('/health/chat-messages/');
      return response.data.results || response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to fetch chat history');
    }
  }
};