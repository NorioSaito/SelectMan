import os
# ログ設定ファイルパス
LOG_CONFIG_PATH = os.path.join('config', 'log_config.json')
# ログフォルダ
LOG_DIR = os.path.join('Logs')

# Chrome Driver
CHROME_DRIVER = os.path.join('driver', 'chromedriver')

# 設定ファイルパス
SETTINGS_PATH = os.path.join('config', 'settings.json')

# アットホーム URL
ATHOME_LOGIN_URL = 'http://atbb.athome.jp/'

# エラーメッセージ
ERROR_MSG = {
    'E100': 'アプリケーションの起動に失敗しました。',
    'E200': '拡張機能の認証でエラーが発生しました。',
    'E201': '拡張機能の認証情報が誤っています。',
    'E300': 'アットホームのログインに失敗しました。',
    'E301': '物件検索処理でエラーが発生しました。',
    'E302': '物出し処理でエラーが発生しました。',
    'E303': '設定された検索条件名「{0}」が見つかりませんでした。',
    'E999': '予期せぬエラーが発生しました。'
    }

# 物件一覧でランダムな操作をする場合の要素
RANDOM_ELEMENT_BY_LIST = [
    '#infoSheet_0', # インフォシート（別ウィンドウ）
    '#chizu_0', # 地図（無料）
    'body > table > tbody > tr:nth-child(3) > td > table > tbody > tr:nth-child(1) > td:nth-child(3) > form:nth-child(33) > div.bukkenKensakuKekkaWrapper > table:nth-child(10) > tbody > tr:nth-child(5) > td:nth-child(2) > a' # 加盟店リンク
]

# 検索対象所在地リスト
SEARCH_AREA_LIST = [
    '埼玉県',
    '神奈川県',
    '千葉県',
    '東京都'
]