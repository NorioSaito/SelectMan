import json
from logging import getLogger, config
from datetime import datetime as dt
from commons import constants
from controller.MainController import MainController

# ロガー設定
with open(constants.LOG_CONFIG_PATH) as f:
    log_conf = json.load(f)

log_conf['handlers']['fileHandler']['filename'] = constants.LOG_DIR + '/{}.log'.format(dt.now().strftime('%y%m%d'))
config.dictConfig(log_conf)
logger = getLogger(__name__)
logger.info('Lanuch SelectMan')

main_window = MainController(logger)
main_window.display()