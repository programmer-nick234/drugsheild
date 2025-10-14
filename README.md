# 🛡️ DrugShield - Complete Medical Health Management System

[![React Native](https://img.shields.io/badge/React%20Native-0.74-blue.svg)](https://reactnative.dev/)
[![Django](https://img.shields.io/badge/Django-4.2-green.svg)](https://djangoproject.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://typescriptlang.org/)
[![Expo](https://img.shields.io/badge/Expo-51.0-black.svg)](https://expo.dev/)

A comprehensive full-stack mobile health application for drug safety management, allergy tracking, and AI-powered health assistance.

## 🏗️ **Project Structure**

```
medtech/
├── 📱 frontend/                 # React Native + Expo Frontend
│   ├── app/                     # App screens and navigation
│   ├── components/              # Reusable UI components
│   ├── services/               # API integration and storage
│   ├── constants/              # Theme and configuration
│   └── assets/                 # Images and static files
│
├── ⚙️ backend/                 # Django REST API Backend
│   ├── drugsheild_api/         # Main Django project
│   ├── health/                 # Health management app
│   ├── authentication/         # User authentication
│   └── requirements.txt        # Python dependencies
│
├── 📚 docs/                    # Documentation
│   ├── API_DOCUMENTATION.md    # API endpoints guide
│   ├── SETUP_GUIDE.md         # Installation instructions
│   └── IMPLEMENTATION.md       # Technical details
│
└── 🔧 Configuration files
```

## ✨ **Features**

### 🔍 **Core Health Management**
- **Drug Risk Analysis**: AI-powered allergy and interaction checking
- **Symptom Analysis**: Intelligent symptom classification and recommendations
- **Health Profile**: Comprehensive user medical information management
- **Health History**: Complete tracking of all health activities

### 🤖 **AI Integration**
- **Smart Health Assistant**: 24/7 AI chat support for health questions
- **Risk Assessment**: Machine learning-based drug interaction analysis
- **Symptom Classification**: Automated symptom analysis and recommendations

### 📱 **User Experience**
- **Professional UI/UX**: Modern, healthcare-focused design
- **Real-time Updates**: Live health status monitoring
- **Offline Support**: Local data storage with cloud sync
- **Cross-platform**: iOS and Android compatibility

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18+ and npm/yarn
- Python 3.11+ and pip
- Expo CLI (`npm install -g @expo/cli`)
- Git

### **Backend Setup**
```bash
# Navigate to backend
cd backend/

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Start Django server
python manage.py runserver 8000
```

### **Frontend Setup**
```bash
# Navigate to frontend
cd frontend/

# Install dependencies
npm install

# Start Expo development server
npx expo start
```

## 🌐 **API Endpoints**

### **Authentication**
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `POST /api/auth/logout/` - User logout

### **Health Management**
- `GET /api/health/summary/` - User health dashboard
- `POST /api/health/check-drug-risk/` - Drug risk analysis
- `POST /api/health/analyze-symptoms/` - Symptom analysis
- `POST /api/health/chat/` - AI health assistant

### **Data Management**
- `GET/PATCH /api/health/profiles/` - User profile management
- `GET /api/health/risk-checks/` - Risk check history
- `GET /api/health/symptom-analyses/` - Symptom analysis history

## 🛠️ **Technology Stack**

### **Frontend (React Native + Expo)**
- **Framework**: React Native 0.74 with Expo 51.0
- **Language**: TypeScript 5.0
- **Navigation**: Expo Router with native navigation
- **State Management**: React Hooks + AsyncStorage
- **HTTP Client**: Axios for API communication
- **UI Components**: Custom themed components
- **Animation**: React Native Animatable

### **Backend (Django REST Framework)**
- **Framework**: Django 4.2.24 + Django REST Framework 3.16.1
- **Database**: SQLite (development) / PostgreSQL (production)
- **Authentication**: Token-based authentication
- **API Documentation**: Auto-generated with DRF
- **CORS**: Django-cors-headers for cross-origin requests

### **Development Tools**
- **Version Control**: Git with GitHub
- **Code Quality**: ESLint + TypeScript strict mode
- **Development Server**: Expo Dev Tools + Django Debug Toolbar
- **Package Management**: npm (frontend) + pip (backend)

## 📊 **Development Status**

### ✅ **Completed Features**
- [x] Complete full-stack architecture
- [x] User authentication system
- [x] Health profile management
- [x] Drug risk analysis
- [x] Symptom analysis with AI
- [x] Chat-based health assistant
- [x] Professional UI/UX design
- [x] Real-time health dashboard
- [x] Complete API integration
- [x] Error-free TypeScript compilation
- [x] Cross-platform mobile support

### 🔄 **In Progress**
- [ ] Advanced AI model integration
- [ ] Push notification system
- [ ] Enhanced data visualization
- [ ] Advanced search and filtering

### 📋 **Planned Features**
- [ ] Telemedicine integration
- [ ] Prescription management
- [ ] Health data export/import
- [ ] Multi-language support
- [ ] Wearable device integration

## 📁 **File Organization**

### **Frontend Structure**
```
frontend/
├── app/
│   ├── (tabs)/                 # Bottom navigation screens
│   ├── _layout.tsx            # Root layout
│   ├── home.tsx               # Dashboard screen
│   ├── risk-check.tsx         # Drug risk analysis
│   ├── symptom-analyzer.tsx   # Symptom analysis
│   ├── health-summary.tsx     # Health overview
│   ├── chat-bot.tsx          # AI assistant
│   └── onboarding.tsx        # User registration
├── components/
│   ├── ui/                    # Reusable UI components
│   ├── themed-text.tsx        # Themed text component
│   └── themed-view.tsx        # Themed view component
└── services/
    ├── healthApi.ts           # Backend API integration
    └── storageService.ts      # Local storage management
```

### **Backend Structure**
```
backend/
├── drugsheild_api/            # Main Django project
│   ├── settings.py            # Django configuration
│   ├── urls.py               # URL routing
│   └── wsgi.py               # WSGI configuration
├── health/                    # Health management app
│   ├── models.py             # Database models
│   ├── views.py              # API views
│   ├── serializers.py        # Data serialization
│   └── urls.py               # App URL patterns
└── authentication/            # Authentication app
    ├── views.py              # Auth views
    └── urls.py               # Auth URLs
```

## 🔒 **Security Features**

- **Token Authentication**: Secure API access with tokens
- **Data Validation**: Comprehensive input validation
- **CORS Protection**: Configured cross-origin security
- **SQL Injection Prevention**: Django ORM protection
- **XSS Protection**: React Native built-in protections

## 📈 **Performance Optimizations**

- **Code Splitting**: Modular component architecture
- **Lazy Loading**: On-demand resource loading
- **Caching**: AsyncStorage for offline functionality
- **API Optimization**: Efficient data fetching strategies
- **Bundle Optimization**: Expo production builds

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 **Support & Contact**

- **Developer**: programmer-nick234
- **Repository**: [GitHub - DrugShield](https://github.com/programmer-nick234/drugsheild)
- **Issues**: Report bugs and request features via GitHub Issues

## 📄 **License**

This project is proprietary software. All rights reserved.

---

**Built with ❤️ for better healthcare management**