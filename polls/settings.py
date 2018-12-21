import yaml
import sys

from pathlib import Path

BASE_DIR = Path(__file__).parent.parent
CONF_DIR = BASE_DIR / 'config'
STATIC_DIR = BASE_DIR / 'polls/static'

sys.path.insert(0, str(BASE_DIR))
for i in sys.path:print(i)

def get_config(path=None):
    if path is None:
        path = CONF_DIR / 'polls.yaml'

    with open(path) as f:
        config = yaml.load(f)

    config['static_dir'] = STATIC_DIR
    return config

config = get_config()


def setup_config(app):
    setattr(app, 'config', config)
