from fastapi import APIRouter, UploadFile, File, HTTPException
from controllers.disease_controller import predict_disease_controller

router = APIRouter()

@router.post('/predict')
async def predict(image: UploadFile = File(...)):
    try:
        result = await predict_disease_controller(image)
        return result
    except HTTPException as exc:
        raise exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
