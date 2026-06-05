from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.urls import include, path

from api.views import AnalyzeCropView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/analyze/", AnalyzeCropView.as_view(), name="crop-disease-analyze"),
    path("api/", include("api.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
