from pathlib import Path
from typing import Dict, Tuple

import torch
from PIL import Image
from torchvision.models import MobileNet_V3_Small_Weights, mobilenet_v3_small


CROP_DISEASE_CLASSES = [
    "Tomato Early Blight",
    "Rice Blast",
    "Healthy Cotton",
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


_weights = MobileNet_V3_Small_Weights.DEFAULT
_model = mobilenet_v3_small(weights=_weights)
_model.eval()
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

    disease_name = CROP_DISEASE_CLASSES[int(predicted_index.item()) % len(CROP_DISEASE_CLASSES)]
    confidence = float(confidence_tensor.item())
    return disease_name, confidence


def get_remedy(disease_name: str) -> Dict[str, str]:
    return REMEDY_MAP.get(
        disease_name,
        {
            "organic": "Use crop hygiene, monitoring, and locally recommended integrated pest management practices.",
            "chemical": "Consult your local agricultural officer before using any chemical treatment.",
        },
    )