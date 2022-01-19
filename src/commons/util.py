import json

from commons import constants

from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException

def read_settings():
    with open(constants.SETTINGS_PATH, encoding='utf-8') as f:
        settings = json.load(f)
    
    return settings

def get_ielove_auth():
    settings = read_settings()
    return settings['ielove']

def get_ATBB_settings():
    settings = read_settings()
    return settings['ATBB']

def get_license_key():
    settings = read_settings()
    return settings['license_key']

def get_extension_info():
    settings = read_settings()
    return settings['extension']