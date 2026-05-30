# Requirements Document

## 1. Application Overview

**Application Name**: KrishiRakshak AI

**Description**: An AI-powered smart farming platform that helps farmers detect crop diseases early through image analysis, providing treatment suggestions, weather-based risk alerts, and access to government agricultural schemes.

## 2. Users and Usage Scenarios

**Target Users**: Farmers and agricultural workers in India

**Core Usage Scenarios**:
- Farmers need to identify crop diseases quickly by uploading leaf images
- Farmers want to understand weather-related disease risks for their location
- Farmers need to track crop health history and generate reports
- Farmers seek information about government agricultural schemes

## 3. Page Structure and Functional Description

### Page Hierarchy

```
KrishiRakshak AI
├── Landing Page
├── Login Page
├── Registration Page
├── Dashboard/Workspace
│   ├── Disease Detection Module
│   ├── Weather Risk Alerts Module
│   └── Detection History Module
├── Government Schemes Page
└── Language Settings
```

### 3.1 Landing Page

**Purpose**: Introduce the platform and guide users to register or login

**Content**:
- Hero section with tagline describing the platform's value
- Brief introduction to core features
- Call-to-action buttons for Login and Registration

### 3.2 Registration Page

**Purpose**: Allow new users to create an account

**Functionality**:
- User inputs email and password
- Submit registration form
- Upon success, redirect to Dashboard

### 3.3 Login Page

**Purpose**: Allow existing users to access their account

**Functionality**:
- User inputs email and password
- Submit login form
- Upon success, redirect to Dashboard

### 3.4 Dashboard/Workspace

**Purpose**: Central hub for farmers to access all platform features

**Modules**:

#### 3.4.1 Disease Detection Module

**Functionality**:
- User uploads a crop leaf image
- System analyzes the image using AI
- Display detection results including:
  - Disease name
  - Confidence score
  - Treatment suggestions
  - Prevention tips
- Option to download detection result as PDF report

#### 3.4.2 Weather Risk Alerts Module

**Functionality**:
- Display current weather data for user's location
- Show weather-based disease risk alerts (e.g., high humidity indicates fungal disease risk)

#### 3.4.3 Detection History Module

**Functionality**:
- Display list of past disease detection records
- Show crop health status overview
- Allow user to view details of previous detections

### 3.5 Government Schemes Page

**Purpose**: Provide information about Indian government agricultural schemes

**Functionality**:
- List government schemes with descriptions
- Include links to official scheme pages

### 3.6 Language Settings

**Purpose**: Allow users to switch interface language

**Functionality**:
- Language toggle available in UI
- Support English, Hindi, and Marathi
- Apply selected language across entire interface

## 4. Business Rules and Logic

### 4.1 Disease Detection Process

- User uploads image → System stores image → AI analyzes image via LLM API → System returns disease name, confidence score, treatment suggestions, and prevention tips → User can download PDF report

### 4.2 Weather Risk Alert Logic

- System retrieves user's location → Fetch current weather data from OpenWeatherMap API → Analyze weather conditions (temperature, humidity, precipitation) → Generate disease risk alerts based on weather patterns → Display alerts to user

### 4.3 PDF Report Generation

- User requests report download → System compiles detection result data (disease name, confidence score, treatment, prevention, timestamp) → Generate PDF using jsPDF → Provide download link to user

### 4.4 Multilingual Translation

- User selects language → System translates UI text and content using Google Translate API → Display content in selected language

### 4.5 Data Storage

- User registration data stored in Supabase database
- Uploaded images stored in Supabase Storage
- Detection history records stored in Supabase database
- User authentication managed by Supabase Auth

## 5. Exceptions and Boundary Cases

| Scenario | Handling |
|----------|----------|
| Image upload fails | Display error message, allow user to retry |
| AI detection returns no result | Show message indicating disease not recognized, suggest consulting expert |
| Weather API unavailable | Display message that weather data is temporarily unavailable |
| User location not available | Prompt user to manually enter location or enable location services |
| PDF generation fails | Display error message, allow user to retry download |
| Translation API fails | Fall back to default English language |
| Login credentials incorrect | Display error message, allow user to retry |
| User not logged in | Redirect to Login Page when accessing protected pages |

## 6. Acceptance Criteria

1. User registers an account with email and password
2. User logs in successfully and reaches Dashboard
3. User uploads a crop leaf image in Disease Detection Module
4. System displays disease name, confidence score, treatment suggestions, and prevention tips
5. User downloads PDF report of detection result
6. User views weather risk alerts based on their location
7. User checks detection history in Dashboard
8. User switches interface language to Hindi or Marathi

## 7. Out of Scope for Current Release

- Social features (sharing, commenting, community forums)
- Real-time chat or expert consultation
- Integration with IoT sensors or farm equipment
- Crop yield prediction or harvest planning
- Marketplace for agricultural products
- Mobile native applications (iOS/Android)
- Offline mode or data synchronization
- Advanced analytics or machine learning model training by users
- Integration with other third-party agricultural platforms
- Multi-factor authentication or biometric login
- Customizable dashboard layouts
- Notifications via SMS or push notifications
- Video tutorials or educational content library