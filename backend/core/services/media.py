import uuid
from pathlib import Path

from django.core.files.storage import default_storage
from rest_framework.exceptions import ValidationError

ALLOWED_FOLDERS = frozenset({"avatars", "stores", "products", "promotions"})
ALLOWED_EXTENSIONS = frozenset({".jpg", ".jpeg", ".png", ".webp"})
MAX_UPLOAD_BYTES = 5 * 1024 * 1024


def save_media_upload(*, uploaded_file, folder: str) -> str:
    if folder not in ALLOWED_FOLDERS:
        raise ValidationError({"folder": "Pasta de upload inválida."})

    if uploaded_file.size > MAX_UPLOAD_BYTES:
        raise ValidationError({"file": "Arquivo muito grande. Máximo de 5 MB."})

    extension = Path(uploaded_file.name).suffix.lower()
    if extension not in ALLOWED_EXTENSIONS:
        raise ValidationError({"file": "Formato não suportado. Use JPG, PNG ou WEBP."})

    filename = f"{uuid.uuid4()}{extension}"
    relative_path = f"{folder}/{filename}"
    saved_path = default_storage.save(relative_path, uploaded_file)
    return saved_path
