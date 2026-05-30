import axios from 'axios';

const fallbackHistory = [
  {
    id: 'scan-1001',
    crop: 'Tomato',
    disease: 'Early Blight',
    severity: 'Medium',
    confidence: 92,
    date: '2026-05-18',
    imageUrl: 'https://images.unsplash.com/photo-1598512752271-33f913a5af13?auto=format&fit=crop&w=700&q=80',
  },
  {
    id: 'scan-1002',
    crop: 'Wheat',
    disease: 'Leaf Rust',
    severity: 'High',
    confidence: 88,
    date: '2026-05-12',
    imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=700&q=80',
  },
];

const fallbackExperts = [
  { name: 'Dr. Meera Patil', type: 'Agriculture Expert', distance: '2.4 km', rating: 4.9, phone: '+91 98765 44120' },
  { name: 'GreenGrow Fertilizers', type: 'Fertilizer Shop', distance: '4.1 km', rating: 4.6, phone: '+91 98765 20314' },
  { name: 'District Soil Lab', type: 'Soil Testing Center', distance: '6.8 km', rating: 4.7, phone: '+91 98765 77881' },
];

const fallbackSchemes = [
  { title: 'PM-KISAN', benefit: 'Income support for eligible farmer families', status: 'Open' },
  { title: 'Soil Health Card', benefit: 'Nutrient recommendations and soil testing', status: 'Open' },
  { title: 'PM Fasal Bima Yojana', benefit: 'Crop insurance against weather and pest losses', status: 'Apply soon' },
];

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  timeout: 45000,
});

const wait = (ms = 700) => new Promise((resolve) => window.setTimeout(resolve, ms));

export async function detectDisease(file) {
  try {
    const formData = new FormData();
    formData.append('image', file);
    const { data } = await client.post('/detect-disease', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  } catch (error) {
    const message = error.response?.data?.error?.message || error.message || 'Disease detection failed.';
    throw new Error(message);
  }
}

export async function getWeatherRisk(location = '') {
  try {
    const { data } = await client.get('/weather-risk', { params: location ? { location } : {} });
    return data;
  } catch {
    await wait();
    return {
      location: location || 'Pune, Maharashtra',
      temp: 29,
      humidity: 82,
      rain: 68,
      wind: 11,
      riskScore: 76,
      risks: [
        { disease: 'Fungal Blight', level: 'High', action: 'Spray preventive fungicide before evening humidity rises.' },
        { disease: 'Powdery Mildew', level: 'Medium', action: 'Improve airflow and inspect shaded rows.' },
        { disease: 'Bacterial Spot', level: 'Low', action: 'Avoid splash irrigation for 48 hours.' },
      ],
    };
  }
}

export async function sendChatMessage(message, language = 'en') {
  try {
    const { data } = await client.post('/chatbot', { message, language });
    return data;
  } catch {
    await wait(900);
    return {
      role: 'assistant',
      text: `Based on your question, start by checking recent watering, humidity, and visible leaf spots. For "${message}", I recommend uploading a clear leaf photo so the AI can confirm the likely disease.`,
      source: 'fallback',
    };
  }
}

export async function getHistory() {
  try {
    const { data } = await client.get('/history');
    return data;
  } catch {
    await wait(500);
    return fallbackHistory;
  }
}

export async function getSchemesAndExperts() {
  try {
    const { data } = await client.get('/government-schemes');
    return data;
  } catch {
    await wait(500);
    return { experts: fallbackExperts, schemes: fallbackSchemes };
  }
}

export async function createReport(payload) {
  try {
    const { data } = await client.post('/reports', payload);
    return data;
  } catch {
    await wait(400);
    return { id: crypto.randomUUID(), ...payload, createdAt: new Date().toISOString() };
  }
}

export async function saveDiagnosis(payload) {
  try {
    const { data } = await client.post('/diagnoses', payload);
    return data;
  } catch {
    await wait(300);
    return { id: crypto.randomUUID(), ...payload, date: new Date().toISOString() };
  }
}

export function apiAssetUrl(path) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${(import.meta.env.VITE_API_URL || 'http://localhost:4000/api').replace('/api', '')}${path}`;
}

export { client };
