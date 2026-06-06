from fastapi import HTTPException
from fastapi import UploadFile
from pathlib import Path
from backend.services.disease_service import predict_disease_service

async def predict_disease_controller(image: UploadFile):
    allowed_extensions = {'.jpg', '.jpeg', '.png', '.webp', '.jfif'}
    file_ext = Path(image.filename or '').suffix.lower()
    if not (image.content_type.startswith('image/') or file_ext in allowed_extensions):
        raise HTTPException(status_code=400, detail='Uploaded file is not a supported image type')
    try:
        data = await image.read()
        result = predict_disease_service(data)
        return result
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f'Prediction failed: {exc}')
