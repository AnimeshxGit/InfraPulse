import logging
from typing import Optional
import redis.asyncio as aioredis
from app.core.config import settings

logger = logging.getLogger(__name__)

redis_pool: Optional[aioredis.ConnectionPool] = None

def get_redis_pool() -> aioredis.ConnectionPool:
    global redis_pool
    if redis_pool is None:
        redis_pool = aioredis.ConnectionPool.from_url(
            settings.REDIS_URL,
            decode_responses=True,
            max_connections=20
        )
    return redis_pool

def get_redis_client() -> aioredis.Redis:
    pool = get_redis_pool()
    return aioredis.Redis(connection_pool=pool)

async def close_redis():
    global redis_pool
    if redis_pool is not None:
        await redis_pool.disconnect()
        redis_pool = None
