from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from backend.routes import disease, crop_analysis, yield_prediction

app = FastAPI(title="KrishiMitra Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(disease.router, prefix="/api/disease")
app.include_router(crop_analysis.router, prefix="/api/crop")
app.include_router(yield_prediction.router, prefix="/api/yield")

@app.get("/health")
async def health():
    return {"status": "ok"}
