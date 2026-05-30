# KrishiRakshak AI

An AI-powered smart farming platform built for hackathon demo flow and aligned to the requirements in [Requirement.md](Requirement.md). It helps farmers detect crop diseases from leaf images, check weather-based disease risk, track history, generate PDF reports, and browse government agricultural schemes.

## Hackathon Goal

KrishiRakshak AI is designed as a farmer-first workspace for quick field decisions. The current codebase focuses on a strong demo experience with a clean UI, disease-analysis workflow, weather alerts, PDF reports, history, and multilingual navigation. The requirement document also defines the production direction for Supabase-backed auth, storage, and persistence.

## What It Does

- AI disease detection from crop leaf images
- Treatment suggestions and prevention tips
- Weather-based disease risk alerts
- Detection history and report export
- Government scheme listings with official links
- English, Hindi, and Marathi UI support
- Mobile-friendly layout and dark mode

## Current Implementation Status

This repo already includes working app pages and backend routes for the core demo flow:

- Landing, login/register, dashboard, detection, weather, history, reports, schemes, and chatbot pages
- Client-side session handling for the hackathon build
- Persistent local state for demo auth and saved reports
- File-based history/report persistence on the backend
- jsPDF report export
- Weather fallback logic with optional live OpenWeatherMap support
- Gemini-backed disease analysis flow

Planned production work from the requirement document:

- Supabase Auth for real user accounts
- Supabase Database for detections, reports, and user data
- Supabase Storage for uploaded images
- Google Translate API for server-assisted translation

## Project Structure

```text
NullPointer/
├── server/
│   ├── config/
│   ├── controllers/
│   ├── data/
│   ├── middleware/
│   ├── routes/
│   └── services/
├── src/
│   ├── components/
│   ├── context/
│   ├── pages/
│   ├── services/
│   ├── translations/
│   └── utils/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── Requirement.md
```

## Pages

- Landing Page: introduces the platform and routes users to login or registration
- Auth Page: sign in, register, and demo session persistence
- Dashboard: summary cards, recent detections, and action shortcuts
- Detection: upload a crop leaf image and get an AI diagnosis
- Weather: show local weather and disease-risk alerts
- History: search past detections and export them
- Reports: preview and download diagnosis reports
- Schemes: list government schemes and expert resources
- Chatbot: ask farming questions in local languages

## API Surface

### Health

```http
GET /api/health
```

### Disease detection

```http
POST /api/detect-disease
POST /api/diagnoses
```

### History and reports

```http
GET /api/history
GET /api/reports
POST /api/reports
```

### Weather and schemes

```http
GET /api/weather-risk?location=Pune
GET /api/government-schemes
```

### Chatbot

```http
POST /api/chatbot
```

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Create `.env` from the example file and add the keys you want to use.

```bash
GEMINI_API_KEY=your_gemini_key
GEMINI_MODEL=gemini-2.5-flash
OPENWEATHERMAP_API_KEY=your_openweather_key
OPENWEATHERMAP_BASE_URL=https://api.openweathermap.org/data/2.5/weather
CLIENT_URL=http://localhost:5173
PORT=4000
VITE_API_URL=http://localhost:4000/api
```

### 3. Run the app

```bash
npm run dev:full
```

Open:

```text
http://localhost:5173
```

## Development Commands

```bash
npm run dev       # Frontend only
npm run server    # Backend only
npm run dev:full   # Frontend + backend
npm run build     # Production build
npm run preview   # Preview build
npm run lint      # Lint source files
```

## Hackathon Flow

1. Open the landing page
2. Register or log in
3. Go to Detection and upload a crop leaf image
4. Review the disease name, confidence, treatment, and prevention tips
5. Download the PDF report
6. Check weather risk alerts for your location
7. Review detection history from the dashboard or history page
8. Browse government schemes and open official links

## Requirement Coverage

Matches the requirement document in the current demo build:

- Landing page and auth entry points
- Crop disease detection via AI analysis
- Weather risk alerts
- PDF report generation
- Detection history and dashboard summary
- Government schemes page
- Hindi and Marathi language options in the UI

Remaining production gaps from the requirement:

- Supabase Auth integration
- Supabase storage/database persistence
- Server-side translation integration
- Real user identity/session management

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, Tailwind CSS |
| Backend | Node.js, Express |
| AI | Gemini |
| Weather | OpenWeatherMap |
| PDF | jsPDF |
| Storage | Local demo persistence now, Supabase planned |
| Routing | React Router |

## Notes for Demo Judges

- The app is built around the hackathon use case, not a generic template
- The UI is farmer-focused and mobile-friendly
- The detection flow is designed to show end-to-end value quickly
- The requirement doc can be used as the product spec for the next production step

## License

Private project for hackathon use.

## Contact

Prathamesh Chougale - calmeflea69@gmail.com
