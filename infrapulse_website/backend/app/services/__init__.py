from app.services.auth_service import auth_service, AuthService
from app.services.storage_service import storage_service, StorageService
from app.services.ai_dispatcher import ai_dispatcher, AIDispatcher
from app.services.queue_service import queue_service, QueueService
from app.services.status_service import status_service, StatusService
from app.services.complaint_service import complaint_service, ComplaintService

__all__ = [
    "auth_service", "AuthService",
    "storage_service", "StorageService",
    "ai_dispatcher", "AIDispatcher",
    "queue_service", "QueueService",
    "status_service", "StatusService",
    "complaint_service", "ComplaintService"
]
