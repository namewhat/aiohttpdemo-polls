import sys
import aiohttp_autoreload;aiohttp_autoreload.start()

from csrf import setup_csrf
from _jinja import setup_jinja2
from _redis import init_redis
from routes import setup_routes, setup_static_routes
from models import init_db
from aiohttp import web
from session import setup_session
from settings import setup_config
from middlewares import setup_middlewares
app = web.Application(debug=True)

setup_config(app)
setup_routes(app)
setup_jinja2(app)
setup_session(app)
setup_middlewares(app)
setup_static_routes(app)
setup_csrf(app)

app.cleanup_ctx.append(init_db)
app.cleanup_ctx.append(init_redis)

web.run_app(app)
