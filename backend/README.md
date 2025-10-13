# DrugSheild Backend API Documentation

## Overview
Django REST API backend for the DrugSheild mobile application providing health management features including drug risk checking, symptom analysis, and AI health consultation.

## Server Information
- **Framework**: Django 4.2.24 with Django REST Framework
- **Database**: SQLite (development)
- **Authentication**: Token-based authentication
- **CORS**: Enabled for React Native frontend
- **Base URL**: `http://10.30.203.192:8000/api/`

## API Endpoints

### Authentication
- `POST /api/auth/register/` - Register new user
- `POST /api/auth/login/` - User login
- `POST /api/auth/logout/` - User logout

### Health Management
- `GET /api/health/summary/` - Get complete health summary
- `GET /api/health/profiles/` - Get user profile
- `PATCH /api/health/profiles/` - Update user profile
- `GET /api/health/allergies/` - Get user allergies
- `POST /api/health/allergies/` - Add new allergy
- `GET /api/health/medications/` - Get user medications
- `POST /api/health/medications/` - Add new medication

### Health Services
- `POST /api/health/check-drug-risk/` - Check drug risk against allergies
- `POST /api/health/analyze-symptoms/` - Analyze symptoms for allergic reactions
- `POST /api/health/chat/` - Chat with AI health assistant
- `GET /api/health/alerts/` - Get health alerts
- `POST /api/health/alerts/mark_all_read/` - Mark all alerts as read

### History & Records
- `GET /api/health/risk-checks/` - Get risk check history
- `GET /api/health/symptom-analyses/` - Get symptom analysis history
- `GET /api/health/chat-messages/` - Get chat message history

## Authentication
All health endpoints require authentication using Token Authentication:
```
Authorization: Token <user_token>
```

## Request/Response Examples

### User Registration
```bash
POST /api/auth/register/
Content-Type: application/json

{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "securepassword123",
    "password_confirm": "securepassword123",
    "first_name": "John",
    "last_name": "Doe"
}
```

### Drug Risk Check
```bash
POST /api/health/check-drug-risk/
Authorization: Token <token>
Content-Type: application/json

{
    "drug_name": "Penicillin",
    "user_allergies": ["Penicillin", "Shellfish"]
}

Response:
{
    "risk_level": "high",
    "potential_reactions": ["Allergic reaction to Penicillin due to penicillin allergy"],
    "recommendations": ["Avoid Penicillin. Consult doctor for alternatives."],
    "record_id": 1
}
```

### Symptom Analysis
```bash
POST /api/health/analyze-symptoms/
Authorization: Token <token>
Content-Type: application/json

{
    "symptoms": "rash, itching, swelling",
    "current_medications": ["Amoxicillin", "Ibuprofen"]
}

Response:
{
    "classification": "allergic_reaction",
    "confidence_score": 0.85,
    "ai_analysis": "Detected 3 allergic reaction indicators.",
    "recommendations": ["Seek immediate medical attention if symptoms worsen.", "Consider stopping any new medications."],
    "analysis_id": 1
}
```

### AI Chat
```bash
POST /api/health/chat/
Authorization: Token <token>
Content-Type: application/json

{
    "message": "I'm experiencing a headache after taking my medication",
    "message_type": "medication"
}

Response:
{
    "response": "When starting new medications, always check with your pharmacist or doctor about potential interactions with your current medications.",
    "message_type": "medication",
    "message_id": 1
}
```

## Database Models

### UserProfile
- User profile information (height, weight, blood type, emergency contacts)
- One-to-one relationship with Django User model

### Allergy
- User allergy records with severity levels
- Links to specific users

### Medication
- Current and past medications
- Dosage, frequency, and prescribing doctor information

### RiskCheckRecord
- History of drug risk assessments
- Risk levels and recommendations

### SymptomAnalysis
- Symptom analysis results
- AI-generated classifications and recommendations

### ChatMessage
- AI chat conversation history
- Message types and responses

### HealthAlert
- System-generated health alerts
- Read/unread status

## Development Setup

### Prerequisites
- Python 3.13+
- pip package manager

### Installation
```bash
cd backend/
pip install --break-system-packages django djangorestframework django-cors-headers python-dotenv requests
python3 manage.py migrate
python3 manage.py runserver 0.0.0.0:8000
```

### Admin Interface
Access the Django admin at `http://localhost:8000/admin/`
Create superuser: `python3 manage.py createsuperuser`

## Frontend Integration
The React Native frontend connects to this backend through the `healthApi.ts` service file which handles:
- Authentication token management
- API request/response handling
- Error handling and user feedback
- Automatic token attachment to requests

## Security Features
- Token-based authentication
- CORS protection configured for mobile app
- User-specific data isolation
- Input validation and sanitization

## Current Status
✅ Backend server running on port 8000
✅ All API endpoints implemented
✅ Database models created and migrated
✅ Frontend service integration ready
✅ Authentication system functional
✅ CORS configured for React Native

## Next Steps
1. Test API endpoints with the React Native frontend
2. Add more sophisticated AI/ML for drug interactions
3. Implement real-time notifications
4. Add data export/import features
5. Enhance security for production deployment