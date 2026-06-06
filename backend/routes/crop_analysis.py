from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from backend.controllers.crop_analysis_controller import analyze_crop_controller

router = APIRouter()

@router.post('/analyze')
async def analyze_crop(
    image: UploadFile = File(...),
    crop_type: str = Form(...),
    growth_stage: str = Form(...)
):
    try:
        result = await analyze_crop_controller(image, crop_type, growth_stage)
        return result
    except HTTPException as exc:
        raise exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
