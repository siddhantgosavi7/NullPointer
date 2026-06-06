# GUI_WDD Disease Detection Model Integration

This document explains how to set up and run the GUI_WDD wheat leaf disease detection model with the KrishiMitra frontend.

## Architecture

```
┌─────────────────────────┐
│   React Frontend        │
│  (DiseaseDetection.jsx) │
└────────┬────────────────┘
         │ HTTP POST /predict
         ↓
┌─────────────────────────┐
│  Flask Backend Service  │
│  (GUI_WDD/app.py)       │
│  Port: 5000             │
└────────┬────────────────┘
         │
         ↓
┌─────────────────────────┐
│  TensorFlow Model       │
│  (wheat_model.h5)       │
└─────────────────────────┘
```

## Setup Instructions

### 1. Install Python Dependencies

Navigate to the GUI_WDD folder:

```bash
cd GUI_WDD
```

Install required packages:

```bash
pip install -r requirements-web.txt
```

If the file doesn't exist, install manually:

```bash
pip install flask tensorflow pillow numpy
```

### 2. Verify Model Files

Ensure these files exist in the `GUI_WDD/` directory:
- `wheat_model.h5` (TensorFlow model)
- `classes.json` (disease class labels)
- `app.py` (Flask application)

### 3. Run the Flask Server

From the `GUI_WDD/` directory, start the Flask server:

```bash
python app.py
```

Expected output:
```
 * Running on http://127.0.0.1:5000
 * Debug mode: on
Classes: ['healthy', 'leaf_blight', 'mildew', 'rust', 'septoria']
```

The server is now listening at `http://localhost:5000`

### 4. Run the Frontend

In a separate terminal, from the project root:

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## API Endpoints

### POST /predict

**Request:**
- Method: `POST`
- URL: `http://localhost:5000/predict`
- Content-Type: `multipart/form-data`
- Body: Form data with key `image` containing the image file

**Response:**
```json
{
  "uncertain": false,
  "disease": "rust",
  "confidence": 0.95,
  "confidence_percent": 95.0,
  "status": "Diseased Leaf",
  "is_healthy": false,
  "scores": [
    {"class": "healthy", "percent": 2.1},
    {"class": "leaf_blight", "percent": 1.5},
    {"class": "mildew", "percent": 1.4},
    {"class": "rust", "percent": 95.0},
    {"class": "septoria", "percent": 0.0}
  ]
}
```

## Supported Diseases

The model can detect the following wheat leaf diseases:

1. **Healthy** - No disease detected
2. **Leaf Blight** - Fungal infection with brown/black lesions
3. **Mildew** - Powdery white coating on leaves
4. **Rust** - Orange/brown pustules on leaf surface
5. **Septoria** - Small brown spots with dark borders

## Supported Image Formats

- JPEG (.jpg, .jpeg)
- PNG (.png)
- JFIF (.jfif)
- WebP (.webp)

Maximum file size: 8 MB

## Troubleshooting

### "Connection refused" error
- Ensure Flask server is running with `python app.py` in the `GUI_WDD/` directory
- Check that port 5000 is not blocked

### "Module not found" error
- Verify all dependencies are installed: `pip install -r requirements-web.txt`
- Ensure you're in a virtual environment with the correct Python version (3.8+)

### Model loading fails
- Check that `wheat_model.h5` exists in `GUI_WDD/` directory
- Verify file integrity and TensorFlow version compatibility

### Prediction accuracy is low
- Ensure the image shows a clear leaf with good lighting
- Try uploading a different angle or quality of the same leaf

## Performance Notes

- First prediction may take longer while the model loads into memory
- Subsequent predictions are faster (~1-2 seconds per image)
- The model is optimized for wheat leaf images

## File Structure

```
GUI_WDD/
├── app.py                 # Flask web application
├── predict.py             # Prediction logic and model loading
├── classes.json           # Disease class labels
├── wheat_model.h5         # TensorFlow model file
├── requirements-web.txt   # Python dependencies
├── .env                   # Environment configuration
└── templates/
    └── index.html         # Flask template (optional)
```

## Next Steps

1. Start the Flask backend: `python GUI_WDD/app.py`
2. In a new terminal, start the React frontend: `npm run dev`
3. Navigate to `http://localhost:5173/app/disease` in your browser
4. Upload a wheat leaf image to test the disease detection

---

For model improvements or retraining, refer to the scripts in `GUI_WDD/`:
- `train.py` - Model training
- `filter.py` - Image preprocessing
- `count_images.py` - Dataset analysis
