import json
import pytest
from starlette.testclient import TestClient
from starlette.websockets import WebSocketDisconnect
from app.main import app
from app.core.security import create_access_token

def test_websocket_query_token_auth():
    token = create_access_token(
        subject="user-uuid-123",
        role="USER",
        extra_claims={"email": "user@test.com", "name": "Test User"}
    )
    
    client = TestClient(app)
    with client.websocket_connect(f"/ws?token={token}") as websocket:
        data = websocket.receive_text()
        msg = json.loads(data)
        assert msg["event_type"] == "connection.established"
        assert msg["data"]["user_id"] == "user-uuid-123"
        assert msg["data"]["role"] == "USER"

        websocket.send_text(json.dumps({"type": "ping"}))
        pong_data = websocket.receive_text()
        pong_msg = json.loads(pong_data)
        assert pong_msg["type"] == "pong"

def test_websocket_first_message_auth():
    token = create_access_token(
        subject="staff-uuid-456",
        role="STAFF",
        extra_claims={"username": "staff_alice", "category": "Structural", "name": "Alice"}
    )
    
    client = TestClient(app)
    with client.websocket_connect("/ws") as websocket:
        websocket.send_text(json.dumps({"type": "auth", "token": token}))
        data = websocket.receive_text()
        msg = json.loads(data)
        assert msg["event_type"] == "connection.established"
        assert msg["data"]["user_id"] == "staff-uuid-456"
        assert msg["data"]["role"] == "STAFF"
        assert msg["data"]["category"] == "Structural"

def test_websocket_invalid_auth():
    client = TestClient(app)
    with client.websocket_connect("/ws?token=bad-token") as websocket:
        msg_str = websocket.receive_text()
        msg = json.loads(msg_str)
        assert msg["event_type"] == "error"
