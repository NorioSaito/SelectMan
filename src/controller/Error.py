import PySimpleGUI as sg

class Error:
    def __init__(self, text, logger):
        self.__layout = [
            [sg.Text(text)],
            [sg.Button('OK')]
        ]

    def display(self):
        self.__window = sg.Window('Error', self.__layout, size=(300, 150))

        while True:
            event, _ = self.__window.read()
            if (event is None) or (event == 'OK'):
                break
        
        self.__window.close()