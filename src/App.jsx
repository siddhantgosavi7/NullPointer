import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import DashboardLayout from './layouts/DashboardLayout';

import Dashboard from './pages/Dashboard';
import AIAssistant from './pages/AIAssistant';
import DiseaseDetection from './pages/DiseaseDetection';
import CropRecommendation from './pages/CropRecommendation';
import CropAnalysis from './pages/CropAnalysis';
import YieldPrediction from './pages/YieldPrediction';
import WeatherIntelligence from './pages/WeatherIntelligence';
import IrrigationAdvisor from './pages/IrrigationAdvisor';
import MarketIntelligence from './pages/MarketIntelligence';
import GovernmentSchemes from './pages/GovernmentSchemes';
import FarmerProfile from './pages/FarmerProfile';
import AlertsCenter from './pages/AlertsCenter';
import Analytics from './pages/Analytics';

// Protected Route Component
const PrivateRoute = ({ children }) => {
  const { currentUser } = useAuth();
  // Allow a local development bypass so pages render without an auth session
  const devBypass = import.meta.env.DEV || window.location.hostname === 'localhost';

  useEffect(() => {
    if (!devBypass && currentUser === null) {
      window.location.href = '/login.html';
    }
  }, [currentUser, devBypass]);

  if (!devBypass && currentUser === null) return null; // Avoid rendering until redirected

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router basename="/app">
        <Routes>
          {/* Protected Routes with Background Canvas */}
          <Route element={
            <PrivateRoute>
              <DashboardLayout />
            </PrivateRoute>
          }>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/assistant" element={<AIAssistant />} />
            <Route path="/disease" element={<DiseaseDetection />} />
            <Route path="/crop" element={<CropRecommendation />} />
            <Route path="/crop-analysis" element={<CropAnalysis />} />
            <Route path="/yield" element={<YieldPrediction />} />
            <Route path="/weather" element={<WeatherIntelligence />} />
            <Route path="/irrigation" element={<IrrigationAdvisor />} />
            <Route path="/market" element={<MarketIntelligence />} />
            <Route path="/schemes" element={<GovernmentSchemes />} />
            <Route path="/profile" element={<FarmerProfile />} />
            <Route path="/alerts" element={<AlertsCenter />} />
            <Route path="/analytics" element={<Analytics />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
