/**
 * Disease Detection Service
 * Integrates with the GUI_WDD wheat leaf disease detection model
 */

// Disease information and treatment recommendations
const diseaseInfo = {
  healthy: {
    crop: "Wheat",
    severity: "None",
    treatment: [
      "Maintain current farming practices.",
      "Continue regular monitoring for early disease signs.",
      "Practice preventative crop management for long-term health."
    ],
    prevention: "Keep maintaining crop rotation, proper irrigation, and pest management for sustained health."
  },
  leaf_blight: {
    crop: "Wheat",
    severity: "High",
    treatment: [
      "Apply fungicides containing Mancozeb or Propiconazole immediately.",
      "Ensure fields have good drainage to reduce humidity and leaf wetness.",
      "Remove and destroy infected plant parts to prevent spread.",
      "For next season, practice crop rotation and plow under infected residue."
    ],
    prevention: "Plant resistant wheat varieties, avoid overhead irrigation, and maintain proper plant spacing for air circulation."
  },
  mildew: {
    crop: "Wheat",
    severity: "Medium",
    treatment: [
      "Apply sulfur-based fungicides or triazoles like Triadimefon.",
      "Improve air circulation by reducing plant density if necessary.",
      "Avoid excessive nitrogen fertilization which promotes mildew.",
      "Apply treatment early in the morning or late evening."
    ],
    prevention: "Use resistant varieties, maintain optimal plant spacing, avoid high humidity, and monitor regularly during cool weather."
  },
  rust: {
    crop: "Wheat",
    severity: "High",
    treatment: [
      "Apply rust-specific fungicides containing propiconazole or tebuconazole.",
      "Monitor fields daily, especially during warm and humid conditions.",
      "Remove volunteer wheat plants that can harbor rust spores.",
      "Implement strict crop rotation practices."
    ],
    prevention: "Plant resistant wheat varieties, maintain good field sanitation, remove alternative hosts, and scout fields regularly during growing season."
  },
  septoria: {
    crop: "Wheat",
    severity: "Medium-High",
    treatment: [
      "Apply fungicides containing azoxystrobin or propiconazole.",
      "Ensure proper field drainage and avoid water stress.",
      "Remove infected leaves and debris from the field.",
      "Rotate crops to break the disease cycle."
    ],
    prevention: "Use resistant varieties, practice crop rotation, plow under infected residue, and maintain proper plant spacing for air movement."
  }
};

/**
 * Get treatment and prevention info for a disease
 * @param {string} disease - Disease name
 * @returns {object} Disease info with treatment and prevention
 */
export const getDiseaseInfo = (disease) => {
  const normalizedDisease = disease.toLowerCase().replace(/\s+/g, '_');
  return diseaseInfo[normalizedDisease] || diseaseInfo.healthy;
};

/**
 * Send image to disease detection model
 * @param {File} imageFile - Image file to analyze
 * @returns {Promise<object>} Prediction result
 */
export const predictDisease = async (imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);

  try {
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const response = await fetch(`${API_BASE}/api/disease/predict`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Disease detection error:', error);
    throw error;
  }
};

/**
 * Format prediction result for UI display
 * @param {object} prediction - Raw prediction from backend
 * @returns {object} Formatted result
 */
export const formatPredictionResult = (prediction) => {
  const diseaseName = prediction.disease || 'Unknown';
  const info = getDiseaseInfo(diseaseName);

  return {
    disease: diseaseName,
    crop: info.crop,
    confidence: prediction.confidence_percent,
    severity: prediction.severity || info.severity,
    status: prediction.status || (prediction.is_healthy ? 'Healthy Leaf' : 'Diseased Leaf'),
    is_healthy: prediction.is_healthy,
    treatment: prediction.treatment || info.treatment,
    prevention: prediction.prevention || info.prevention,
    scores: prediction.scores || [],
    infected_area: prediction.infected_area_percent || null,
    recommendations: prediction.recommendations || (prediction.treatment || info.treatment),
    uncertain: prediction.uncertain || false,
    message: prediction.message || null
  };
};
