from pathlib import Path
from fastapi import HTTPException, UploadFile
from backend.services.crop_analysis_service import analyze_crop_service

async def analyze_crop_controller(image: UploadFile, crop_type: str, growth_stage: str):
    allowed_extensions = {'.jpg', '.jpeg', '.png', '.webp', '.jfif'}
    file_ext = Path(image.filename or '').suffix.lower()
    if not (image.content_type.startswith('image/') or file_ext in allowed_extensions):
        raise HTTPException(status_code=400, detail='Uploaded file is not a supported image type')

    data = await image.read()
    return analyze_crop_service(data, crop_type, growth_stage)
