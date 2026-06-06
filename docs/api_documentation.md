# API Documentation

## POST /api/disease/predict
- Accepts: multipart form with `image` file.
- Returns: JSON with fields `disease`, `confidence_percent`, `scores`, `infected_area_percent`, `recommendations`, `uncertain`.

Example response:
{
  "disease": "leaf_blight",
  "confidence_percent": 92.34,
  "scores": [{"class":"leaf_blight","percent":92.34}, ...],
  "infected_area_percent": 34.5,
  "recommendations": ["Apply fungicide ..."],
  "uncertain": false
}
