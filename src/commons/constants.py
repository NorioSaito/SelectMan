import os
# ログ設定ファイルパス
LOG_CONFIG_PATH = os.path.join('config', 'log_config.json')
# ログフォルダ
LOG_DIR = os.path.join('..', 'Logs')

# 拡張機能フォルダパス
EXTENSION_PATH = os.path.join('extensions')

# 設定ファイルパス
SETTINGS_PATH = os.path.join('config', 'settings.json')

# アットホーム URL
ATHOME_LOGIN_URL = 'http://atbb.athome.jp/'

# エラーメッセージ
ERROR_MSG = {
    'E100': 'アプリケーションの起動に失敗しました。',
    'E200': '拡張機能の認証でエラーが発生しました。',
    'E300': 'アットホームのログインに失敗しました。',
    'E301': '物件検索処理でエラーが発生しました。',
    'E302': '物出し処理でエラーが発生しました。',
    'E999': '予期せぬエラーが発生しました。'
    }