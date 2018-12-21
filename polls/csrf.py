import os
import asyncio
import hashlib
# import functools

# from syncer import sync
from aiohttp import web
from wtforms import ValidationError
# from asgiref.sync import async_to_sync
from werkzeug.security import safe_str_cmp

def setup_csrf(app):
    CSRFProtect(app)


class CSRFProtect(dict):

    def __init__(self, app):
        super(CSRFProtect, self).__init__()
        self.app = app
        self.init_app(app)

    def init_app(self, app):
        setattr(app, 'csrf', self)

        app.config.setdefault('CSRF_ENABLED', True)
        app.config.setdefault('CSRF_CHECK', True)
        app.config['CSRF_METHODS'] = set(app.config.get(
            'CSRF_METHODS', ['POST', 'PUT', 'PATCH', 'DELETE']))
        app.config.setdefault('CSRF_FIELD_NAME', 'CSRF_TOKEN')
        app.config.setdefault('CSRF_HEADERS', ['X-CSRFToken', 'X-CSRF-Token'])
        app.config.setdefault('CSRF_TIME_LIMIT', 3600)
        app.config.setdefault('CSRF_SSL_STRICT', True)

        app.jinja_env.globals['csrf_token'] = self.generate_csrf

        @web.middleware
        async def csrf_protect(request, handler):
            if not app.config['CSRF_ENABLED']:
                return await handler(request)

            if not app.config['CSRF_CHECK']:
                return await handler(request)

            if request.method not in app.config['CSRF_METHODS']:
                return await handler(request)

            await self.protect(request, handler)

        app.middlewares.append(csrf_protect)

    def generate_csrf(self):
        csrf_token = hashlib.sha1(os.urandom(128)).hexdigest()
        field_name = self.app.config['CSRF_FIELD_NAME']
        # 保存token
        self[field_name] = csrf_token
        # 保存到redis中，验证是否过期
        asyncio.run_coroutine_threadsafe(
            self.app.redis.set(field_name, csrf_token),
            loop=self.app.loop)
        return csrf_token

    async def protect(self, request, handler):
        try:
            await self.validate_csrf(
                await self._get_csrf_token())
        except ValidationError as e:
            # logger.info(e.args[0])
            return await self._error_response(e.args[0])

        return await handler(request)

    async def validate_csrf(self, client_token):
        field_name = self.app.config.get('CSRF_FIELD_NAME')
        server_token = self[field_name]
        redis_token = await self.app.redis.get(field_name)

        if not client_token:
            raise ValidationError('The CSRF token is missing.')

        if not server_token:
            raise ValidationError('The CSRF session token is missing. ')

        if not redis_token:
            raise ValidationError('The CSRF token is invaild.')

        if not safe_str_cmp(redis_token, server_token):
            raise ValidationError('The CSRF token has expired.')

    async def _get_csrf_token(self, request):
        field_name = self.app.config['CSRF_FIELD_NAME']
        csrf_token = request.match_info.get(field_name)

        if csrf_token:
            return csrf_token

        for header_name in self.app.config['CSRF_HEADERS']:
            csrf_token = request.headers.get(header_name)

            if csrf_token:
                return csrf_token

        return None

    async def _error_response(self, msg):
        return web.json_response({'status': -1, 'msg': msg})
