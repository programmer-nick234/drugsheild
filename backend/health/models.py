from django.db import models
from django.contrib.auth.models import User


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=10, choices=[
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other')
    ], null=True, blank=True)
    blood_type = models.CharField(max_length=5, null=True, blank=True)
    height = models.FloatField(null=True, blank=True, help_text="Height in cm")
    weight = models.FloatField(null=True, blank=True, help_text="Weight in kg")
    phone_number = models.CharField(max_length=15, null=True, blank=True)
    emergency_contact = models.CharField(max_length=100, null=True, blank=True)
    emergency_phone = models.CharField(max_length=15, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s Profile"


class Allergy(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='allergies')
    name = models.CharField(max_length=100)
    severity = models.CharField(max_length=20, choices=[
        ('mild', 'Mild'),
        ('moderate', 'Moderate'),
        ('severe', 'Severe')
    ])
    symptoms = models.TextField(null=True, blank=True)
    diagnosed_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.name}"

    class Meta:
        verbose_name_plural = "Allergies"


class Medication(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='medications')
    name = models.CharField(max_length=100)
    dosage = models.CharField(max_length=50)
    frequency = models.CharField(max_length=50)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    prescribing_doctor = models.CharField(max_length=100, null=True, blank=True)
    notes = models.TextField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.name}"


class RiskCheckRecord(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='risk_checks')
    drug_name = models.CharField(max_length=100)
    risk_level = models.CharField(max_length=20, choices=[
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High')
    ])
    potential_reactions = models.JSONField(default=list)
    recommendations = models.TextField()
    checked_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.drug_name} ({self.risk_level})"


class SymptomAnalysis(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='symptom_analyses')
    symptoms = models.TextField()
    classification = models.CharField(max_length=50, choices=[
        ('allergic_reaction', 'Allergic Reaction'),
        ('side_effect', 'Side Effect'),
        ('unrelated', 'Unrelated'),
        ('unknown', 'Unknown')
    ])
    confidence_score = models.FloatField(default=0.0)
    ai_analysis = models.TextField()
    recommendations = models.TextField()
    analyzed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.classification}"

    class Meta:
        verbose_name_plural = "Symptom Analyses"


class ChatMessage(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chat_messages')
    message = models.TextField()
    response = models.TextField()
    message_type = models.CharField(max_length=20, choices=[
        ('general', 'General Health'),
        ('allergy', 'Allergy Related'),
        ('medication', 'Medication Related'),
        ('emergency', 'Emergency')
    ], default='general')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.created_at.strftime('%Y-%m-%d %H:%M')}"

    class Meta:
        ordering = ['-created_at']


class HealthAlert(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='health_alerts')
    title = models.CharField(max_length=200)
    message = models.TextField()
    alert_type = models.CharField(max_length=20, choices=[
        ('info', 'Information'),
        ('warning', 'Warning'),
        ('critical', 'Critical')
    ])
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.title}"

    class Meta:
        ordering = ['-created_at']
