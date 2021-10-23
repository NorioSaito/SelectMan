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
            event, values = self.__window.read()
            
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
        service = CopyAutomatorService(self.__window, self.__logger)
        return_code = service.auth_extension()
        
        if return_code != 0:
            return
        
        service.execute()


    def __output(self, text, color):
        self.__window['logs'].print(text, text_color=color)
        self.__window.Refresh()

    def open_setting(self):
        settingController = SettingController(self.__logger)
        settingController.display()