import os
import google.generativeai as genai
from django.conf import settings

class GeminiAIService:
    def __init__(self):
        # Configure the Gemini API
        genai.configure(api_key=os.getenv('GOOGLE_GEMINI_API_KEY'))
        self.model = genai.GenerativeModel('gemini-1.5-flash')
        
    def analyze_drug_risk(self, drug_name: str, user_allergies: list) -> dict:
        """Analyze drug risk against user allergies using Gemini AI"""
        prompt = f"""
        As a medical AI assistant, analyze the potential risks of prescribing {drug_name} 
        to a patient with the following known allergies: {', '.join(user_allergies) if user_allergies else 'None reported'}.
        
        Please provide:
        1. Risk level (low/medium/high)
        2. Specific potential reactions
        3. Medical recommendations
        
        Respond in this JSON format:
        {{
            "risk_level": "low/medium/high",
            "potential_reactions": ["reaction1", "reaction2"],
            "recommendations": ["recommendation1", "recommendation2"],
            "confidence_score": 0.95
        }}
        
        Be conservative in risk assessment. If unsure, err on the side of caution.
        """
        
        try:
            response = self.model.generate_content(prompt)
            # Parse the AI response and return structured data
            ai_text = response.text.strip()
            
            # Basic fallback if AI doesn't return JSON
            if not ai_text.startswith('{'):
                return {
                    "risk_level": "medium",
                    "potential_reactions": ["Consult healthcare provider"],
                    "recommendations": ["Professional medical evaluation recommended"],
                    "ai_analysis": ai_text
                }
            
            # Try to parse JSON response
            import json
            try:
                result = json.loads(ai_text)
                result["ai_analysis"] = ai_text
                return result
            except json.JSONDecodeError:
                return {
                    "risk_level": "medium", 
                    "potential_reactions": ["Unable to analyze - consult doctor"],
                    "recommendations": ["Seek professional medical advice"],
                    "ai_analysis": ai_text
                }
                
        except Exception as e:
            return {
                "risk_level": "high",
                "potential_reactions": ["AI analysis unavailable"],
                "recommendations": ["Consult healthcare provider immediately"],
                "error": str(e)
            }
    
    def analyze_symptoms(self, symptoms: str, current_medications: list = None) -> dict:
        """Analyze symptoms using Gemini AI"""
        meds_text = f" Current medications: {', '.join(current_medications)}" if current_medications else ""
        
        prompt = f"""
        As a medical AI assistant, analyze these symptoms: {symptoms}{meds_text}
        
        Classify the symptoms and provide analysis in this JSON format:
        {{
            "classification": "allergic_reaction/side_effect/unrelated/unknown",
            "confidence_score": 0.85,
            "ai_analysis": "Detailed analysis of the symptoms",
            "recommendations": ["recommendation1", "recommendation2"],
            "severity": "mild/moderate/severe",
            "urgency": "low/medium/high"
        }}
        
        Focus on safety. If symptoms suggest serious conditions, recommend immediate medical attention.
        """
        
        try:
            response = self.model.generate_content(prompt)
            ai_text = response.text.strip()
            
            if not ai_text.startswith('{'):
                return {
                    "classification": "unknown",
                    "confidence_score": 0.5,
                    "ai_analysis": ai_text,
                    "recommendations": ["Consult healthcare provider for proper diagnosis"]
                }
            
            import json
            try:
                result = json.loads(ai_text)
                return result
            except json.JSONDecodeError:
                return {
                    "classification": "unknown",
                    "confidence_score": 0.5,
                    "ai_analysis": ai_text,
                    "recommendations": ["Professional medical evaluation needed"]
                }
                
        except Exception as e:
            return {
                "classification": "unknown",
                "confidence_score": 0.0,
                "ai_analysis": "AI analysis temporarily unavailable",
                "recommendations": ["Consult healthcare provider"],
                "error": str(e)
            }
    
    def chat_health_assistant(self, message: str, message_type: str = 'general') -> str:
        """AI health chat assistant using Gemini"""
        context = """
        You are DrugShield AI, a helpful medical information assistant. 
        
        IMPORTANT GUIDELINES:
        - Always remind users you're not a substitute for professional medical advice
        - Never provide specific drug dosages or prescriptions
        - Encourage users to consult healthcare providers for serious concerns
        - Be helpful but medically responsible
        - Focus on general health information and safety
        """
        
        prompt = f"{context}\n\nUser question: {message}\n\nProvide a helpful, safe response:"
        
        try:
            response = self.model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            return "I'm sorry, I'm temporarily unable to provide assistance. Please consult with a healthcare professional for your medical questions."

# Initialize the service
gemini_service = GeminiAIService()