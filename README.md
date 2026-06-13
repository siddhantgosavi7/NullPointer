# Krishi Mitra 🌾

AI-powered farming assistant using IoT + Gemini AI

## 🔗 Live Demo
[Try Krishi Mitra](https://krishi-mitra-ai-livid.vercel.app/)

KrishiMitra AI is a Vite + React agriculture dashboard for farmers. It includes a protected app shell, Firebase authentication, and pages for crop recommendations, weather intelligence, irrigation advice, market intelligence, government schemes, alerts, analytics, and profile management.


## Tech Stack

- **Frontend Core**: React 19, Vite, React Router DOM v7
- **Styling**: Vanilla CSS, TailwindCSS (for utility styling)
- **State Management & Authentication**: Firebase Auth, Firebase Firestore (Database)
- **External Integration**: OpenWeather API (Weather Intel), Groq API (AI Assistant)
- **3D Graphics & Simulation**: Three.js, WebGL/WebGPU Simulation
- **Localization (i18n)**: Static synchronous locales (English, Hindi, Marathi, German) via `react-i18next`
- **Backend**: FastAPI (Python), Uvicorn, Python ML/AI models

## Requirements

- Node.js 18 or newer
- npm
- Python 3.10 or newer
- A Firebase project configured for Auth and Firestore
- Optional: `VITE_GROQ_API_KEY` for the AI Assistant page

## Run the Project

### 1. Start the Frontend Dev Server

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite dev server:
   ```bash
   npm run dev
   ```
4. Open the app in your browser:
   - http://localhost:5173/
   - http://localhost:5173/login.html
   - http://localhost:5173/app/

### 2. Start the Backend Server

Ensure you start the backend FastAPI server to run the AI model inferences (for disease scans, yield prediction, etc.):

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Activate the Python virtual environment:
   - **Windows**:
     ```powershell
     .venv\Scripts\activate
     ```
   - **macOS/Linux**:
     ```bash
     source .venv/bin/activate
     ```
3. Start the uvicorn server:
   ```bash
   python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

## Production Build (Frontend)

```bash
cd frontend
npm run build
npm run lint
```

## Configuration & Localization Notes

- **Firebase Settings**: Configured to load dynamically from environment variables in `src/config/firebase.js` (supported by `.env`).
- **React Entrypoint**: Mounted from `src/main.jsx`.
- **Multilingual Support (i18n)**:
  - Supported locales: English (`en`), Hindi (`hi`), Marathi (`mr`), and German (`de`).
  - The React app uses `react-i18next` with **statically imported** JSON resource bundles (`src/locales/*.json`) in `src/i18n.js` to ensure 100% synchronous initialization and eliminate layout flickers.
  - Active language choice persists across navigations and updates instantly across all views using the shared `krishi_mitra_language` key in `localStorage`.
- **Routing Basename**: The React app is hosted under `/app` (configured in `vite.config.js` and `App.jsx`).
- **Backend API URL**: Configured via `VITE_API_URL` (default: `http://localhost:8000`).

## Repository Structure

```text
frontend/
  index.html                     # Static landing page / React dashboard wrapper
  src/
    i18n.js                      # Synchronous static locale loader for React app
    App.jsx                      # React router configuration
    main.jsx                     # React client bootstrap
    config/firebase.js           # Environment-configured Firebase settings
    context/AuthContext.jsx
    locales/                     # Localized translation JSON keys
      en.json, hi.json, mr.json, de.json
    layouts/
    components/
    pages/
backend/                         # FastAPI model server
```

## Known Issues

- **Hamburger Menu Blank Screen Bug**: When the user clicks the 3 horizontal lines (hamburger menu) in the top corner of the website, the screen turns completely black. However, after logging in, the same action works correctly.

## License

This project is currently an academic/hackathon-style frontend prototype. Any crop advice or AI output should be validated before real-world use.
