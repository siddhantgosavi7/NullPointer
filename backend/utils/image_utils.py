from io import BytesIO
from PIL import Image
import numpy as np


def estimate_infected_area(image_bytes: bytes) -> float:
    """Estimate infected area percentage using a simple channel heuristic, excluding dark backgrounds."""
    with BytesIO(image_bytes) as buf:
        img = Image.open(buf).convert('RGB')
        arr = np.array(img)

    # Convert channels to integers to prevent overflow during arithmetic
    r, g, b = arr[:,:,0].astype(int), arr[:,:,1].astype(int), arr[:,:,2].astype(int)
    
    # Identify leaf pixels by filtering out dark background/shadows (intensity > 30)
    leaf_mask = (r > 30) | (g > 30) | (b > 30)
    leaf_pixels = leaf_mask.sum()
    
    if leaf_pixels == 0:
        return 0.0

    # A simple green mask: green channel significantly higher than red and blue
    green_mask = (g > r + 12) & (g > b + 12) & leaf_mask
    green_pixels = green_mask.sum()
    
    # Discolored (infected) area is the non-green part of the leaf
    infected_pixels = leaf_pixels - green_pixels
    infected_pct = round((infected_pixels / leaf_pixels) * 100, 2)
    return infected_pct
