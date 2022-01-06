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

def get_ATBB_auth():
    settings = read_settings()
    return settings['ATBB']

def get_license_key():
    settings = read_settings()
    return settings['license_key']

def get_extension_info():
    settings = read_settings()
    return settings['extension']

def get_probability():
    settings = read_settings()
    return float(settings['probability'])


# ID での表示待機
def wait_visibility_by_id(wait, id):
    retry_count = 0
    while True:
        try:
            return wait.until(EC.visibility_of_element_located((By.ID, id)))
        except TimeoutException as e:
            if retry_count < 3:
                retry_count += 1
                continue
            else:
                raise e
        except Exception as e:
            raise e


# CSS セレクタでの表示待機
def wait_visibility_by_selector(wait, selector):
    retry_count = 0
    while True:
        try:
            return wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, selector)))
        except TimeoutException as e:
            if retry_count < 3:
                retry_count += 1
                continue
            else:
                raise e
        except Exception as e:
            raise e


# CSS セレクタでの複数要素表示待機
def wait_visibility_all_elements_by_selector(wait, selector):
    retry_count = 0
    while True:
        try:
            return wait.until(EC.visibility_of_all_elements_located((By.CSS_SELECTOR, selector)))
        except TimeoutException as e:
            if retry_count < 3:
                retry_count += 1
                continue
            else:
                raise e
        except Exception as e:
            raise e


# クラス名での表示待機
def wait_visibility_by_class_name(wait, class_name):
    retry_count = 0
    while True:
        try:
            return wait.until(EC.visibility_of_element_located((By.CLASS_NAME, class_name)))
        except TimeoutException as e:
            if retry_count < 3:
                retry_count += 1
                continue
            else:
                raise e
        except Exception as e:
            raise e


# クラス名での複数要素表示待機
def wait_visibility_all_elements_by_class_name(wait, class_name):
    retry_count = 0
    while True:
        try:
            return wait.until(EC.visibility_of_all_elements_located((By.CLASS_NAME, class_name)))
        except TimeoutException as e:
            if retry_count < 3:
                retry_count += 1
                continue
            else:
                raise e
        except Exception as e:
            raise e


# ID での表示待機
def wait_clickable_by_id(wait, id):
    retry_count = 0
    while True:
        try:
            return wait.until(EC.element_to_be_clickable((By.ID, id)))
        except TimeoutException as e:
            if retry_count < 3:
                retry_count += 1
                continue
            else:
                raise e
        except Exception as e:
            raise e


# CSS セレクタでの表示待機
def wait_clickable_by_selector(wait, selector):
    retry_count = 0
    while True:
        try:
            return wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, selector)))
        except TimeoutException as e:
            if retry_count < 3:
                retry_count += 1
                continue
            else:
                raise e
        except Exception as e:
            raise e


# クラス名での表示待機
def wait_clickable_by_class_name(wait, class_name):
    retry_count = 0
    while True:
        try:
            return wait.until(EC.element_to_be_clickable((By.CLASS_NAME, class_name)))
        except TimeoutException as e:
            if retry_count < 3:
                retry_count += 1
                continue
            else:
                raise e
        except Exception as e:
            raise e


def wait_random_control(wait, element):
    retry_count = 0
    while True:
        try:
            return wait.until(element)
        except TimeoutException as e:
            if retry_count < 3:
                retry_count += 1
                continue
            else:
                raise e
        except Exception as e:
            raise e