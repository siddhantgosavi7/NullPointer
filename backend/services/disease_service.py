from ai.diseaseDetection.model_wrapper import predict_from_bytes
from utils.image_utils import estimate_infected_area


def predict_disease_service(image_bytes: bytes) -> dict:
    # Call the underlying model wrapper
    raw = predict_from_bytes(image_bytes)

    # Estimate infected area percentage (simple heuristic)
    try:
        infected_pct = estimate_infected_area(image_bytes)
    except Exception:
        infected_pct = None

    # Enrich raw response with infected area and human-friendly fields
    response = {
        **raw,
        "infected_area_percent": infected_pct,
        "recommendations": raw.get("treatment", []),
    }
    return response
