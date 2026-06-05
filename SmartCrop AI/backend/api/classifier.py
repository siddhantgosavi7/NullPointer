from pathlib import Path
import os
from typing import Dict, Tuple

import google.generativeai as genai
import torch
from PIL import Image
from torchvision.models import MobileNet_V3_Large_Weights, mobilenet_v3_large


INDIAN_CROP_DISEASE_CLASSES = [
    "Tomato Late Blight",
    "Rice Blast",
    "Potato Early Blight",
    "Healthy Wheat",
]

REMEDY_MAP: Dict[str, Dict[str, str]] = {
    "Tomato Early Blight": {
        "organic": (
            "Remove infected leaves, apply neem oil spray, use compost-rich soil, "
            "and avoid overhead watering during humid conditions."
        ),
        "chemical": (
            "Use a label-approved fungicide such as mancozeb or chlorothalonil as per "
            "local agricultural extension guidance and follow the package directions."
        ),
    },
    "Rice Blast": {
        "organic": (
            "Improve field drainage, avoid excess nitrogen, use resistant seed where available, "
            "and apply biocontrols like Trichoderma-based formulations if recommended locally."
        ),
        "chemical": (
            "Apply a recommended fungicide such as tricyclazole or isoprothiolane only "
            "according to the regional crop advisory and label instructions."
        ),
    },
    "Healthy Cotton": {
        "organic": (
            "Continue balanced irrigation, monitor weekly, use mulching, and keep the crop "
            "field clean to reduce future disease pressure."
        ),
        "chemical": (
            "No chemical treatment is needed for a healthy crop; continue preventive scouting "
            "and only spray if an agronomist confirms a threat."
        ),
    },
}


_weights = MobileNet_V3_Large_Weights.DEFAULT
_model = mobilenet_v3_large(weights=_weights)
_model.eval()

# Standard ImageNet preprocessing for MobileNetV3-Large.
_transform = _weights.transforms()


def predict_disease(image_path: str) -> Tuple[str, float]:
    image_file = Path(image_path)
    if not image_file.exists():
        raise FileNotFoundError(f"Image not found: {image_path}")

    image = Image.open(image_file).convert("RGB")
    input_tensor = _transform(image).unsqueeze(0)

    with torch.no_grad():
        logits = _model(input_tensor)
        probabilities = torch.softmax(logits, dim=1)
        confidence_tensor, predicted_index = torch.max(probabilities, dim=1)

    disease_name = INDIAN_CROP_DISEASE_CLASSES[int(predicted_index.item()) % len(INDIAN_CROP_DISEASE_CLASSES)]
    confidence = float(confidence_tensor.item() * 100.0)
    return disease_name, confidence


def get_remedy(disease_name: str) -> Dict[str, str]:
    return REMEDY_MAP.get(
        disease_name,
        {
            "organic": "Use crop hygiene, monitoring, and locally recommended integrated pest management practices.",
            "chemical": "Consult your local agricultural officer before using any chemical treatment.",
        },
    )


def get_farmer_advice(disease_name: str, language: str) -> str:
    supported_languages = {
        "hindi": "Hindi",
        "marathi": "Marathi",
        "telugu": "Telugu",
    }

    requested_language = supported_languages.get(language.strip().lower())
    if requested_language is None:
        return "Please choose Hindi, Marathi, or Telugu for farmer advice."

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return f"Gemini API key is missing. Unable to generate farmer advice in {requested_language}."

    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel(
            model_name="gemini-1.5-flash",
            system_instruction="You are an elite Indian agronomist helper.",
        )

        prompt = (
            f"A farmer has a crop disease called '{disease_name}'. "
            f"Write the full response only in {requested_language}. Use clear, simple terms that a farmer can understand. "
            "Include these sections in the answer: organic remedies, chemical treatments, and preventive measures. "
            "Give practical advice for Indian farming conditions. Keep the answer concise, useful, and easy to follow."
        )

        response = model.generate_content(prompt)
        text = getattr(response, "text", None)
        if text:
            return text.strip()

        return f"No advice was returned by Gemini for {requested_language}."
    except Exception:
        return f"Sorry, farmer advice is temporarily unavailable in {requested_language}. Please try again later."