<<<<<<< HEAD
# 🌾 KrishiRakshak AI - Complete Setup & Deployment Guide

> Your intelligent farming companion with AI-powered disease detection, real-time maps, and multi-language support.

## 📸 Features

- 🤖 **AI Disease Detection** - Upload crop photos for instant diagnosis
- 🗺️ **Real-time Google Maps** - Find nearby fertilizer shops, experts, labs
- 💬 **Multi-language Chatbot** - English, Hindi, Marathi support
- 📊 **Dashboard & Analytics** - Track scanning history and trends
- ⚠️ **Weather Alerts** - Risk assessment based on weather conditions
- 🏛️ **Government Schemes** - Access to agricultural subsidy programs
- 📱 **Mobile Responsive** - Works on all devices
- 🌙 **Dark Mode** - Comfortable viewing in any lighting

## 🚀 Quick Start (5 Minutes)

### 1. Clone & Install
```bash
git clone <your-repo>
cd <project-directory>
npm install
```

### 2. Get API Keys (Free)
- **Google Maps**: [console.cloud.google.com](https://console.cloud.google.com)
- **Gemini AI**: [aistudio.google.com](https://aistudio.google.com/app/apikey)

### 3. Setup Environment
```bash
# Create .env from template
cp .env.example .env

# Add your API keys
GEMINI_API_KEY=<your-key>
GOOGLE_MAPS_API_KEY=<your-key>
```

### 4. Run It!
```bash
npm run dev:full
```

Open http://localhost:5173 🎉

## 📚 Full Documentation

| Document | Purpose |
|----------|---------|
| [QUICK_START.md](QUICK_START.md) | 5-minute setup guide |
| [MAPS_SETUP.md](MAPS_SETUP.md) | Real-time maps + database integration |
| [AUTH_SETUP.md](AUTH_SETUP.md) | Authentication & API key management |
| [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) | Deploy to production (Vercel + Railway) |
| [ARCHITECTURE.md](ARCHITECTURE.md) | System design & data flows |
| [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) | What was added in recent update |

**Start here:** [QUICK_START.md](QUICK_START.md) ⬅️

## 🏗️ Project Structure

```
new-project/
├── server/                    # Backend (Node.js + Express)
│   ├── controllers/          # API logic
│   ├── services/             # Google Maps, Gemini, Weather APIs
│   ├── routes/               # API endpoints
│   ├── middleware/           # Auth, file upload, error handling
│   ├── config/               # Environment configuration
│   └── data/                 # Mock data
│
├── src/                      # Frontend (React + Vite)
│   ├── pages/               # Full-page components
│   │   ├── LandingPage.jsx
│   │   ├── DetectionPage.jsx
│   │   ├── ChatbotPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── SchemesPage.jsx  # 🗺️ Maps integration
│   │   └── ...
│   ├── components/          # Reusable UI components
│   │   ├── MapComponent.jsx # 🗺️ NEW - Interactive maps
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   └── ...
│   ├── services/            # API client functions
│   ├── context/             # Global state management
│   └── styles/              # Tailwind CSS
│
├── public/                  # Static assets
├── .env.example            # Environment template
├── .env.local              # Local environment (frontend)
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## 🔌 Available API Endpoints

### Public Endpoints
```bash
# Server Status
GET /api/health

# Location Data
GET /api/nearby?latitude=18.52&longitude=73.85&type=fertilizer_store
GET /api/place-details?placeId=ChIJrz...

# Static Data
GET /api/government-schemes
GET /api/weather-risk?location=Pune
```

### Protected Endpoints (Requires JWT Token)
```bash
# Disease Detection
POST /api/detect-disease        # Upload image
GET  /api/history               # Get detection history

# Chat & Chat
POST /api/chatbot               # Send message
POST /api/chatbot-session       # Start new session

# Reports
POST /api/reports               # Create report
GET  /api/reports               # Get reports
```

## 🛠️ Development Commands

```bash
# Start everything
npm run dev:full

# Backend only
npm run server

# Frontend only  
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Linting
npm run lint
```

## 🚀 Deployment

### Option 1: Railway + Vercel (Recommended)

1. **Deploy Backend to Railway**
   ```bash
   # Go to railway.app
   # Connect GitHub repo
   # Add environment variables
   # Auto-deploys on push
   ```

2. **Deploy Frontend to Vercel**
   ```bash
   npm install -g vercel
   vercel
   ```

3. **Set Production URLs**
   - Frontend: Update `VITE_API_URL` in Vercel env
   - Backend: Update `CLIENT_URL` in Railway env

**Full guide:** See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

## 🗺️ New Features Added

### Real-time Google Maps Integration
✅ User geolocation detection  
✅ Interactive map with 3 location types  
✅ Distance calculations  
✅ Real-time marker updates  
✅ Location details (rating, hours, phone)  
✅ Responsive design  

### Database Ready
✅ Supabase PostgreSQL integration  
✅ SQL schema provided  
✅ Real-time API capabilities  
✅ User authentication  

### Enhanced Security
✅ JWT authentication middleware  
✅ API key management  
✅ CORS protection  
✅ Environment variable validation  

## 🔐 Security Best Practices

- ✅ Never commit `.env` to git
- ✅ Use `.env.example` as template
- ✅ Rotate API keys monthly
- ✅ Use HTTPS in production
- ✅ Implement rate limiting
- ✅ Validate all inputs
- ✅ Use strong JWT secret

## 📊 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, Tailwind CSS |
| **Backend** | Node.js, Express.js, Multer |
| **Database** | Supabase (PostgreSQL) |
| **APIs** | Google Maps, Google Gemini, Weather API |
| **Authentication** | JWT tokens |
| **Hosting** | Vercel (frontend), Railway (backend) |
| **Styling** | Tailwind CSS, Framer Motion |
| **Maps** | Google Maps JavaScript API |

## 🧪 Testing Locally

### 1. Test Disease Detection
- Go to http://localhost:5173/detection
- Upload a crop image
- See AI diagnosis

### 2. Test Maps
- Go to http://localhost:5173/schemes
- Allow geolocation
- See nearby locations on map
- Click markers for details

### 3. Test Chatbot
- Go to http://localhost:5173/chatbot
- Ask agriculture questions
- Try different languages

### 4. Test Dashboard
- Go to http://localhost:5173/dashboard
- See scan history
- View analytics

## 🐛 Troubleshooting

### Maps Not Loading
```bash
# 1. Check API key
echo $GOOGLE_MAPS_API_KEY

# 2. Verify in Google Cloud Console
# - API is enabled
# - Key is valid
# - Domain whitelisted

# 3. Check browser console
# Press F12 and look for errors
```

### Backend Not Responding
```bash
# 1. Check running
curl http://localhost:4000/api/health

# 2. Check logs
npm run server

# 3. Verify port 4000 is free
lsof -i :4000
```

### Database Connection
```bash
# Verify Supabase credentials in .env
echo $SUPABASE_URL
echo $SUPABASE_KEY

# Test connection from Supabase dashboard
```

## 📈 Performance Tips

- 🖼️ Optimize images before upload
- 🔄 Enable browser caching
- 📦 Use code splitting
- 🚀 Deploy to CDN (Vercel auto-does this)
- 🗜️ Compress API responses
- ⚡ Use lazy loading

## 🎯 Next Steps

1. **Local Development**
   ```bash
   npm install
   npm run dev:full
   ```

2. **Setup Database** (Optional now, required for production)
   - Create Supabase account
   - Run SQL from MAPS_SETUP.md
   - Add keys to .env

3. **Deploy to Production**
   - Push to GitHub
   - Deploy backend to Railway
   - Deploy frontend to Vercel

4. **Setup Monitoring** (Production)
   - Add error tracking (Sentry)
   - Setup performance monitoring
   - Configure alerts

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create feature branch
3. Submit pull request

## 📄 License

Private project - All rights reserved.

## 🆘 Support

**Need help?**
1. Check [QUICK_START.md](QUICK_START.md) for basic setup
2. Review [ARCHITECTURE.md](ARCHITECTURE.md) to understand the system
3. Check [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for production issues
4. Review error messages in browser console (F12)

## 🌟 Getting Started Checklist

```
☐ Clone repository
☐ Run npm install
☐ Get Google Maps API key
☐ Get Gemini API key
☐ Create .env file with keys
☐ Run npm run dev:full
☐ Open http://localhost:5173
☐ Test all features
☐ Read documentation
☐ Deploy to production (when ready)
```

## 📞 Contact

For production deployment support, reach out to your backend team.

---

**Happy farming with AI! 🌾🤖**

Last updated: May 25, 2024
Version: 1.0.0
=======
# AGTECHATHON-2.0-2k26
 Hackathon project - AGTECHATHON 2.0 by A.G. Patil Institute of Technology, Solapur.
>>>>>>> 0504385ca69185ba0caf80db6ce43dae15c15063
