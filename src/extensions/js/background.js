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
    switch (item.menuItemId) {
       case 'import':
         localStorage.setItem('image_store_mode', '0');
         butsudashiCheck();
         break;
       case 'importImage':
         localStorage.setItem('image_store_mode', '1');
         butsudashiCheck();
         break;
       default:
         break;
    }
});

/**
 * 拡張機能アイコンクリック時
 */
chrome.browserAction.onClicked.addListener(function(item) {
    localStorage.setItem('image_store_mode', '0');
    butsudashiCheck();
});

/**
 * 画像URLをバイナリに変換
 */
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
	sendResponse();
    return true;
});