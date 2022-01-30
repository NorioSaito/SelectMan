import PySimpleGUI as sg
from commons import constants, util
from controller import Complete, Error
from servicies import SettingsService

class SettingController():
    def __init__(self, logger):
        ielove_setting = util.get_ielove_auth()
        ATBB_setting = util.get_ATBB_settings()
        license_key = util.get_license_key()
        extension = util.get_extension_info()

        self.__layout = [
            [
                sg.TabGroup([[
                    sg.Tab('いえらぶ', [
                        [sg.Text('ユーザID', size=(10, 1)), sg.Input(key='ielove_userid', default_text=ielove_setting['user_id'], size=(100,))],
                        [sg.Text('パスワード', size=(10, 1)), sg.Input(key='ielove_password', default_text=ielove_setting['password'], size=(100,))],
                    ]),
                    sg.Tab('ATBB', [
                        [sg.Text('ユーザID', size=(10, 1)), sg.Input(key='ATBB_userid', default_text=ATBB_setting['user_id'], size=(100,))],
                        [sg.Text('パスワード', size=(10, 1)), sg.Input(key='ATBB_password', default_text=ATBB_setting['password'], size=(100,))],
                        [sg.Text('検索条件名', size=(10, 1)), sg.Input(key='ATBB_search_condition', default_text=ATBB_setting['search_condition'], size=(100,))],
                        [sg.Text('画像点数', size=(10, 1)), sg.Input(key='ATBB_image_count', default_text=ATBB_setting['image_count'], size=(100,))],
                    ]),
                    sg.Tab('物出しロボ', [
                        [sg.Text('マシンキー', size=(10, 1)), sg.Input(key='license_key', default_text=license_key, size=(100,))]
                    ]),
                    sg.Tab('拡張機能', [
                        [sg.Text('パス', size=(10, 1)), sg.Input(key="extension_path", default_text=extension['path'], size=(100,))],
                        [sg.Text('オプションURL', size=(10, 1)), sg.Input(key="option_url", default_text=extension['option_url'], size=(100,))],
                    ])
                ]])
            ],
            [
                sg.Button('保存', key='save')
            ]
        ]
        self.__logger = logger

    def display(self):
        self.__window = sg.Window('Setting', self.__layout, size=(500, 200))

        while True:
            event, values = self.__window.read()
            
            if event == sg.WIN_CLOSED:
                break
            elif event is 'save':
                self.save(values)

        self.__window.close()

    def save(self, values):
        self.__logger.info('save settings')
        
        service = SettingsService.SettingsService(self.__logger)
        result = service.seve_settings(values)

        if result == 'SUCCESS':
            complete = Complete.Complete('設定を保存しました。', self.__logger)
            complete.display()
        elif result == 'ERROR':
            error = Error.Error('設定の保存に失敗しました。', self.__logger)
            error.display()

