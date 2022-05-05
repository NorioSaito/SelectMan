try {
    importScripts('js/butsudashi-beta-check.js');
} catch (e) {
    console.log(e);
}
/**
 * 拡張機能がインストールされたときの処理
 */
chrome.runtime.onInstalled.addListener(function() {
    // メニューを生成
    const parent = chrome.contextMenus.create({
      id: 'parent',
      title: 'らくらく物出しロボ'
    });
    chrome.contextMenus.create({
      type: "normal",
      id: "import",
      title: "物出しする",
      parentId: 'parent',
    });
    chrome.contextMenus.create({
      type: "normal",
      id: "importImage",
      title: "物件画像をダウンロードする",
      parentId: 'parent',
    });
});

/**
 * メニューが選択されたときの処理
 * 選択されたアイテムはこちらの関数の引数に入ってくる(今回は item)
 * content.jsのchrome.runtime.onMessageが実行される
 */
chrome.contextMenus.onClicked.addListener(function(item) {
    (async () => {
        let tab = await getCurrentTab();
        switch (item.menuItemId) {
            case 'import':
                await chrome.storage.local.set({'image_store_mode': '0'});
                await butsudashiCheck(tab);
                break;
            case 'importImage':
                await chrome.storage.local.set({'image_store_mode': '1'});
                await butsudashiCheck(tab);
                break;
            default:
                break;
        }
    })();
});

/**
 * 拡張機能アイコンクリック時
 */
chrome.action.onClicked.addListener(function(tab) {
    (async () => {
        await chrome.storage.local.set({'image_store_mode': '0'});
        await butsudashiCheck(tab);
    })();
});

/**
 * 画像URLをバイナリに変換
 */
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
	sendResponse();
    return true;
});

async function getCurrentTab() {
    let queryOptions = { active: true, currentWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
}
