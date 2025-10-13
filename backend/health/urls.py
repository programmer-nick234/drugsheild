from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'profiles', views.UserProfileViewSet, basename='profile')
router.register(r'allergies', views.AllergyViewSet, basename='allergy')
router.register(r'medications', views.MedicationViewSet, basename='medication')
router.register(r'risk-checks', views.RiskCheckViewSet, basename='risk-check')
router.register(r'symptom-analyses', views.SymptomAnalysisViewSet, basename='symptom-analysis')
router.register(r'chat-messages', views.ChatMessageViewSet, basename='chat-message')
router.register(r'alerts', views.HealthAlertViewSet, basename='alert')

urlpatterns = [
    path('', include(router.urls)),
    path('check-drug-risk/', views.check_drug_risk, name='check-drug-risk'),
    path('analyze-symptoms/', views.analyze_symptoms, name='analyze-symptoms'),
    path('chat/', views.chat_with_ai, name='chat-ai'),
    path('summary/', views.health_summary, name='health-summary'),
]