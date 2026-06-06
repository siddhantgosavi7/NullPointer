# Deployment

1. Create Python virtualenv and install backend requirements:

```bash
python -m venv .venv
. .venv/Scripts/Activate.ps1  # Windows PowerShell
pip install -r backend/requirements.txt
```

2. (Optional) Move `wheat_model.h5` and `classes.json` into `AI_Model/` at project root for centralized model management.

3. Run backend:

```bash
uvicorn backend.main:app --reload --port 8000
```

4. Set frontend env var `VITE_API_URL` to `http://localhost:8000` and start frontend (`npm run dev`).
