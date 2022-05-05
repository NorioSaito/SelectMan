import PySimpleGUI as sg

from commons import constants
from servicies.CopyAutomatorService import CopyAutomatorService
from controller.SettingController import SettingController

class MainController:
    def __init__(self, logger=None):
        self.__layout = [
            [sg.MenuBar([
                ['Option', ['settings']]
                ])
            ],
            [sg.Button('Execute'), sg.Button('Close')],
            [sg.Multiline(key='logs', size=(100, 20), disabled=True)]
        ]
        self.__logger = logger

    
    def display(self):
        try:
            self.__window = sg.Window('SelectMan', self.__layout)
        except Exception:
            self.__logger.error(constants.ERROR_MSG['E100'])

        while True:
            event, _ = self.__window.read()
            
            if event == sg.WIN_CLOSED or event == 'Close':
                self.__output('終了します。', 'green')

                break
            elif event == 'Execute':
                self.__output('物出し処理を開始します。', 'green')
                self.execute()
            elif event == 'settings':
                self.open_setting()

        self.__window.close()

    def execute(self):
        i = 0 # ループカウント（東京都の場合のみインクリメントする）
        for search_area in constants.SEARCH_AREA_LIST:
            self.__output(f'{search_area} の物出し処理を開始します。', 'green')

            # 最初はループフラグは True にしておく
            roop = True
            while roop:
                service = CopyAutomatorService(self.__window, self.__logger)

                return_code = service.auth_extension()
                if return_code != 0:
                    del service
                    break
                
                self.__output(f'今回の i = {i}', 'blue')
                roop = service.execute(search_area, i)

                if search_area == '東京都':
                    i += 1
            
            self.__output(f'{search_area} の物出し処理終了。', 'green')
            del service
        
        return


    def __output(self, text, color):
        self.__window['logs'].print(text, text_color=color)
        self.__window.Refresh()

    def open_setting(self):
        settingController = SettingController(self.__logger)
        settingController.display()