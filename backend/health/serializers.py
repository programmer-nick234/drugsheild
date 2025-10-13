from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    UserProfile, Allergy, Medication, RiskCheckRecord, 
    SymptomAnalysis, ChatMessage, HealthAlert
)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        read_only_fields = ['id']


class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = UserProfile
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class AllergySerializer(serializers.ModelSerializer):
    class Meta:
        model = Allergy
        fields = '__all__'
        read_only_fields = ['id', 'user', 'created_at']


class MedicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medication
        fields = '__all__'
        read_only_fields = ['id', 'user', 'created_at']


class RiskCheckRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = RiskCheckRecord
        fields = '__all__'
        read_only_fields = ['id', 'user', 'checked_at']


class SymptomAnalysisSerializer(serializers.ModelSerializer):
    class Meta:
        model = SymptomAnalysis
        fields = '__all__'
        read_only_fields = ['id', 'user', 'analyzed_at']


class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = '__all__'
        read_only_fields = ['id', 'user', 'created_at']


class HealthAlertSerializer(serializers.ModelSerializer):
    class Meta:
        model = HealthAlert
        fields = '__all__'
        read_only_fields = ['id', 'user', 'created_at']


# Request/Response serializers for specific operations
class RiskCheckRequestSerializer(serializers.Serializer):
    drug_name = serializers.CharField(max_length=100)
    user_allergies = serializers.ListField(
        child=serializers.CharField(max_length=100),
        allow_empty=True,
        required=False
    )


class SymptomAnalysisRequestSerializer(serializers.Serializer):
    symptoms = serializers.CharField()
    current_medications = serializers.ListField(
        child=serializers.CharField(max_length=100),
        allow_empty=True,
        required=False
    )


class ChatRequestSerializer(serializers.Serializer):
    message = serializers.CharField()
    message_type = serializers.ChoiceField(
        choices=[
            ('general', 'General Health'),
            ('allergy', 'Allergy Related'),
            ('medication', 'Medication Related'),
            ('emergency', 'Emergency')
        ],
        default='general'
    )


class HealthSummarySerializer(serializers.Serializer):
    user_profile = UserProfileSerializer(read_only=True)
    allergies = AllergySerializer(many=True, read_only=True)
    medications = MedicationSerializer(many=True, read_only=True)
    recent_risk_checks = RiskCheckRecordSerializer(many=True, read_only=True)
    recent_symptom_analyses = SymptomAnalysisSerializer(many=True, read_only=True)
    unread_alerts = HealthAlertSerializer(many=True, read_only=True)