# KrishiMitra AI

KrishiMitra AI is a Vite + React agriculture dashboard for farmers. It includes a protected app shell, Firebase authentication, and pages for crop recommendations, weather intelligence, irrigation advice, market intelligence, government schemes, alerts, analytics, and profile management.

## What this project includes

- A landing page at `/`
- A separate login page at `/login.html`
- A protected dashboard app under `/app/`
- Firebase Auth and Firestore integration
- AI assistant access using a Groq API key
- Responsive navigation, dashboard layout, and weather background UI

## Current pages

- Dashboard
- AI Assistant
- Disease Detection
- Crop Recommendation
- Weather Intelligence
- Irrigation Advisor
- Market Intelligence
- Government Schemes
- Farmer Profile
- Alerts Center
- Analytics

## Requirements

- Node.js 18 or newer
- npm
- Python 3.10 or newer
- A Firebase project configured for Auth and Firestore
- Optional: `VITE_GROQ_API_KEY` for the AI Assistant page

## Run the project

1. Install dependencies.

```bash
npm install
```

3. Start the Vite dev server.

```bash
npm run dev
```

4. Open the app in your browser.

```text
http://localhost:5173/
http://localhost:5173/login.html
http://localhost:5173/app/
```

## Production build

```bash
npm run build
npm run lint
```

## Configuration & Localization Notes

- **Firebase Settings**: Configured to load dynamically from environment variables in `src/config/firebase.js` (supported by `.env`).
- **React Entrypoint**: Mounted from `src/main.jsx`.
- **Multilingual Support (i18n)**:
  - Supported locales: English (`en`), Hindi (`hi`), Marathi (`mr`), and German (`de`).
  - The React app uses `react-i18next` with **statically imported** JSON resource bundles (`src/locales/*.json`) in `src/i18n.js` to ensure 100% synchronous initialization and eliminate layout flickers.
  - The static landing (`index.html`) and login (`login.html`) pages utilize a unified ES module script (`src/landing-i18n.js`) which parses `data-i18n` and `data-i18n-placeholder` attributes, sharing locale dictionaries with the React app.
  - Active language choice persists across navigations and updates instantly across all views using the shared `krishi_mitra_language` key in `localStorage`.
- **Routing Basename**: The React app is hosted under `/app` (configured in `vite.config.js` and `App.jsx`).
- **Backend API URL**: Configured via `VITE_API_URL` (default: `http://localhost:8000`).

## Repository Structure

```text
index.html                     # Static landing page (contains localized tags)
login.html                     # Static login/register page (contains localized tags)
app/index.html                 # React dashboard wrapper
src/
  landing-i18n.js              # Localization script for static pages (index & login)
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
backend/                       # FastAPI model server
```

## Running the Backend

Ensure you start the backend FastAPI server to run the AI model inferences (for disease scans, yield prediction, etc.):

```bash
# Activate the Python virtual environment
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

# Start the uvicorn server
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

## Important Safety & Redirect Rules

- Do not open the HTML files directly from disk; run the project using the Vite server.
- The dashboard is protected by Firebase authentication. If the user is not signed in, the app automatically redirects to `/login.html` (the local development mode bypasses this checks to allow immediate testing).
- If the AI Assistant needs external access, add the Groq key through `VITE_GROQ_API_KEY` inside `.env`.

## License

This project is currently an academic/hackathon-style frontend prototype. Any crop advice or AI output should be validated before real-world use.

