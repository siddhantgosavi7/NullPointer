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

## Configuration notes

- Firebase settings are defined in `src/config/firebase.js`.
- The React app is mounted from `src/main.jsx`.
- App routing uses a `/app` basename, so deep links should be opened through the Vite server.
- `vite.config.js` is set up for multiple HTML entry points: `index.html`, `login.html`, and `app/index.html`.
- The frontend communicates with a local backend API at `http://localhost:8000` by default.

## Repository structure

```text
index.html
login.html
app/index.html
src/
  App.jsx
  main.jsx
  config/firebase.js
  context/AuthContext.jsx
  layouts/
  components/
  pages/
public/
```

## Important things

- Do not open the HTML files directly from disk for normal use; run the project with Vite.
- The dashboard is protected. If the user is not signed in, the app redirects to `/login.html`.
- If the AI Assistant needs external access, add the Groq key through `VITE_GROQ_API_KEY`.
- A local backend service is available in `backend/` for AI model inference and should run alongside the frontend for disease, crop, and yield features.

## Upcoming

- Real-time camera capture for live crop scanning
- Better disease and advisory workflows
- More localized farmer guidance
- Offline-friendly support
- Additional analytics and alert improvements

## License

This project is currently an academic/hackathon-style frontend prototype. Any crop advice or AI output should be validated before real-world use.
