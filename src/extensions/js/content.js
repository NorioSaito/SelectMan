/**
 * cssファイルを反映
 * @type {HTMLLinkElement}
 */
let style = document.createElement('link');
style.rel = 'stylesheet';
style.type = 'text/css';
style.href = chrome.extension.getURL('css/content.css');
(document.head || document.documentElement).appendChild(style);

/**
 * 物出し処理
 */
chrome.runtime.onMessage.addListener(function(message, sender, callback) {
    if (Array.isArray(message) === false) {
        let script = document.createElement('script');
        script.id = 'butsudashi-exec';
        script.src = 'https://cloud.ielove.jp/js/butsudashibeta/ver05/butsudashi-beta-exec.js?' + message;
        document.getElementsByTagName('head')[0].appendChild(script);
    }
    callback();
    return true;
});