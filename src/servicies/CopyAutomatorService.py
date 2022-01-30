import os
import re
import time
import pyautogui
import random

from selenium import webdriver
from selenium.webdriver.common.alert import Alert
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.keys import Keys
from selenium.common.exceptions import TimeoutException
from commons import constants, util

class CopyAutomatorService():
    def __init__(self, window, logger):
        self.__window = window
        self.__logger = logger

        self.__options = webdriver.ChromeOptions()
        # 拡張機能を読み込み
        self.extension = util.get_extension_info()
        self.__options.add_argument(f'load-extension={self.extension["path"]}')
        self.__options.add_argument('--lang=ja-JP')

        print(constants.CHROME_DRIVER)
        self.driver = webdriver.Chrome(constants.CHROME_DRIVER, options=self.__options)
        # 暗黙的な待機を設定
        self.driver.implicitly_wait(10)

        # 明示的な待機を設定
        self.wait = WebDriverWait(self.driver, 10)
        self.long_wait = WebDriverWait(self.driver, 30)


    def auth_extension(self):
        self.output_log_info('拡張機能の認証開始')
        # 拡張機能のオプションページを開く
        self.driver.get(self.extension['option_url'])

        # 拡張機能の認証
        try:
            ielove_auth = util.get_ielove_auth()
            license_key = util.get_license_key()

            input_id = self.wait.until(EC.visibility_of_element_located((By.ID, 'id')))
            input_id.send_keys(ielove_auth['user_id'])

            input_password = self.wait.until(EC.visibility_of_element_located((By.ID, "password")))
            input_password.send_keys(ielove_auth['password'])

            input_key = self.wait.until(EC.visibility_of_element_located((By.ID, "at-api")))
            input_key.send_keys(license_key)

            login_button = self.wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, "#register-form > div.m-t-30.m-b-25.txt-ctr > input")))
            login_button.click()

            # アラートを処理
            alert = self.wait.until(EC.alert_is_present())
            text = Alert(self.driver).text
            if text == 'ID、またはパスワードが間違っています。':
                error_code = 'E201'
                self.output_log_error(constants.ERROR_MSG[error_code])
                self.driver.quit()
                
            alert.accept()

            self.output_log_info('拡張機能を認証しました。')
        except TimeoutException as e:
            error_code = 'E200'
            self.output_log_error(constants.ERROR_MSG[error_code])
            self.driver.quit()

            return error_code
        except Exception as e:
            error_code = 'E999'
            self.output_log_error(constants.ERROR_MSG[error_code])
            self.driver.quit()

            return error_code
        
        return 0


    def execute(self):
        try:
            ATBB_auth = util.get_ATBB_settings()

            self.output_log_info('アットホームログイン開始')
            self.driver.get(constants.ATHOME_LOGIN_URL)

            # アットホームログイン
            input_user_id = self.wait.until(EC.visibility_of_element_located((By.ID,'loginFormText')))
            input_user_id.send_keys(ATBB_auth['user_id'])

            input_password = self.wait.until(EC.visibility_of_element_located((By.ID,'passFormText')))
            input_password.send_keys(ATBB_auth['password'])

            # クリック可能になるまで wait
            login_button = self.wait.until(EC.element_to_be_clickable((By.ID, 'loginSubmit')))
            login_button.click()

            self.output_log_info('アットホームログイン成功')
        except TimeoutException as e:
            error_code = 'E300'
            self.output_log_error(constants.ERROR_MSG[error_code])
            self.driver.quit()

            return error_code
        except Exception as e:
            error_code = 'E999'
            self.output_log_error(constants.ERROR_MSG[error_code])
            self.driver.quit()

            return error_code


        try:
            self.output_log_info('物件検索開始')
            # 物件検索メニュー表示
            search_menu = self.wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR,'#header > header-menu > div > nav > ul > li:nth-child(1) > a')))
            search_menu.click()

            # 流通物件検索（保存した条件）クリック
            search_link = self.wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR,'#header > header-menu > div > nav > ul > li.is-c-show > div > form > div > div:nth-child(2) > div > h3')))
            search_link.click()

            # ATBB が別タブで開くのでタブ切り替え
            self.driver.switch_to.window(self.driver.window_handles[-1])

            self.output_log_info('ATTB の検索条件設定')
            # 掲載可物件の検索条件を探す
            # ページネーション数を取得
            page_element = self.wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, 'body > table > tbody > tr:nth-child(3) > td > table > tbody > tr:nth-child(1) > td:nth-child(3) > form:nth-child(70) > table:nth-child(8) > tbody > tr > td:nth-child(1) > span:nth-child(1)')))
            page = int(page_element.text)

            # 使用する検索条件を設定ファイルから取得
            ATBB_settings = util.get_ATBB_settings()
            search_condition = ATBB_settings['search_condition']
            min_image_count = min_image_count = ATBB_settings['image_count']
            self.output_log_info(f'今回使用する検索条件 = {search_condition}')
            self.output_log_info(f'今回の最低画像点数 = {min_image_count}')

            # ページネーションごとに保存済み検索条件のリストを取得
            end_flg = False # 掲載可物件の検索結果に遷移済みかのフラグ
            for i in range(page):
                # 保存済み条件リストを取得
                conditions = self.wait.until(EC.visibility_of_all_elements_located((By.CLASS_NAME, 'kensakuJokenDatum')))
                for j, condition in enumerate(conditions):
                    # 掲載可物件のリンクを探す
                    name = condition.find_element_by_class_name('kensakuJokenTorokuMemo')
                  
                    if name.text == search_condition:
                        self.driver.execute_script("arguments[0].scrollIntoView();", condition)
                        link = self.long_wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, '#gaitoSu\[' + str(j) + '\] > a')))
                        link.click()
                        end_flg = True

                        break


                if end_flg: # 遷移済みの場合、ループ終了
                    break

                # ページネーションを進める
                try:
                    next_link = self.wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, 'body > table > tbody > tr:nth-child(3) > td > table > tbody > tr:nth-child(1) > td:nth-child(3) > form:nth-child(68) > table:nth-child(8) > tbody > tr > td:nth-child(2) > ul > li:nth-child(3) > a')))
                except TimeoutException as e: # 最終ページまで見ても検索条件がなければエラー
                    self.output_log_error(constants.ERROR_MSG['E303'].format(search_condition))
                    self.logout_ATBB()
                else:
                    next_link.click()


            # 検索条件を再設定
            resetting_btn = self.wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, 'body > table > tbody > tr:nth-child(3) > td > table > tbody > tr:nth-child(1) > td:nth-child(3) > form:nth-child(33) > table.layout-fix > tbody > tr:nth-child(9) > td > span.flt-rght > input[type=button]:nth-child(1)')))
            resetting_btn.click()

            # 本日公開にチェック
            released_today = self.wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, '#kokaibiCheck')))
            released_today.click()

            self.output_log_info('物件を検索します。')
            # 再検索
            search_btn = self.wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, '#totalDisplayButton > input:nth-child(1)')))
            search_btn.click()
        except TimeoutException as e:
            error_code = 'E301'
            self.output_log_error(constants.ERROR_MSG[error_code])
            self.logout_ATBB()

            return error_code
        except Exception as e:
            error_code = 'E999'
            self.output_log_error(constants.ERROR_MSG[error_code])
            self.logout_ATBB()

            return error_code


        try:
            self.output_log_info('物出し処理開始')
            # 検索結果のページネーション取得
            result_page = self.wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, 'body > table > tbody > tr:nth-child(3) > td > table > tbody > tr:nth-child(1) > td:nth-child(3) > form:nth-child(33) > table:nth-child(67) > tbody > tr > td:nth-child(1) > span:nth-child(1)')))
            page_all = int(result_page.text)

            # ページネーション分物件を見ていく
            for i in range(page_all):
                # 物件のリストを取得
                results = self.wait.until(EC.visibility_of_all_elements_located((By.CSS_SELECTOR, 'body > table > tbody > tr:nth-child(3) > td > table > tbody > tr:nth-child(1) > td:nth-child(3) > form:nth-child(33) > div.bukkenKensakuKekkaWrapper > table')))
                child = 10 # テーブルの子要素のセレクタ
                for j in range(len(results)):
                    # 画像点数を確認
                    image_element = self.wait.until(EC.visibility_of_all_elements_located((By.CSS_SELECTOR, 'body > table > tbody > tr:nth-child(3) > td > table > tbody > tr:nth-child(1) > td:nth-child(3) > form:nth-child(33) > div.bukkenKensakuKekkaWrapper > table:nth-child(' + str(child) + ') > tbody > tr:nth-child(2) > td:nth-child(1) > div > div.list-data02-c')))
                    try:
                        image_count = int(re.sub(r"\D", "", image_element[0].text))
                    except ValueError:
                        continue
                    except Exception as e:
                        self.output_log_error('画像点数の取得で予期せぬエラーが発生しました。')
                        continue
                    
                    # 画像点数が 8 以上なら詳細ボタンクリック
                    if image_count >= int(min_image_count):
                        detail_btn = self.wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, '#shosai_' + str(j))))
                        detail_btn.click()

                        # 詳細画面への遷移を待機
                        self.wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, 'body > table > tbody > tr:nth-child(3) > td > table > tbody > tr:nth-child(1) > td:nth-child(3) > form.word-b > table:nth-child(26) > tbody > tr > td:nth-child(1) > span')))

                        # 物出し処理起動
                        retry_count = 1
                        while(retry_count <= 3): # 3 回までリトライ
                            if not self.execute_copy():
                                self.output_log_info(f'リトライします。{retry_count}回目'.format(retry_count=retry_count))
                                retry_count += 1
                                continue
                            else:
                                break                            

                    # 画面遷移すると要素が一度消えるため、再取得する
                    results = self.wait.until(EC.visibility_of_all_elements_located((By.CSS_SELECTOR, 'body > table > tbody > tr:nth-child(3) > td > table > tbody > tr:nth-child(1) > td:nth-child(3) > form:nth-child(33) > div.bukkenKensakuKekkaWrapper > table')))
                    child += 9

                if i < page_all - 1:
                    # 次のページへ遷移
                    next_link = self.wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, 'body > table > tbody > tr:nth-child(3) > td > table > tbody > tr:nth-child(1) > td:nth-child(3) > form:nth-child(33) > table:nth-child(67) > tbody > tr > td:nth-child(2) > ul > li:nth-child(3) > a')))
                    next_link.click()
                else: # 最終ページの場合、終了する
                    self.output_log_info('物出し完了')
                    break
        except TimeoutException as e:
            error_code = 'E302'
            self.output_log_error(constants.ERROR_MSG[error_code])

            return error_code
        except Exception as e:
            error_code = 'E999'
            self.output_log_error(constants.ERROR_MSG[error_code])

            return error_code

        finally:
            self.logout_ATBB()
            pass

        return 'SUCCESS'


    def output_log_info(self, text):
        self.__window['logs'].print(text, text_color='green')
        self.__window.Refresh()
        self.__logger.info(text)


    def output_log_error(self, text):
        self.__window['logs'].print(text, text_color='red')
        self.__window.Refresh()
        self.__logger.exception(text)


    def logout_ATBB(self):
        self.output_log_info('ATBB を終了します。')
        self.logout_wait = WebDriverWait(self.driver, 5)
        try:
            return_btn = self.logout_wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, 'body > table > tbody > tr:nth-child(2) > td > div:nth-child(13) > form > input')))
            return_btn.click()

            # アラートを処理
            alert = self.wait.until(EC.alert_is_present())
            alert.accept()
        except TimeoutException:
            self.__logger.info('ATBB 二重ログインなし')

        logout_btn = self.wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, 'body > table > tbody > tr:nth-child(1) > td > table:nth-child(6) > tbody > tr:nth-child(1) > td:nth-child(3) > a > div')))
        logout_btn.click()

        self.output_log_info('ATBB を終了しました。')

        self.driver.quit()

    
    def execute_copy(self):
        # 物件詳細の URL 取得
        cur_url = self.driver.current_url
        # コンテキストメニューから物出しロボを起動
        webdriver.ActionChains(self.driver).context_click().perform()

        for i in range(8): # コンテキストメニューから物出しロボを選択
            pyautogui.press('down')
        pyautogui.press('right')
        pyautogui.press('enter')

        # URL が変わっていたらブラウザバック
        if cur_url != self.driver.current_url:
            self.output_log_info('物件詳細から画面が遷移しました。')
            self.driver.back()
            return False

        # 物出し開始
        try:
            self.wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '#input-start-notice > span.start-text')))
        except Exception as e:
            # 別ウィンドウが開いていたら閉じるために 3 秒待って Esc キー押下
            time.sleep(3)
            pyautogui.press('esc')
            self.output_log_error('物出し処理の起動失敗')
            return False
        
        # 物出し処理完了チェック
        try:
            self.long_wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '#input-finish-notice')))
        except Exception as e:
            # 別ウィンドウが開いていたら閉じるために 3 秒待って Esc キー押下
            time.sleep(3)
            pyautogui.press('esc')
            self.output_log_error('物出し処理を完了できませんでした。')
            return False

        # 物出し処理が終わったらブラウザバック
        self.driver.back()
        return True