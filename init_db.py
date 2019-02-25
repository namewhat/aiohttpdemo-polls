import time
import asyncio

from aiomysql import create_pool
from sqlalchemy import select, and_
from aiomysql.sa import create_engine
from polls.models import question, choice
from sqlalchemy.schema import CreateTable, DropTable
from sqlalchemy.sql.expression import bindparam

async def init_engine(loop):
    return await create_engine(host='127.0.0.1', port=3306,
                               autocommit=True, user='root',
                               password='123456', db='aioweb', loop=loop)
async def init_pool(loop):
    return await create_pool(host='127.0.0.1', port=3306,
                             user='root', password='123456',
                             db='aioweb', loop=loop, autocommit=True)


def init_bind():
    from sqlalchemy import create_engine as ce
    from polls.settings import config

    DSN = 'mysql+pymysql://{user}:{password}@{host}:{port}/{database}'

    return ce(DSN.format(**config['mysql']))

async def create_tables(engine):
    async with engine.acquire() as conn:
        for table in [question, choice]:
            create_expr = CreateTable(table)
            if table.exists(init_bind()):
                await conn.execute('SET FOREIGN_KEY_CHECKS = 0')
                drop_expr = DropTable(table)
                await conn.execute(drop_expr)
                await conn.execute(create_expr)
                await conn.execute('SET FOREIGN_KEY_CHECKS = 1')
            else:
                await conn.execute(create_expr)


async def sample_data(engine):
    async with engine.acquire() as conn:
        data = [
            {'content': 'what the fuck hello word', 'create_at': time.time()},
            {'content': 'just fuck you', 'create_at': time.time()},
        ]
        for row in data:
            return await conn.execute(question.insert().values(**row))

        # data = [
        #     {'content': 'fuck', 'votes': 1, 'qid': 1},
        #     {'content': 'your', 'votes': 2, 'qid': 1},
        #     {'content': 'wife', 'votes': 3, 'qid': 1},
        # ]
        # for row in data:
        # return await conn.execute(choice.insert().values(*data))

# 批量更新
async def update(engine):
    async with engine.acquire() as conn:
        await conn.execute(choice.update().where(
            choice.c.id == bindparam('id')
        ).values(
            {'content': bindparam('content')}
        ), [
            {'id': 1, 'content': 'fuck'},
            {'id': 2, 'content': 'bitch'},
        ]
        )

async def _select(engine):
    async with engine.acquire() as conn:
        sql = select([choice.c.id]).where(
            and_(choice.c.id == 3, choice.c.content == 'fuck'))
        rows = await conn.execute(sql)
        print(await rows.fetchall())
        # return await rows.first()

async def main(loop):
    engine = await init_engine(loop)
    # print(getattr(choice.c, 'qid'))
    # await create_tables(engine)
    r = await sample_data(engine)
    # print(await r.first())
    # print(r.rowcount)
    # print(r.lastrowid)
    # await _select(engine)

if __name__ == '__main__':
    loop = asyncio.get_event_loop()
    loop.run_until_complete(main(loop))
    loop.close()
