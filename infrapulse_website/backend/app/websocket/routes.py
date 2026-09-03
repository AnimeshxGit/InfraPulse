import json
import logging
import asyncio
from typing import Optional
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query, status
from app.core.security import decode_access_token
from app.websocket.manager import ws_manager

logger = logging.getLogger(__name__)

router = APIRouter()

@router.websocket("/ws")
@router.websocket("/api/v1/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    token: Optional[str] = Query(default=None)
):
    await websocket.accept()
    user_id = None
    role = None
    category = None
    
    if token:
        payload = decode_access_token(token)
        if payload:
            user_id = payload.get("sub")
            role = payload.get("role", "USER").upper()
            category = payload.get("category")
        else:
            await websocket.send_text(json.dumps({"event_type": "error", "message": "Invalid authentication token"}))
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return
    else:
        try:
            auth_msg_raw = await asyncio.wait_for(websocket.receive_text(), timeout=5.0)
            auth_msg = json.loads(auth_msg_raw)
            auth_token = auth_msg.get("token") or auth_msg.get("access_token")
            if auth_token:
                payload = decode_access_token(auth_token)
                if payload:
                    user_id = payload.get("sub")
                    role = payload.get("role", "USER").upper()
                    category = payload.get("category")
            
            if not user_id:
                await websocket.send_text(json.dumps({"event_type": "error", "message": "Authentication required"}))
                await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
                return
        except Exception as e:
            logger.warning(f"WebSocket auth handshake timed out or failed: {e}")
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return

    await ws_manager.register(websocket, user_id=user_id, role=role, category=category)
        
    try:
        while True:
            data_text = await websocket.receive_text()
            try:
                msg = json.loads(data_text)
                if msg.get("type") == "ping" or msg.get("event") == "ping":
                    await websocket.send_text(json.dumps({"event_type": "pong", "type": "pong"}))
            except Exception:
                pass
    except WebSocketDisconnect:
        await ws_manager.unregister(websocket, user_id=user_id, role=role, category=category)
    except Exception as e:
        logger.warning(f"WebSocket error for {user_id}: {e}")
        await ws_manager.unregister(websocket, user_id=user_id, role=role, category=category)
