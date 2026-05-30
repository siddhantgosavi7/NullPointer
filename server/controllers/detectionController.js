import { history, persistStore } from '../data/store.js';
import { analyzeCropImage, fallbackDiagnosis } from '../services/gemini.js';

export async function detectDisease(req, res) {
  if (!req.file) {
    res.status(400).json({ error: { message: 'Image file is required.' } });
    return;
  }

  let diagnosis;
  let source = 'gemini';
  try {
    diagnosis = await analyzeCropImage(req.file.path, req.file.mimetype);
  } catch (error) {
    res.status(502).json({
      error: {
        message: 'AI could not analyze this leaf image. Please try a clearer close-up or check the Gemini model/API key.',
        detail: error.message,
      },
    });
    return;
  }

  const record = {
    id: crypto.randomUUID(),
    ...normalizeDiagnosis(diagnosis),
    date: new Date().toISOString(),
    imageUrl: `/uploads/${req.file.filename}`,
    source,
  };
  history.unshift(record);
  persistStore();
  res.json(record);
}

export function saveDiagnosis(req, res) {
  const record = { id: crypto.randomUUID(), ...req.body, date: new Date().toISOString() };
  history.unshift(record);
  persistStore();
  res.status(201).json(record);
}

function normalizeDiagnosis(diagnosis) {
  const fallback = fallbackDiagnosis();
  const severity = ['Low', 'Medium', 'High'].includes(diagnosis?.severity) ? diagnosis.severity : fallback.severity;
  const confidence = Number.isFinite(Number(diagnosis?.confidence)) ? Math.max(0, Math.min(100, Number(diagnosis.confidence))) : fallback.confidence;

  return {
    ...fallback,
    ...diagnosis,
    crop: diagnosis?.crop || fallback.crop,
    disease: diagnosis?.disease || fallback.disease,
    confidence,
    severity,
    symptoms: asArray(diagnosis?.symptoms, fallback.symptoms),
    treatment: asArray(diagnosis?.treatment, fallback.treatment),
    organicRemedies: asArray(diagnosis?.organicRemedies, fallback.organicRemedies),
    dosage: asArray(diagnosis?.dosage, fallback.dosage),
    safety: asArray(diagnosis?.safety, fallback.safety),
    prevention: asArray(diagnosis?.prevention, fallback.prevention),
    boundingBox: normalizeBox(diagnosis?.boundingBox || fallback.boundingBox),
  };
}

function asArray(value, fallback) {
  if (Array.isArray(value)) return value.filter(Boolean).map(String);
  if (typeof value === 'string' && value.trim()) return [value.trim()];
  return fallback;
}

function normalizeBox(box) {
  return {
    x: clamp(box?.x, 0, 90, 38),
    y: clamp(box?.y, 0, 90, 28),
    width: clamp(box?.width, 8, 100, 32),
    height: clamp(box?.height, 8, 100, 28),
  };
}

function clamp(value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(min, Math.min(max, number));
}
