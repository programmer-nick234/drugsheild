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
from .gemini_service import GeminiAIService
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
    Check drug risk based on user allergies using AI analysis
    """
    serializer = RiskCheckRequestSerializer(data=request.data)
    if serializer.is_valid():
        drug_name = serializer.validated_data['drug_name']
        user_allergies = serializer.validated_data.get('user_allergies', [])
        
        # Get user's known allergies from database
        user_allergy_objects = Allergy.objects.filter(user=request.user)
        known_allergies = [allergy.name for allergy in user_allergy_objects]
        
        # Combine with provided allergies
        all_allergies = list(set(known_allergies + user_allergies))
        
        # Use AI for comprehensive drug risk analysis
        try:
            ai_service = GeminiAIService()
            analysis_result = ai_service.analyze_drug_risk(drug_name, all_allergies)
            
            if analysis_result:
                # Save the risk check record
                risk_record = RiskCheckRecord.objects.create(
                    user=request.user,
                    drug_name=drug_name,
                    risk_level=analysis_result['risk_level'],
                    potential_reactions=analysis_result['potential_reactions'],
                    recommendations='\n'.join(analysis_result['recommendations'])
                )
                
                return Response({
                    'risk_level': analysis_result['risk_level'],
                    'potential_reactions': analysis_result['potential_reactions'],
                    'recommendations': analysis_result['recommendations'],
                    'ai_analysis': analysis_result.get('analysis', ''),
                    'record_id': risk_record.id
                })
            else:
                return Response({'error': 'Failed to analyze drug risk'}, status=500)
                
        except Exception as e:
            # Fallback to basic analysis if AI fails
            risk_level = 'medium'
            potential_reactions = ['Consult healthcare provider for personalized risk assessment']
            recommendations = ['Please consult with a healthcare professional before taking this medication']
            
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
                'record_id': risk_record.id,
                'note': 'Basic analysis provided - AI temporarily unavailable'
            })
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def analyze_symptoms(request):
    """
    Analyze symptoms for potential allergic reactions or side effects using AI
    """
    serializer = SymptomAnalysisRequestSerializer(data=request.data)
    if serializer.is_valid():
        symptoms = serializer.validated_data['symptoms']
        medications = serializer.validated_data.get('current_medications', [])
        
        # Use AI for comprehensive symptom analysis
        try:
            ai_service = GeminiAIService()
            analysis_result = ai_service.analyze_symptoms(symptoms, medications)
            
            if analysis_result:
                # Save the analysis
                analysis = SymptomAnalysis.objects.create(
                    user=request.user,
                    symptoms=symptoms,
                    classification=analysis_result['classification'],
                    confidence_score=analysis_result['confidence_score'],
                    ai_analysis=analysis_result['analysis'],
                    recommendations='\n'.join(analysis_result['recommendations'])
                )
                
                return Response({
                    'classification': analysis_result['classification'],
                    'confidence_score': analysis_result['confidence_score'],
                    'ai_analysis': analysis_result['analysis'],
                    'recommendations': analysis_result['recommendations'],
                    'analysis_id': analysis.id
                })
            else:
                return Response({'error': 'Failed to analyze symptoms'}, status=500)
                
        except Exception as e:
            # Fallback to basic analysis if AI fails
            classification = 'unrelated'
            confidence = 0.5
            ai_analysis = "Basic analysis - Please consult a healthcare professional"
            recommendations = ["Consult with a healthcare professional for proper diagnosis"]
            
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
@permission_classes([])  # Allow unauthenticated access for development
def chat_with_ai(request):
    """
    Chat with AI health assistant using Gemini AI
    """
    serializer = ChatRequestSerializer(data=request.data)
    if serializer.is_valid():
        message = serializer.validated_data['message']
        message_type = serializer.validated_data['message_type']
        
        # Get user context for better AI responses (if user is authenticated)
        user_allergies = []
        user_medications = []
        if request.user.is_authenticated:
            user_allergies = list(Allergy.objects.filter(user=request.user).values_list('name', flat=True))
            user_medications = list(Medication.objects.filter(user=request.user).values_list('name', flat=True))
        
        # Use AI for intelligent health assistance
        try:
            ai_service = GeminiAIService()
            response_text = ai_service.chat_health_assistant(message, user_allergies, user_medications)
            
            if not response_text:
                response_text = "I'm here to help with your health questions. Please try rephrasing your question or consult a healthcare professional for specific medical advice."
                
        except Exception as e:
            # Fallback response if AI fails
            response_text = "I'm currently unable to provide a detailed response. For important health questions, please consult with a healthcare professional."
        
        # Save the chat message (only if user is authenticated)
        message_id = None
        if request.user.is_authenticated:
            chat_message = ChatMessage.objects.create(
                user=request.user,
                message=message,
                response=response_text,
                message_type=message_type
            )
            message_id = chat_message.id
        
        return Response({
            'response': response_text,
            'message_type': message_type,
            'message_id': message_id
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
