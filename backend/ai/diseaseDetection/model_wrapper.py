"""Wrapper to load and call the existing GUI_WDD model if present, or fall back to AI_Model."""
import sys
from pathlib import Path

# Ensure GUI_WDD is importable
ROOT = Path(__file__).resolve().parents[3]
GUI_WDD = ROOT / 'GUI_WDD'
if str(GUI_WDD) not in sys.path:
    sys.path.insert(0, str(GUI_WDD))

try:
    from predict import predict_from_bytes as gui_predict_from_bytes, get_model, get_classes
except Exception:
    gui_predict_from_bytes = None
    get_model = None
    get_classes = None

# Prefer models placed in project-level AI_Model folder when available
AI_MODEL_DIR = ROOT / 'AI_Model'


def predict_from_bytes(data: bytes) -> dict:
    # If the original GUI_WDD predictor is available, use it
    if gui_predict_from_bytes:
        return gui_predict_from_bytes(data)

    # If unavailable, raise
    raise RuntimeError('No prediction model available. Please ensure GUI_WDD model or AI_Model exists.')
