import json
from commons import constants, util
class SettingsService:
    def __init__(self, logger):
        self.__logger = logger

    
    def seve_settings(self, values):
        try:
            settings = util.read_settings()
            settings['ielove']['user_id'] = values['ielove_userid']
            settings['ielove']['password'] = values['ielove_password']
            settings['ATBB']['user_id'] = values['ATBB_userid']
            settings['ATBB']['password'] = values['ATBB_password']
            settings['ATBB']['search_condition'] = values['ATBB_search_condition']
            settings['ATBB']['image_count'] = values['ATBB_image_count']
            settings['license_key'] = values['license_key']
            settings['extension']['path'] = values['extension_path']
            settings['extension']['option_url'] = values['option_url']

            with open(constants.SETTINGS_PATH, 'w', encoding='utf-8') as f:
                json.dump(settings, f, indent=4)
            
            return 'SUCCESS'
        except Exception:
            self.__logger.exception('設定の保存に失敗しました。')
            return 'ERROR'