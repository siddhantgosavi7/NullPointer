import requests
import json
import os

BASE_URL = "http://127.0.0.1:8000"

print("--- Testing Health ---")
r = requests.get(f"{BASE_URL}/health")
print("Status Code:", r.status_code)
print("Response:", r.json())

print("\n--- Testing Yield Prediction ---")
payload = {
    "crop_type": "Wheat",
    "area": 10.5,
    "soil_parameters": {"moisture": 30.0, "ph": 6.5},
    "weather_data": {"rainfall": 55.0},
    "historical_data": [{"year": 2025, "yield": 22.0}]
}
r = requests.post(f"{BASE_URL}/api/yield/predict", json=payload)
print("Status Code:", r.status_code)
print("Response:", r.json())

img_path = os.path.abspath("frontend/src/assets/hero.png")
if os.path.exists(img_path):
    print("\n--- Testing Crop Analysis ---")
    with open(img_path, "rb") as f:
        files = {"image": (os.path.basename(img_path), f, "image/jpeg")}
        data = {"crop_type": "Wheat", "growth_stage": "Tillering"}
        r = requests.post(f"{BASE_URL}/api/crop/analyze", files=files, data=data)
    print("Status Code:", r.status_code)
    print("Response:", r.json())

    print("\n--- Testing Disease Detection (TensorFlow) ---")
    with open(img_path, "rb") as f:
        files = {"image": (os.path.basename(img_path), f, "image/jpeg")}
        r = requests.post(f"{BASE_URL}/api/disease/predict", files=files)
    print("Status Code:", r.status_code)
    print("Response:", r.json())
else:
    print(f"\nTest image not found at {img_path}")
