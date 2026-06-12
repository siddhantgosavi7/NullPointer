# Production Deployment Guide (Vercel & Render)

This document provides step-by-step instructions to deploy the KrishiMitra AI platform in a production environment: the **React Frontend** to **Vercel** (or Render Static Sites) and the **Python FastAPI Backend** to **Render**.

---

## 1. Deploying the React Frontend to Vercel

Vercel is the recommended hosting platform for the frontend static site because of its performance, caching, and simple Git integration.

### Steps:

1. **Sign In & Import Repository:**
   - Log into [Vercel](https://vercel.com).
   - Click **Add New** > **Project** and import your Git repository.
2. **Configure Project Settings:**
   - **Framework Preset:** Select **Vite**.
   - **Root Directory:** Edit this setting and select `frontend` (crucial since the React codebase resides in the `frontend/` directory).
   - **Build & Development Settings:**
     - **Build Command:** `npm run build` (default).
     - **Output Directory:** `dist` (default, which resolves to `frontend/dist`).
     - **Install Command:** `npm install` (default).
3. **Environment Variables:**
   - Add a new environment variable:
     - **Key:** `VITE_API_URL`
     - **Value:** *Your deployed backend service URL (e.g., `https://krishimitra-backend.onrender.com`)*
4. **Deploy:**
   - Click **Deploy**. Vercel will automatically install packages, compile the Vite app, and publish it.
   - **Routing Note:** The repository includes a `frontend/vercel.json` file. This tells Vercel's static router to rewrite all `/app/*` requests back to `/app/index.html` so that React Router can handle routing properly on page refreshes.

---

## 2. Deploying the Python FastAPI Backend to Render

Render is an excellent platform for deploying the Python FastAPI server as a web service.

### Steps:

1. **Sign In & Create Web Service:**
   - Log into [Render](https://render.com).
   - Click **New** > **Web Service**.
   - Connect your Git repository.
2. **Configure Web Service:**
   - **Name:** Choose a name (e.g., `krishimitra-backend`).
   - **Language:** Select **Python 3** (or **Docker** if using containers).
   - **Region:** Choose the region closest to your users.
   - **Branch:** E.g., `main`.
   - **Root Directory:** Keep it empty (default, pointing to the project root), or set it to `backend` if you want to deploy only the backend folder. We recommend keeping it empty and defining commands relative to the root:
     - **Build Command:** `pip install -r backend/requirements.txt`
     - **Start Command:** `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
3. **Configure Environment Variables:**
   - Click the **Environment** tab and add the following variables:
     - `PYTHON_VERSION`: `3.11.9` (Tells Render to build using a TensorFlow-supported Python version).
     - `MODEL_DIR`: `ai/models` (Points the backend to the unified AI models directory).
     - `LOG_LEVEL`: `INFO`
     - `MAX_IMAGE_SIZE_MB`: `8` (Protects your Render worker memory by limiting upload payload size).
     - `PYTHONPATH`: `.`
4. **Advanced Settings (Render Free Tier Warning):**
   - Since the backend loads a TensorFlow model (`~31MB`), startup can take about 10–30 seconds. On Render's Free tier, the service may sleep after 15 minutes of inactivity. The first request after it sleeps will trigger a cold start and may take ~1 minute to spin up and load the model.
5. **Deploy:**
   - Click **Create Web Service**. Render will install requirements, start uvicorn, and expose your service.

---

## 3. Alternative: Deploying Frontend to Render (Static Site)

If you prefer to keep both the frontend and backend on Render:

1. **Create Static Site:**
   - Click **New** > **Static Site**.
   - Connect your repository.
2. **Configure settings:**
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Publish Directory:** `dist`
3. **Environment Variables:**
   - Add `VITE_API_URL` pointing to your Render backend web service.
4. **Routing Rules:**
   - On the Render dashboard under **Redirects/Rewrites**:
     - **Source:** `/app/*`
     - **Destination:** `/app/index.html`
     - **Action:** `Rewrite`
