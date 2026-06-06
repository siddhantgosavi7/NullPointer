const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const predictYield = async (payload) => {
  try {
    const response = await fetch(`${API_BASE}/api/yield/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const details = await response.json().catch(() => null);
      throw new Error(details?.detail || response.statusText);
    }

    return await response.json();
  } catch (error) {
    console.error('Yield prediction error:', error);
    throw error;
  }
};

export const formatYieldPrediction = (prediction) => ({
  predictedYield: prediction.predicted_yield ?? 0,
  confidence: prediction.confidence_percent ?? 0,
  forecast: prediction.forecast || 'No forecast available.',
  suggestions: prediction.suggestions || [],
  note: prediction.note || null,
});
