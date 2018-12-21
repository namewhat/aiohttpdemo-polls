from aioredis import create_redis_pool
from settings import config

async def init_redis(app):
    conf = config['redis']

    redis = await create_redis_pool(conf['address'],
                              # maxsize=conf['maxsize'],
                              # minsize=conf['minsize'],
                              timeout=conf['timeout'],
                              loop=app.loop)

    setattr(app, 'redis', redis)
    yield
    redis.close()
    await redis.wait_closed()
