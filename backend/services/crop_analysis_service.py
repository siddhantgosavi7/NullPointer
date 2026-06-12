from ai.cropAnalysis.model_wrapper import predict_crop_analysis


def analyze_crop_service(image_bytes: bytes, crop_type: str, growth_stage: str) -> dict:
    raw = predict_crop_analysis(image_bytes, crop_type, growth_stage)

    return {
        "crop_type": crop_type,
        "growth_stage": growth_stage,
        "health_score": raw.get("health_score", 0),
        "nutrient_deficiencies": raw.get("nutrient_deficiencies", []),
        "growth_assessment": raw.get("growth_assessment", "No assessment available."),
        "pest_risk": raw.get("pest_risk", "Unknown"),
        "recommendations": raw.get("recommendations", []),
        "confidence_percent": raw.get("confidence_percent", 0),
        "note": raw.get("note", None)
    }
