from django.core.files.storage import default_storage
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from core.services.media import save_media_upload


@extend_schema(tags=['Sistema'], summary='Health check')
@api_view(["GET"])
@permission_classes([AllowAny])
def health_check(request: Request) -> Response:
    return Response({"status": "ok"})


@extend_schema(tags=['Sistema'], summary='Upload de mídia')
class MediaUploadView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request: Request) -> Response:
        uploaded_file = request.FILES.get("file")
        if uploaded_file is None:
            return Response(
                {"file": ["Nenhum arquivo enviado."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        folder = request.data.get("folder", "avatars")
        saved_path = save_media_upload(uploaded_file=uploaded_file, folder=folder)
        file_url = default_storage.url(saved_path)

        return Response({"url": file_url}, status=status.HTTP_201_CREATED)

