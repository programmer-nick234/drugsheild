import axios from 'axios';

// Base API configuration
const API_BASE_URL = 'http://localhost:8000'; // Change this to your backend URL

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types for API responses
export interface RiskCheckRequest {
  allergies: string;
  drugName: string;
  userId?: string;
}

export interface RiskCheckResponse {
  risk: 'Low' | 'Medium' | 'High';
  advice: string;
  timestamp: string;
}

export interface SymptomAnalysisRequest {
  symptoms: string;
  userId?: string;
}

export interface SymptomAnalysisResponse {
  classification: 'Allergic Reaction' | 'Side Effect' | 'Unrelated';
  explanation: string;
  timestamp: string;
}

export interface UserProfile {
  name: string;
  age: number;
  gender: string;
  allergies: string[];
  diseases: string[];
}

// API functions
export const healthApi = {
  // Check drug risk
  checkDrugRisk: async (data: RiskCheckRequest): Promise<RiskCheckResponse> => {
    try {
      const response = await api.post('/check_risk', data);
      return response.data;
    } catch (error) {
      console.error('Error checking drug risk:', error);
      // Fallback response for development
      return {
        risk: 'Low',
        advice: 'This is a mock response. Please connect to your backend.',
        timestamp: new Date().toISOString(),
      };
    }
  },

  // Analyze symptoms
  analyzeSymptom: async (data: SymptomAnalysisRequest): Promise<SymptomAnalysisResponse> => {
    try {
      const response = await api.post('/analyze_symptom', data);
      return response.data;
    } catch (error) {
      console.error('Error analyzing symptom:', error);
      // Fallback response for development
      return {
        classification: 'Unrelated',
        explanation: 'This is a mock response. Please connect to your backend.',
        timestamp: new Date().toISOString(),
      };
    }
  },

  // Register user profile
  registerUser: async (profile: UserProfile): Promise<{ success: boolean; userId: string }> => {
    try {
      const response = await api.post('/register', profile);
      return response.data;
    } catch (error) {
      console.error('Error registering user:', error);
      return {
        success: true,
        userId: 'mock-user-id',
      };
    }
  },

  // Enhanced Chat with AI assistant
  chatWithAI: async (message: string): Promise<{ response: string }> => {
    try {
      // Add delay to simulate real API processing
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      const response = await api.post('/chat', { 
        message,
        timestamp: new Date().toISOString(),
        context: 'health_assistant'
      });
      return response.data;
    } catch (error) {
      console.error('Error chatting with AI:', error);
      
      // Enhanced fallback responses based on message content
      const lowerMessage = message.toLowerCase();
      
      if (lowerMessage.includes('interaction') || lowerMessage.includes('together')) {
        return {
          response: 'Drug interactions can be serious. Always consult your pharmacist or doctor before combining medications. They can check for potential interactions and suggest safer alternatives if needed.\n\n⚠️ For immediate concerns about drug interactions, contact your healthcare provider or pharmacist right away.'
        };
      }
      
      if (lowerMessage.includes('side effect') || lowerMessage.includes('adverse')) {
        return {
          response: 'Common medication side effects include nausea, dizziness, headache, and fatigue. Most side effects are mild and temporary, but some can be serious.\n\n📋 What to do:\n• Keep a record of any symptoms\n• Contact your doctor if side effects persist\n• Never stop medication abruptly without medical advice\n\n🚨 Seek immediate medical attention for severe reactions like difficulty breathing, swelling, or severe rash.'
        };
      }
      
      if (lowerMessage.includes('allerg') || lowerMessage.includes('reaction')) {
        return {
          response: 'Allergic reactions to medications can range from mild to life-threatening. Common signs include:\n\n🔴 Mild: Rash, itching, hives\n🟡 Moderate: Swelling, difficulty swallowing\n🚨 Severe: Difficulty breathing, rapid pulse, loss of consciousness\n\n⚡ For severe allergic reactions (anaphylaxis), call emergency services immediately!\n\nAlways inform healthcare providers about known allergies and carry medical identification if you have serious allergies.'
        };
      }
      
      if (lowerMessage.includes('expired') || lowerMessage.includes('old medication')) {
        return {
          response: 'Taking expired medications is generally not recommended:\n\n❌ Risks:\n• Reduced effectiveness\n• Potential toxicity (rare but possible)\n• Unknown chemical changes\n\n✅ Best practices:\n• Check expiration dates regularly\n• Dispose of expired medications safely\n• Never take medications past their expiration date\n• Ask your pharmacist about proper disposal methods\n\nIf you accidentally took expired medication and feel unwell, contact your healthcare provider.'
        };
      }
      
      if (lowerMessage.includes('generic') || lowerMessage.includes('brand')) {
        return {
          response: 'Generic and brand-name medications contain the same active ingredients and are equally effective:\n\n💊 Generic medications:\n• Same active ingredient as brand-name\n• Meet same FDA standards\n• Usually cost less\n• May have different inactive ingredients\n\n🏷️ Brand-name medications:\n• Original formulation\n• Usually more expensive\n• Same therapeutic effect\n\nBoth are safe and effective. Your doctor or pharmacist can help you choose what\'s best for your situation and budget.'
        };
      }
      
      return {
        response: 'I\'m currently experiencing technical difficulties connecting to my knowledge base. Here are some general medication safety tips:\n\n✅ Always follow prescribed dosages\n✅ Take medications with or without food as directed\n✅ Store medications properly (temperature, humidity)\n✅ Keep an updated list of all medications\n✅ Inform all healthcare providers about your medications\n\n🆘 For urgent medical questions, contact your healthcare provider or call emergency services.\n\n🔄 Please try your question again in a few moments.'
      };
    }
  },
};