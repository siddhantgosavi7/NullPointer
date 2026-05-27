# GitHub Pages Deployment - Complete Setup Guide

## ✅ All Required Fixes

This document contains all the code changes needed to fix your GitHub Pages 404 errors.

### Files to Update:
1. `vite.config.js`
2. `src/main.jsx`
3. `index.html`
4. `.github/workflows/deploy.yml` (new)

---

## 1. Update `vite.config.js`

**Current file has incomplete build config. Replace with:**

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/AGTECHATHON-2.0-2k26/',
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
  server: {
    port: 5173,
    strictPort: false,
    host: true,
  },
});
```

**Changes:**
- ✅ Added `base: '/AGTECHATHON-2.0-2k26/'` for correct asset paths
- ✅ Added `rollupOptions` for better code splitting
- ✅ Added `server` config for development

---

## 2. Update `src/main.jsx`

**Current file missing router basename. Replace with:**

```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AppProvider } from './context/AppContext.jsx';
import './translations/i18n.js';
import './styles.css';

// ✅ Dynamic basename for dev/prod
const basename = import.meta.env.DEV ? '/' : '/AGTECHATHON-2.0-2k26/';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* ✅ Added basename prop */}
    <BrowserRouter basename={basename}>
      <AppProvider>
        <App />
      </AppProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
```

**Changes:**
- ✅ Added dynamic `basename` logic
- ✅ Passes `basename` to BrowserRouter
- Dev mode: uses `/` (root)
- Prod mode: uses `/AGTECHATHON-2.0-2k26/` (GitHub Pages)

---

## 3. Update `index.html`

**Current file missing base href. Replace with:**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta
      name="description"
      content="KrishiRakshak AI helps farmers detect crop diseases, understand weather risks, and create treatment reports."
    />
    <!-- ✅ Added base tag -->
    <base href="/AGTECHATHON-2.0-2k26/" />
    <title>KrishiRakshak AI</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

**Changes:**
- ✅ Added `<base href="/AGTECHATHON-2.0-2k26/" />`
- Tells browser to resolve all relative URLs from this path
- Fixes module script resolution

---

## 4. Create `.github/workflows/deploy.yml` (NEW FILE)

**Create new file at `.github/workflows/deploy.yml`:**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build frontend
        run: npm run build
        env:
          VITE_API_URL: ${{ secrets.VITE_API_URL || 'http://localhost:4000/api' }}
      
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    
    runs-on: ubuntu-latest
    needs: build
    
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

**What it does:**
- ✅ Triggers on push to main branch
- ✅ Sets up Node.js 18 with npm caching
- ✅ Installs dependencies & builds
- ✅ Uploads dist folder as artifact
- ✅ Deploys to GitHub Pages automatically

---

## 🚀 Step-by-Step Implementation

### Step 1: Update Files Locally
```bash
# Clone/pull latest
git clone https://github.com/siddhantgosavi7/AGTECHATHON-2.0-2k26.git
cd AGTECHATHON-2.0-2k26

# Switch to branch or create new
git checkout -b fix/github-pages-deployment

# Copy the code from above into:
# - vite.config.js
# - src/main.jsx
# - index.html
# - Create: .github/workflows/deploy.yml
```

### Step 2: Test Locally
```bash
npm install
npm run build

# Check that dist folder has:
# dist/
#   index.html
#   assets/
#     main-*.js
#     vendor-*.js
#     main-*.css
```

### Step 3: Commit & Push
```bash
git add vite.config.js src/main.jsx index.html .github/workflows/deploy.yml
git commit -m "fix: resolve GitHub Pages 404 errors - configure base paths and add workflow"
git push origin fix/github-pages-deployment
```

### Step 4: Create Pull Request
1. Go to GitHub repo
2. Click "Compare & pull request"
3. Add description
4. Click "Create pull request"

### Step 5: Merge to Main
1. Click "Merge pull request"
2. Confirm merge
3. GitHub Actions will auto-deploy!

### Step 6: Enable GitHub Pages
1. Go to **Settings**
2. Click **Pages** (left sidebar)
3. Set **Source** to `GitHub Actions`
4. Click **Save**

### Step 7: Configure Workflow Permissions
1. Go to **Settings** → **Actions** → **General**
2. Under "Workflow permissions", select **Read and write permissions**
3. Click **Save**

### Step 8: Access Your App
```
https://siddhantgosavi7.github.io/AGTECHATHON-2.0-2k26/
```

---

## ✅ Verification Checklist

After deployment (2-3 minutes), verify:

- [ ] App loads without 404s
- [ ] CSS is applied (styled page, not blank)
- [ ] Images load correctly
- [ ] Navigation works:
  - [ ] `/detect` loads
  - [ ] `/dashboard` loads
  - [ ] `/chatbot` loads
  - [ ] All routes accessible
- [ ] No console errors (F12 → Console tab)
- [ ] Network tab shows no 404s (F12 → Network tab)
- [ ] Page title shows "KrishiRakshak AI"

---

## 🐛 Troubleshooting

### Still seeing 404s?
```bash
# 1. Clear browser cache
# Ctrl+Shift+Delete (Windows) or Cmd+Shift+Delete (Mac)

# 2. Check GitHub Actions logs
# Go to Actions tab → See latest workflow run

# 3. Verify build output
# Check that dist/index.html exists and is not empty
npm run build
cat dist/index.html
```

### App loads but blank page?
- Check F12 Console for errors
- Verify `base` path matches GitHub repo name
- Ensure all imports use relative paths

### Routes not working?
- Verify `basename` is set correctly in src/main.jsx
- Check that BrowserRouter wraps entire App
- Ensure React Router v6+ is installed

### GitHub Actions failing?
- Go to Actions tab → See error logs
- Common issue: Node version mismatch (use 18)
- Try: `npm ci` instead of `npm install`

---

## 📊 Summary of Changes

| File | Change | Why |
|------|--------|-----|
| `vite.config.js` | Add `base` path + code splitting | Assets built with correct paths |
| `src/main.jsx` | Add `basename` prop | Router knows about subdirectory |
| `index.html` | Add `<base>` tag | HTML resolves assets correctly |
| `.github/workflows/deploy.yml` | NEW workflow | Automated deployment |

---

## 🎯 Expected Result

After all changes:
- ✅ App accessible at: `https://siddhantgosavi7.github.io/AGTECHATHON-2.0-2k26/`
- ✅ All assets load (no 404s)
- ✅ Navigation works
- ✅ Auto-deploys on push to main
- ✅ Production-ready setup

