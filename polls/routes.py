from views import index
from settings import STATIC_DIR


def setup_static_routes(app):
    app.router.add_static('/static', STATIC_DIR, name='static')


def setup_routes(app):
    app.router.add_get('/', index)
