from sqlalchemy import (MetaData, Table, Column,
                        ForeignKey, Integer, String, Date)
from aiomysql.sa import create_engine


meta = MetaData()

question = Table(
    'question', meta,

    Column('id', Integer, primary_key=True, autoincrement=True),
    Column('content', String(200), nullable=False),
    Column('create_at', String(30), nullable=False))

choice = Table(
    'choice', meta,

    Column('id', Integer, primary_key=True, autoincrement=True),
    Column('content', String(200), nullable=False),
    Column('votes', Integer, nullable=False),

    Column('qid',
           Integer,
           ForeignKey('question.id', ondelete='CASCADE')))

async def init_db(app):
    conf = app.config['mysql']
    engine = await create_engine(db=conf['database'],
                                 host=conf['host'],
                                 port=conf['port'],
                                 user=conf['user'],
                                 password=conf['password'],
                                 minsize=conf['minsize'],
                                 maxsize=conf['maxsize'],
                                 autocommit=True)
    setattr(app, 'db', engine)
    setattr(app, 'choice', choice)
    setattr(app, 'question', question)
    yield
    app.db.close()
    await app.db.wait_closed()


# async def close_db(app):
#     app.db.close()
# 	await app.db.wait_closed()
