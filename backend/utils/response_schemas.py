from pydantic import BaseModel
from typing import List, Optional

class ScoreItem(BaseModel):
    class_name: str
    percent: float

class DiseaseResponse(BaseModel):
    disease: Optional[str]
    confidence_percent: Optional[float]
    uncertain: Optional[bool]
    message: Optional[str]
    scores: Optional[List[dict]]
    infected_area_percent: Optional[float]
    recommendations: Optional[List[str]]
