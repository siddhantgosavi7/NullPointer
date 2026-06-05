from django.urls import path

from api.views import AnalyzeCropView

urlpatterns = [
	path("detect/", AnalyzeCropView.as_view(), name="crop-disease-detect"),
]
