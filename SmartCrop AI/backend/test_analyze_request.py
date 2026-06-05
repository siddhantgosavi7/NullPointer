import base64
import json
import tempfile
from pathlib import Path

import requests

API_URL = "http://127.0.0.1:8000/api/analyze/"
LANGUAGE = "Hindi"

# 1x1 PNG image so the request always has a valid dummy file.
DUMMY_PNG_BYTES = base64.b64decode(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO7+oXcAAAAASUVORK5CYII="
)


def build_dummy_image() -> Path:
    temp_dir = Path(tempfile.gettempdir())
    image_path = temp_dir / "dummy_crop_image.png"
    image_path.write_bytes(DUMMY_PNG_BYTES)
    return image_path


def main() -> None:
    image_path = build_dummy_image()

    try:
        with image_path.open("rb") as image_file:
            response = requests.post(
                API_URL,
                files={"image": (image_path.name, image_file, "image/png")},
                data={"language": LANGUAGE},
                timeout=60,
            )

        print(f"Status code: {response.status_code}")

        try:
            payload = response.json()
            print(json.dumps(payload, indent=2, ensure_ascii=False))
        except ValueError:
            print(response.text)
    finally:
        try:
            image_path.unlink(missing_ok=True)
        except OSError:
            pass


if __name__ == "__main__":
    main()
