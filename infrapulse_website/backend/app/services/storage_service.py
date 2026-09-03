import os
import uuid
import aiofiles
from pathlib import Path
from typing import Tuple
from fastapi import UploadFile, HTTPException, status
from app.core.config import settings

class StorageService:
    def __init__(self, storage_root: str = settings.STORAGE_ROOT):
        self.storage_root = Path(storage_root).resolve()
        self.storage_root.mkdir(parents=True, exist_ok=True)

    async def save_image(self, file: UploadFile) -> Tuple[str, str]:
        content_type = file.content_type or ""
        if content_type.lower() not in [m.lower() for m in settings.ALLOWED_IMAGE_MIME_TYPES]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported image type '{content_type}'. Allowed types: {', '.join(settings.ALLOWED_IMAGE_MIME_TYPES)}"
            )

        ext = ".jpg"
        if "png" in content_type:
            ext = ".png"
        elif "webp" in content_type:
            ext = ".webp"
        elif "jpeg" in content_type or "jpg" in content_type:
            ext = ".jpg"

        file_id = str(uuid.uuid4())
        filename = f"{file_id}{ext}"
        destination = self.storage_root / filename

        size = 0
        async with aiofiles.open(destination, "wb") as out_file:
            while chunk := await file.read(1024 * 64):
                size += len(chunk)
                if size > settings.MAX_UPLOAD_SIZE_BYTES:
                    if destination.exists():
                        destination.unlink()
                    raise HTTPException(
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        detail=f"File exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE_BYTES // (1024*1024)}MB"
                    )
                await out_file.write(chunk)

        return str(destination), str(destination)

    def get_absolute_path(self, storage_uri: str) -> Path:
        p = Path(storage_uri)
        if not p.is_absolute():
            p = self.storage_root / storage_uri
        return p

storage_service = StorageService()
