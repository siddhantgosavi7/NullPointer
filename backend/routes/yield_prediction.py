from fastapi import APIRouter, HTTPException
from backend.controllers.yield_controller import predict_yield_controller

router = APIRouter()

@router.post('/predict')
async def predict_yield(payload: dict):
    try:
        result = await predict_yield_controller(payload)
        return result
    except HTTPException as exc:
        raise exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
