# from aiohttp import web
from aiohttp_jinja2 import render_template

async def index(request):
    async with request.app.db.acquire() as conn:
        records = await conn.execute(request.app.question.select())
        for row in await records.fetchall():
            print(row.id)
    return render_template('index.html', request, {})
