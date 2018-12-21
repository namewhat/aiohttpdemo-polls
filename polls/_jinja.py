# from csrf import setup_csrf
from jinja2 import PackageLoader
from aiohttp_jinja2 import setup, request_processor

# 添加变量
async def bitch(request):
    return {'fuck': 'you'}


def setup_jinja2(app):
    jinja_env = setup(app,
                      context_processors=[bitch, request_processor],
                      loader=PackageLoader('polls', 'templates'))
    # jinja_env.globals['eval'] = eval
    setattr(app, 'jinja_env', jinja_env)
    app['static_root_url'] = '/static'
