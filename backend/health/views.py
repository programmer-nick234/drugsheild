from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import User
from .models import (
    UserProfile, Allergy, Medication, RiskCheckRecord, 
    SymptomAnalysis, ChatMessage, HealthAlert
)
from .serializers import (
    UserProfileSerializer, AllergySerializer, MedicationSerializer,
    RiskCheckRecordSerializer, SymptomAnalysisSerializer, ChatMessageSerializer,
    HealthAlertSerializer, RiskCheckRequestSerializer, SymptomAnalysisRequestSerializer,
    ChatRequestSerializer, HealthSummarySerializer
)
import json
import random


class UserProfileViewSet(viewsets.ModelViewSet):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return UserProfile.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class AllergyViewSet(viewsets.ModelViewSet):
    serializer_class = AllergySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Allergy.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class MedicationViewSet(viewsets.ModelViewSet):
    serializer_class = MedicationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Medication.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class RiskCheckViewSet(viewsets.ModelViewSet):
    serializer_class = RiskCheckRecordSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return RiskCheckRecord.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class SymptomAnalysisViewSet(viewsets.ModelViewSet):
    serializer_class = SymptomAnalysisSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return SymptomAnalysis.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ChatMessageViewSet(viewsets.ModelViewSet):
    serializer_class = ChatMessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ChatMessage.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class HealthAlertViewSet(viewsets.ModelViewSet):
    serializer_class = HealthAlertSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return HealthAlert.objects.filter(user=self.request.user)

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        HealthAlert.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({'status': 'success'})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def check_drug_risk(request):
    """
    Check drug risk based on user allergies
    """
    serializer = RiskCheckRequestSerializer(data=request.data)
    if serializer.is_valid():
        drug_name = serializer.validated_data['drug_name']
        user_allergies = serializer.validated_data.get('user_allergies', [])
        
        # Get user's known allergies from database
        user_allergy_objects = Allergy.objects.filter(user=request.user)
        known_allergies = [allergy.name.lower() for allergy in user_allergy_objects]
        
        # Combine with provided allergies
        all_allergies = list(set(known_allergies + [allergy.lower() for allergy in user_allergies]))
        
        # Simple risk assessment logic (can be enhanced with AI/ML)
        risk_level = 'low'
        potential_reactions = []
        recommendations = []
        
        # Check for common drug-allergy interactions
        drug_lower = drug_name.lower()
        
        # Example risk assessments (this should be replaced with a proper drug database)
        high_risk_combinations = {
            'penicillin': ['penicillin', 'amoxicillin', 'ampicillin'],
            'aspirin': ['aspirin', 'salicylate'],
            'ibuprofen': ['ibuprofen', 'nsaid'],
            'sulfa': ['sulfamethoxazole', 'sulfonamide']
        }
        
        for allergy in all_allergies:
            for drug_class, related_drugs in high_risk_combinations.items():
                if allergy in drug_class or any(related in drug_lower for related in related_drugs):
                    risk_level = 'high'
                    potential_reactions.append(f'Allergic reaction to {drug_name} due to {allergy} allergy')
                    recommendations.append(f'Avoid {drug_name}. Consult doctor for alternatives.')
        
        if risk_level == 'low':
            recommendations.append('Low risk detected. Take as prescribed.')
            recommendations.append('Monitor for any unusual symptoms.')
        
        # Save the risk check record
        risk_record = RiskCheckRecord.objects.create(
            user=request.user,
            drug_name=drug_name,
            risk_level=risk_level,
            potential_reactions=potential_reactions,
            recommendations='\n'.join(recommendations)
        )
        
        return Response({
            'risk_level': risk_level,
            'potential_reactions': potential_reactions,
            'recommendations': recommendations,
            'record_id': risk_record.id
        })
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def analyze_symptoms(request):
    """
    Analyze symptoms for potential allergic reactions or side effects
    """
    serializer = SymptomAnalysisRequestSerializer(data=request.data)
    if serializer.is_valid():
        symptoms = serializer.validated_data['symptoms']
        medications = serializer.validated_data.get('current_medications', [])
        
        # Simple symptom analysis logic (should be enhanced with AI/ML)
        symptoms_lower = symptoms.lower()
        
        # Define symptom patterns
        allergic_patterns = ['rash', 'hives', 'swelling', 'difficulty breathing', 'itching']
        side_effect_patterns = ['nausea', 'dizziness', 'headache', 'fatigue', 'stomach pain']
        
        classification = 'unrelated'
        confidence = 0.3
        ai_analysis = "Basic symptom analysis performed."
        recommendations = []
        
        # Check for allergic reaction patterns
        allergic_score = sum(1 for pattern in allergic_patterns if pattern in symptoms_lower)
        side_effect_score = sum(1 for pattern in side_effect_patterns if pattern in symptoms_lower)
        
        if allergic_score > 0:
            classification = 'allergic_reaction'
            confidence = min(0.9, 0.4 + (allergic_score * 0.15))
            ai_analysis = f"Detected {allergic_score} allergic reaction indicators."
            recommendations.append("Seek immediate medical attention if symptoms worsen.")
            recommendations.append("Consider stopping any new medications.")
        elif side_effect_score > 0:
            classification = 'side_effect'
            confidence = min(0.8, 0.3 + (side_effect_score * 0.15))
            ai_analysis = f"Detected {side_effect_score} medication side effect indicators."
            recommendations.append("Monitor symptoms and consult your doctor.")
        else:
            recommendations.append("Symptoms may be unrelated to allergies or medications.")
            recommendations.append("Consult a healthcare provider if symptoms persist.")
        
        # Save the analysis
        analysis = SymptomAnalysis.objects.create(
            user=request.user,
            symptoms=symptoms,
            classification=classification,
            confidence_score=confidence,
            ai_analysis=ai_analysis,
            recommendations='\n'.join(recommendations)
        )
        
        return Response({
            'classification': classification,
            'confidence_score': confidence,
            'ai_analysis': ai_analysis,
            'recommendations': recommendations,
            'analysis_id': analysis.id
        })
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def chat_with_ai(request):
    """
    Chat with AI health assistant
    """
    serializer = ChatRequestSerializer(data=request.data)
    if serializer.is_valid():
        message = serializer.validated_data['message']
        message_type = serializer.validated_data['message_type']
        
        # Simple AI response logic (should be enhanced with actual AI/LLM)
        message_lower = message.lower()
        
        # Generate contextual responses based on message type and content
        if 'allergy' in message_lower or 'allergic' in message_lower:
            responses = [
                "I understand you're asking about allergies. It's important to keep track of all known allergies and always inform healthcare providers.",
                "Allergic reactions can range from mild to severe. If you suspect a new allergy, please consult with a healthcare professional for proper testing.",
                "Common allergy symptoms include rashes, itching, swelling, and difficulty breathing. Severe reactions require immediate medical attention."
            ]
        elif 'medication' in message_lower or 'drug' in message_lower:
            responses = [
                "When starting new medications, always check with your pharmacist or doctor about potential interactions with your current medications.",
                "It's important to take medications exactly as prescribed and report any side effects to your healthcare provider.",
                "Never stop taking prescribed medications without consulting your doctor first, even if you feel better."
            ]
        elif 'emergency' in message_lower or 'help' in message_lower:
            responses = [
                "If this is a medical emergency, please call emergency services immediately. I'm here to provide general health information, not emergency care.",
                "For urgent health concerns, contact your doctor or visit the nearest emergency room. I can help with general health questions.",
            ]
        else:
            responses = [
                "I'm here to help with your health questions. Feel free to ask about allergies, medications, or general health concerns.",
                "For personalized medical advice, always consult with qualified healthcare professionals. I can provide general information to help you stay informed.",
                "Remember to keep your health information updated in the app so I can provide more relevant guidance.",
            ]
        
        # Select a random response or use simple keyword matching for more specific responses
        response_text = random.choice(responses)
        
        # Save the chat message
        chat_message = ChatMessage.objects.create(
            user=request.user,
            message=message,
            response=response_text,
            message_type=message_type
        )
        
        return Response({
            'response': response_text,
            'message_type': message_type,
            'message_id': chat_message.id
        })
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def health_summary(request):
    """
    Get comprehensive health summary for user
    """
    user = request.user
    
    # Get or create user profile
    try:
        profile = UserProfile.objects.get(user=user)
    except UserProfile.DoesNotExist:
        profile = UserProfile.objects.create(user=user)
    
    # Get related health data
    allergies = Allergy.objects.filter(user=user)
    medications = Medication.objects.filter(user=user, is_active=True)
    recent_risk_checks = RiskCheckRecord.objects.filter(user=user)[:5]
    recent_symptom_analyses = SymptomAnalysis.objects.filter(user=user)[:5]
    unread_alerts = HealthAlert.objects.filter(user=user, is_read=False)
    
    # Serialize the data
    data = {
        'user_profile': UserProfileSerializer(profile).data,
        'allergies': AllergySerializer(allergies, many=True).data,
        'medications': MedicationSerializer(medications, many=True).data,
        'recent_risk_checks': RiskCheckRecordSerializer(recent_risk_checks, many=True).data,
        'recent_symptom_analyses': SymptomAnalysisSerializer(recent_symptom_analyses, many=True).data,
        'unread_alerts': HealthAlertSerializer(unread_alerts, many=True).data,
    }
    
    return Response(data)
