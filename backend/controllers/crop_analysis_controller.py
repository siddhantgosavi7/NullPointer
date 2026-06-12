import os
from pathlib import Path
from fastapi import HTTPException, UploadFile
from backend.services.crop_analysis_service import analyze_crop_service

async def analyze_crop_controller(image: UploadFile, crop_type: str, growth_stage: str):
    allowed_extensions = {'.jpg', '.jpeg', '.png', '.webp', '.jfif'}
    file_ext = Path(image.filename or '').suffix.lower()
    if not (image.content_type.startswith('image/') or file_ext in allowed_extensions):
        raise HTTPException(status_code=400, detail='Uploaded file is not a supported image type')

    max_size_mb = float(os.getenv("MAX_IMAGE_SIZE_MB", "8"))
    max_size_bytes = int(max_size_mb * 1024 * 1024)

    content_length = image.headers.get("content-length")
    if content_length and int(content_length) > max_size_bytes:
        raise HTTPException(status_code=400, detail=f"Image size exceeds the maximum limit of {max_size_mb} MB")

    try:
        chunk_size = 1024 * 1024
        data = bytearray()
        while True:
            chunk = await image.read(chunk_size)
            if not chunk:
                break
            data.extend(chunk)
            if len(data) > max_size_bytes:
                raise HTTPException(status_code=400, detail=f"Image size exceeds the maximum limit of {max_size_mb} MB")

        return analyze_crop_service(bytes(data), crop_type, growth_stage)
    except HTTPException as exc:
        raise exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f'Crop analysis failed: {exc}')
