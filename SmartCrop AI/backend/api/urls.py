from django.urls import path

from api.views import CropDiseaseUploadView

urlpatterns = [
	path("detect/", CropDiseaseUploadView.as_view(), name="crop-disease-detect"),
]
