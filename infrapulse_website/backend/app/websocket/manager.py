import json
import logging
import asyncio
from typing import Dict, Set, Optional, Any
from fastapi import WebSocket
from app.schemas.websocket import WebSocketEvent, WSEventType
from app.core.config import settings
from app.integrations.redis import get_redis_client

logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        self.user_connections: Dict[str, Set[WebSocket]] = {}
        self.category_connections: Dict[str, Set[WebSocket]] = {
            "Structural": set(),
            "Functional": set(),
            "Performance": set(),
        }
        self.all_connections: Set[WebSocket] = set()
        self._lock = asyncio.Lock()

    async def register(self, websocket: WebSocket, user_id: str, role: str, category: Optional[str] = None):
        async with self._lock:
            self.all_connections.add(websocket)
            
            if user_id not in self.user_connections:
                self.user_connections[user_id] = set()
            self.user_connections[user_id].add(websocket)
            
            if role == "STAFF" and category:
                norm_cat = self._normalize_category(category)
                if norm_cat not in self.category_connections:
                    self.category_connections[norm_cat] = set()
                self.category_connections[norm_cat].add(websocket)
                
        logger.info(f"WebSocket registered: user_id={user_id}, role={role}, category={category}")
        
        welcome_event = WebSocketEvent(
            event_type="connection.established",
            data={"user_id": user_id, "role": role, "category": category}
        )
        await websocket.send_text(welcome_event.model_dump_json())

    async def unregister(self, websocket: WebSocket, user_id: str, role: str, category: Optional[str] = None):
        async with self._lock:
            self.all_connections.discard(websocket)
            if user_id in self.user_connections:
                self.user_connections[user_id].discard(websocket)
                if not self.user_connections[user_id]:
                    del self.user_connections[user_id]
            if role == "STAFF" and category:
                norm_cat = self._normalize_category(category)
                if norm_cat in self.category_connections:
                    self.category_connections[norm_cat].discard(websocket)
        logger.info(f"WebSocket unregistered: user_id={user_id}")

    def _normalize_category(self, cat: str) -> str:
        c = cat.strip().capitalize()
        if c.lower() == "structural":
            return "Structural"
        if c.lower() == "functional":
            return "Functional"
        if c.lower() == "performance":
            return "Performance"
        return cat

    async def send_to_user_local(self, user_id: str, event: WebSocketEvent):
        targets = set()
        async with self._lock:
            if user_id in self.user_connections:
                targets = set(self.user_connections[user_id])
                
        dead_sockets = set()
        for ws in targets:
            try:
                await ws.send_text(event.model_dump_json())
            except Exception as e:
                logger.warning(f"Failed to send to user {user_id} socket: {e}")
                dead_sockets.add(ws)
                
        if dead_sockets:
            async with self._lock:
                for ws in dead_sockets:
                    self.all_connections.discard(ws)
                    if user_id in self.user_connections:
                        self.user_connections[user_id].discard(ws)

    async def send_to_category_local(self, category: str, event: WebSocketEvent):
        norm_cat = self._normalize_category(category)
        targets = set()
        async with self._lock:
            if norm_cat in self.category_connections:
                targets = set(self.category_connections[norm_cat])
                
        dead_sockets = set()
        for ws in targets:
            try:
                await ws.send_text(event.model_dump_json())
            except Exception as e:
                logger.warning(f"Failed to send to category {norm_cat} socket: {e}")
                dead_sockets.add(ws)
                
        if dead_sockets:
            async with self._lock:
                for ws in dead_sockets:
                    self.all_connections.discard(ws)
                    if norm_cat in self.category_connections:
                        self.category_connections[norm_cat].discard(ws)

    async def broadcast_local(self, event: WebSocketEvent):
        targets = set()
        async with self._lock:
            targets = set(self.all_connections)
            
        dead_sockets = set()
        for ws in targets:
            try:
                await ws.send_text(event.model_dump_json())
            except Exception as e:
                logger.warning(f"Failed to broadcast socket message: {e}")
                dead_sockets.add(ws)
                
        if dead_sockets:
            async with self._lock:
                for ws in dead_sockets:
                    self.all_connections.discard(ws)

    async def publish_event(
        self,
        event_type: WSEventType,
        data: Dict[str, Any],
        target_user_id: Optional[str] = None,
        target_category: Optional[str] = None
    ):
        event = WebSocketEvent(event_type=event_type, data=data)
        
        if target_user_id:
            await self.send_to_user_local(target_user_id, event)
        if target_category:
            await self.send_to_category_local(target_category, event)
        if not target_user_id and not target_category:
            await self.broadcast_local(event)
            
        try:
            redis_client = get_redis_client()
            message = {
                "event": event.model_dump(mode="json"),
                "target_user_id": target_user_id,
                "target_category": target_category
            }
            await asyncio.wait_for(
                redis_client.publish(settings.REDIS_WS_CHANNEL, json.dumps(message)),
                timeout=0.2
            )
        except Exception as e:
            logger.debug(f"Redis WS publish skipped/timeout: {e}")

ws_manager = ConnectionManager()
