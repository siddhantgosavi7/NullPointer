from io import BytesIO
from PIL import Image
import numpy as np


def estimate_infected_area(image_bytes: bytes) -> float:
    """Estimate infected area percentage using a simple non-green pixel heuristic."""
    with BytesIO(image_bytes) as buf:
        img = Image.open(buf).convert('RGB')
        arr = np.array(img)

    # Convert to HSV-like via simple channel heuristics: detect green pixels
    r, g, b = arr[:,:,0].astype(int), arr[:,:,1].astype(int), arr[:,:,2].astype(int)
    # A simple green mask: green channel significantly higher than red and blue
    green_mask = (g > r + 15) & (g > b + 15)
    total = arr.shape[0] * arr.shape[1]
    green_pixels = green_mask.sum()
    non_green = total - green_pixels
    infected_pct = round((non_green / total) * 100, 2)
    return infected_pct
