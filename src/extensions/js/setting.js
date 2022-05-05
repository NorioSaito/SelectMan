var DOMAIN_URL = 'https://cloud.ielove.jp';
$(function() {
    $.ajax({
        type : 'POST',
        url : DOMAIN_URL + '/api/setting/view/',
        dataType : 'html'
    }).then((...args) => {
        const [data, textStatus, jqXHR] = args;
        $('.row').append(data);
        const API_NAME = 'butsudashi_';
        const $loginButton = $('.login-register');
        let cryptoVersion;
        chrome.storage.local.get([API_NAME + 'id', API_NAME + 'password', 'at-api', 'crypto_version'], function(loginInfo) {
            cryptoVersion = loginInfo['crypto_version'];
            $.ajax({
                type: 'POST',
                url: DOMAIN_URL + '/api/setting/decrypto/',
                data: {
                    'butsudashi_id':  loginInfo[API_NAME + 'id'],
                    'butsudashi_password': loginInfo[API_NAME + 'password'],
                    'at-api': loginInfo['at-api']
                },
                dataType: 'json'
            }).then((...args) => {
                const [data, textStatus, jqXHR] = args;
                if (data['butsudashi_id']) {
                    $('#id').val(data['butsudashi_id']);
                }
                if (data['butsudashi_password']) {
                    $('#password').val(data['butsudashi_password']);
                }
                if (data['at-api']) {
                    $('#at-api').val(data['at-api']);
                }
            }).catch((...args) => {
                const [data, textStatus, jqXHR] = args;
            });
        });
        // 「物件ページURLを生成しない」を設定した
        chrome.storage.local.get('use_landing_page_url', function(result) {
            if (result['use_landing_page_url'] === '0') {
                switchLandingPageUrlBtn('landing-page-off');
            } else {
                switchLandingPageUrlBtn('landing-page-on');
            }
        });
        $('.landing-page-check').on('click', function() {
            switchLandingPageUrlBtn($(this).attr('for'));
        });
        // 登録処理
        $loginButton.click(() => register());
        $('[id="password-check"]').change(togglePasswordDisplay);
    });
});

/**
 * 登録処理
 * @returns {boolean}
 */
const register = () => {
    let id = $('#id').val();
    let message = [];
    if (id === '') {
        message.push('IDを入力してください。');
    }
    let password = $('#password').val();
    if (password === '') {
        message.push('パスワードを入力してください。');
    }
    let atApi = $('#at-api').val();
    if (atApi === '') {
        message.push('ライセンスキーを入力してください。');
    }
    if (message.length > 0) {
        alert(message.join("\n"));
        return false;
    }
    $.ajax({
        type : 'POST',
        url : DOMAIN_URL + '/api/setting/encrypto/',
        data: {
            'butsudashi_id': id,
            'butsudashi_password': password,
            'at-api': atApi
        },
        dataType : 'json'
    }).then((...args) => {
        const [data, textStatus, jqXHR] = args;
        try {
            chrome.storage.local.set({'butsudashi_id': data['butsudashi_id']});
            chrome.storage.local.set({'butsudashi_password': data['butsudashi_password']});
            chrome.storage.local.set({'at-api': data['at-api']});
            chrome.storage.local.set({'crypto_version': data['crypto_version']});

            let useLandingPageUrl = $('input[name="landing-page"]:checked').val();
            chrome.storage.local.set({'use_landing_page_url': useLandingPageUrl});
            alert("設定を保存しました。\n画面を更新してからアドオンをご利用ください。");
            location.reload();
        } catch (e) {
            alert('設定を保存できませんでした。');
        }
    }).catch((...args) => {
        const [data, textStatus, jqXHR] = args;
    });
    return false;
};

/**
 * パスワードの表示非表示
 */
let togglePasswordDisplay = function() {
    var isChecked = $(this).prop('checked');
    var passwordForm = $('#password');
    if (isChecked === true) {
        passwordForm.attr('type', 'text');
    } else {
        passwordForm.attr('type', 'password');
    }
};

/**
 * 物件ページURL生成するか否かのトグルボタン
 * @param forName
 */
let switchLandingPageUrlBtn = function(forName) {
    let $id = $('#' + forName);
    let targetId = (forName === 'landing-page-on') ? 'landing-page-off' : 'landing-page-on';
    if ($id.prop('checked') === false) {
        $('label[for="' + forName + '"]').addClass('switch-on');
        $id.prop('checked', true);
        $('#' + targetId).prop('checked', false);
        $('label[for="'+ targetId + '"]').removeClass('switch-on');
    }
};
