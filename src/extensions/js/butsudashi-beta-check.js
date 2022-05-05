/**
 * 物出しの実行
 */
function butsudashiCheck(tab) {
    const API_NAME = 'butsudashi_';
    // 取得するタブの条件
    let queryInfo = {
        active: true,
        windowId: chrome.windows.WINDOW_ID_CURRENT
    };
    chrome.tabs.query(queryInfo, function(result) {
        // 配列の先頭に現在タブの情報が入っている
        // ローカルストレージに保存したログイン情報を取得
        let id = chrome.storage.local.get(API_NAME + 'id');
        let password = chrome.storage.local.get(API_NAME + 'password');
        let cryptoVersion = chrome.storage.local.get('crypto_version');
        let atApi = chrome.storage.local.get('at-api');
        // サーバで復号化しない場合
        if (!cryptoVersion) {
            atApi = Crypto.decrypt(atApi);
            id = Crypto.decrypt(id);
            password = Crypto.decrypt(password);
        }
        if (id === null || password === null || atApi === null) {
            alert("いえらぶCLOUDのログイン情報が登録されていません。\nオプションからログイン情報を登録してください。");
            return false;
        }
        chrome.scripting.executeScript({
            target: {
                tabId: tab.id
            },
            files: ['/js/butsudashi-beta-exec.js'],
        });
        return true;
    });
}
