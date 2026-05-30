import fs from 'node:fs';
import path from 'node:path';

const storePath = path.resolve('server/data/krishi-store.json');

const seed = {
  history: [
    {
      id: 'scan-1001',
      crop: 'Tomato',
      disease: 'Early Blight',
      severity: 'Medium',
      confidence: 92,
      date: '2026-05-18',
      location: 'Pune, Maharashtra',
      imageUrl: 'https://images.unsplash.com/photo-1598512752271-33f913a5af13?auto=format&fit=crop&w=700&q=80',
    },
    {
      id: 'scan-1002',
      crop: 'Wheat',
      disease: 'Leaf Rust',
      severity: 'High',
      confidence: 88,
      date: '2026-05-12',
      location: 'Satara, Maharashtra',
      imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=700&q=80',
    },
  ],
  reports: [],
  experts: [
    { id: 'expert-1', name: 'Dr. Meera Patil', type: 'Agriculture Expert', distance: '2.4 km', rating: 4.9, phone: '+91 98765 44120' },
    { id: 'expert-2', name: 'GreenGrow Fertilizers', type: 'Fertilizer Shop', distance: '4.1 km', rating: 4.6, phone: '+91 98765 20314' },
    { id: 'expert-3', name: 'District Soil Lab', type: 'Soil Testing Center', distance: '6.8 km', rating: 4.7, phone: '+91 98765 77881' },
  ],
  schemes: [
    { id: 'scheme-1', title: 'PM-KISAN', benefit: 'Income support for eligible farmer families', status: 'Open', url: 'https://pmkisan.gov.in/' },
    { id: 'scheme-2', title: 'Soil Health Card', benefit: 'Nutrient recommendations and soil testing', status: 'Open', url: 'https://soilhealth.dac.gov.in/' },
    { id: 'scheme-3', title: 'PM Fasal Bima Yojana', benefit: 'Crop insurance against weather and pest losses', status: 'Apply soon', url: 'https://pmfby.gov.in/' },
  ],
};

function loadStore() {
  try {
    const raw = fs.readFileSync(storePath, 'utf8');
    const parsed = JSON.parse(raw);
    return {
      history: Array.isArray(parsed.history) ? parsed.history : seed.history,
      reports: Array.isArray(parsed.reports) ? parsed.reports : seed.reports,
      experts: Array.isArray(parsed.experts) ? parsed.experts : seed.experts,
      schemes: Array.isArray(parsed.schemes) ? parsed.schemes : seed.schemes,
    };
  } catch {
    return seed;
  }
}

const store = loadStore();

export const history = store.history;
export const reports = store.reports;
export const experts = store.experts;
export const schemes = store.schemes;

export function persistStore() {
  fs.mkdirSync(path.dirname(storePath), { recursive: true });
  fs.writeFileSync(storePath, JSON.stringify({ history, reports, experts, schemes }, null, 2));
}
