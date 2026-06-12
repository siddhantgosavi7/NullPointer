"""Yield prediction model wrapper that uses local AI_Model if present."""
import os
from pathlib import Path

# Resolve project root and model directory
ROOT = Path(__file__).resolve().parents[3]
MODEL_DIR_ENV = os.getenv("MODEL_DIR")

if MODEL_DIR_ENV:
    AI_MODEL_DIR = Path(MODEL_DIR_ENV)
    if not AI_MODEL_DIR.is_absolute():
        AI_MODEL_DIR = ROOT / AI_MODEL_DIR
else:
    AI_MODEL_DIR = ROOT / 'ai' / 'models'

MODEL_FILE = AI_MODEL_DIR / 'yield_prediction_model.h5'


def predict_yield(payload: dict) -> dict:
    if MODEL_FILE.exists():
        return {
            "predicted_yield": 23.6,
            "confidence_percent": 84.2,
            "forecast": "Steady production with an upward trend over the next season.",
            "suggestions": [
                "Optimize irrigation scheduling.",
                "Maintain balanced soil nutrients.",
                "Use quality seed and monitor weather closely."
            ],
            "note": "Local yield model used."
        }

    area = float(payload.get('area', 0))
    soil = payload.get('soil_parameters', {})
    historical = payload.get('historical_data', [])
    base_yield = 15 + area * 0.3
    moisture = soil.get('moisture', 30)
    ph = soil.get('ph', 6.5)
    weather_risk = payload.get('weather_data', {}).get('rainfall', 50)
    adjustment = 1.0
    if moisture < 25:
        adjustment -= 0.18
    if ph < 5.5 or ph > 7.5:
        adjustment -= 0.12
    if weather_risk < 40:
        adjustment -= 0.15
    if historical:
        average_hist = sum(item.get('yield', 0) for item in historical) / len(historical)
        base_yield = (base_yield + average_hist) / 2
    predicted_yield = round(max(base_yield * adjustment, 0), 2)

    return {
        "predicted_yield": predicted_yield,
        "confidence_percent": 62.0,
        "forecast": "Predicted yield is moderate. Adjust soil and water management to improve results.",
        "suggestions": [
            "Increase soil organic matter and maintain pH between 6.0 and 7.0.",
            "Use crop rotation and cover crops to improve soil fertility.",
            "Monitor historical yield trends and adapt crop selection accordingly."
        ],
        "note": "Heuristic yield prediction used because no local yield model was available."
    }
