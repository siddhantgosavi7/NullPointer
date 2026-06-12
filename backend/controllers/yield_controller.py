from fastapi import HTTPException
from services.yield_service import predict_yield_service

async def predict_yield_controller(payload: dict):
    required = ["crop_type", "area", "soil_parameters", "weather_data", "historical_data"]
    missing = [field for field in required if field not in payload]
    if missing:
        raise HTTPException(status_code=400, detail=f"Missing fields: {', '.join(missing)}")
    return predict_yield_service(payload)
