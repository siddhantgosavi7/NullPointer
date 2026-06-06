# Integration Report

- Found existing disease detection model at `GUI_WDD/wheat_model.h5` (TensorFlow Keras `.h5`).
- No `AI_Model/` folder existed; created `AI_Model/` and copied `classes.json`.
- Backend: created a FastAPI service that wraps existing `GUI_WDD` prediction logic to provide `/api/disease/predict`.
- Crop analysis and yield prediction models were not present; endpoints created as placeholders returning heuristic responses where appropriate.

Model details (disease detection):
- Model type: TensorFlow Keras (`.h5`).
- Input: RGB image resized to 224x224, values normalized to [0,1].
- Output: probability scores per class; code maps argmax to class and returns confidence.
- Preprocessing: convert to RGB, resize to (224,224), convert to array, scale by 1/255.
- Postprocessing: returns `disease`, `confidence`, `scores`, and `uncertain` flag if confidence < 0.7.

Notes:
- I updated code to prefer models in `AI_Model/` if present, else fall back to `GUI_WDD/`.
- I did not move the binary `wheat_model.h5` automatically; please move it to `AI_Model/` if desired. The backend will detect it there.
