import json

from commons import constants

def read_settings():
    with open(constants.SETTINGS_PATH, encoding='utf-8') as f:
        settings = json.load(f)
    
    return settings

def get_ielove_auth():
    settings = read_settings()
    return settings['ielove']

def get_ATBB_auth():
    settings = read_settings()
    return settings['ATBB']

def get_license_key():
    settings = read_settings()
    return settings['license_key']