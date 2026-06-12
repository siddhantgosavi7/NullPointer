const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const analyzeCrop = async (formData) => {
  try {
    const response = await fetch(`${API_BASE}/api/crop/analyze`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const details = await response.json().catch(() => null);
      throw new Error(details?.detail || response.statusText);
    }

    return await response.json();
  } catch (error) {
    console.error('Crop analysis error:', error);
    throw error;
  }
};

export const formatCropAnalysisResult = (prediction) => ({
  cropType: prediction.crop_type || 'Unknown',
  growthStage: prediction.growth_stage || 'Unknown',
  healthScore: prediction.health_score ?? 0,
  nutrientDeficiencies: prediction.nutrient_deficiencies || [],
  growthAssessment: prediction.growth_assessment || 'No assessment available.',
  pestRisk: prediction.pest_risk || 'Unknown',
  recommendations: prediction.recommendations || [],
  confidence: prediction.confidence_percent ?? 0,
  note: prediction.note || null,
});
