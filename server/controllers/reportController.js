import { persistStore, reports } from '../data/store.js';

export function createReport(req, res) {
  const report = {
    id: crypto.randomUUID(),
    farmer: req.body.farmer || 'Demo Farmer',
    crop: req.body.crop || 'Tomato',
    disease: req.body.disease || 'Early Blight',
    severity: req.body.severity || 'Medium',
    confidence: req.body.confidence || 86,
    treatment: req.body.treatment || ['Follow recommended pesticide dosage and consult a local expert.'],
    weather: req.body.weather || '29 C, humid, rain likely',
    createdAt: new Date().toISOString(),
  };
  reports.unshift(report);
  persistStore();
  res.status(201).json(report);
}

export function getReports(_req, res) {
  res.json(reports);
}
