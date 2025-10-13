from django.contrib import admin
from .models import (
    UserProfile, Allergy, Medication, RiskCheckRecord, 
    SymptomAnalysis, ChatMessage, HealthAlert
)


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'gender', 'blood_type', 'created_at']
    list_filter = ['gender', 'blood_type', 'created_at']
    search_fields = ['user__username', 'user__email']


@admin.register(Allergy)
class AllergyAdmin(admin.ModelAdmin):
    list_display = ['user', 'name', 'severity', 'created_at']
    list_filter = ['severity', 'created_at']
    search_fields = ['user__username', 'name']


@admin.register(Medication)
class MedicationAdmin(admin.ModelAdmin):
    list_display = ['user', 'name', 'dosage', 'is_active', 'start_date']
    list_filter = ['is_active', 'start_date', 'created_at']
    search_fields = ['user__username', 'name']


@admin.register(RiskCheckRecord)
class RiskCheckRecordAdmin(admin.ModelAdmin):
    list_display = ['user', 'drug_name', 'risk_level', 'checked_at']
    list_filter = ['risk_level', 'checked_at']
    search_fields = ['user__username', 'drug_name']


@admin.register(SymptomAnalysis)
class SymptomAnalysisAdmin(admin.ModelAdmin):
    list_display = ['user', 'classification', 'confidence_score', 'analyzed_at']
    list_filter = ['classification', 'analyzed_at']
    search_fields = ['user__username', 'symptoms']


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ['user', 'message_type', 'created_at']
    list_filter = ['message_type', 'created_at']
    search_fields = ['user__username', 'message']


@admin.register(HealthAlert)
class HealthAlertAdmin(admin.ModelAdmin):
    list_display = ['user', 'title', 'alert_type', 'is_read', 'created_at']
    list_filter = ['alert_type', 'is_read', 'created_at']
    search_fields = ['user__username', 'title']
