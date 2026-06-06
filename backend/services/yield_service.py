from backend.ai.yieldPrediction.model_wrapper import predict_yield


def predict_yield_service(payload: dict) -> dict:
    raw = predict_yield(payload)

    return {
        "crop_type": payload.get("crop_type"),
        "area": payload.get("area"),
        "predicted_yield": raw.get("predicted_yield"),
        "confidence_percent": raw.get("confidence_percent"),
        "forecast": raw.get("forecast"),
        "suggestions": raw.get("suggestions", []),
        "note": raw.get("note")
    }
