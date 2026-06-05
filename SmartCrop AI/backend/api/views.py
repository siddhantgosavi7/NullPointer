import tempfile
from pathlib import Path

from rest_framework import status
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from api.classifier import get_remedy, predict_disease


class CropDiseaseUploadView(APIView):
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, *args, **kwargs):
        uploaded_image = request.FILES.get("image")
        if uploaded_image is None:
            return Response(
                {"error": "Please upload an image file using the 'image' field."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        suffix = Path(uploaded_image.name).suffix or ".jpg"
        temp_path = None

        try:
            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
                for chunk in uploaded_image.chunks():
                    temp_file.write(chunk)
                temp_path = temp_file.name

            disease, confidence = predict_disease(temp_path)

            return Response(
                {
                    "disease": disease,
                    "confidence": round(confidence, 4),
                    "remedy": get_remedy(disease),
                },
                status=status.HTTP_200_OK,
            )
        finally:
            if temp_path:
                Path(temp_path).unlink(missing_ok=True)