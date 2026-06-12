"""Direct TensorFlow model loader for wheat leaf disease detection."""
import json
from io import BytesIO
from pathlib import Path
from PIL import Image
import numpy as np

# Resolve project root
ROOT = Path(__file__).resolve().parents[3]
AI_MODEL_DIR = ROOT / 'ai' / 'models'

MODEL_PATH = AI_MODEL_DIR / 'wheat_model.h5'
CLASSES_PATH = AI_MODEL_DIR / 'classes.json'

_model = None
_classes = None

def get_model():
    global _model
    if _model is None:
        import tensorflow as tf
        if not MODEL_PATH.exists():
            raise FileNotFoundError(f"Model file not found at {MODEL_PATH}")
        # Load the compiled model. Keras models compile metrics, but we only need it for inference.
        _model = tf.keras.models.load_model(str(MODEL_PATH), compile=False)
    return _model

def get_classes():
    global _classes
    if _classes is None:
        if not CLASSES_PATH.exists():
            # Fallback classes if classes.json is missing
            return ['healthy', 'leaf_blight', 'mildew', 'rust', 'septoria']
        with open(CLASSES_PATH, 'r') as f:
            mapping = json.load(f)
        # Sort by index value
        _classes = [k for k, v in sorted(mapping.items(), key=lambda item: item[1])]
    return _classes

def predict_from_bytes(data: bytes) -> dict:
    # 1. Load image
    try:
        img = Image.open(BytesIO(data)).convert('RGB')
    except Exception as e:
        raise ValueError(f"Invalid image format: {e}")

    # 2. Resize to 224x224 (expected input shape of model)
    img = img.resize((224, 224))
    
    # 3. Preprocess image
    img_array = np.array(img, dtype=np.float32)
    # Typical Keras rescale to 1/255.
    img_array = img_array / 255.0
    img_array = np.expand_dims(img_array, axis=0)  # Shape (1, 224, 224, 3)

    # 4. Predict
    model = get_model()
    predictions = model.predict(img_array)
    scores = predictions[0]

    # 5. Build response
    classes = get_classes()
    predicted_idx = int(np.argmax(scores))
    predicted_class = classes[predicted_idx]
    max_conf = float(scores[predicted_idx])
    
    # Simple uncertainty threshold (e.g., if max confidence is below 45%)
    uncertain = max_conf < 0.45

    scores_list = []
    for cls, conf in zip(classes, scores):
        scores_list.append({
            "class": cls,
            "percent": round(float(conf) * 100, 2)
        })

    # Sort scores by percent descending
    scores_list = sorted(scores_list, key=lambda x: x['percent'], reverse=True)

    return {
        "uncertain": uncertain,
        "disease": predicted_class,
        "confidence": round(max_conf, 4),
        "confidence_percent": round(max_conf * 100, 2),
        "status": "Healthy Leaf" if predicted_class == "healthy" else "Diseased Leaf",
        "is_healthy": predicted_class == "healthy",
        "scores": scores_list
    }

