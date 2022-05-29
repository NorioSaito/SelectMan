/**
 * APIパス
 * @type {string}
 */
var API_NAME = 'butsudashi_';
var DOMAIN_URL = 'https://cloud.ielove.jp';
var PATH = DOMAIN_URL + '/api/butsudashi/';

exec();
function exec() {
    (async () => {
        var head    = document.getElementsByTagName('head');
        var VERSION = '0.6';
        /**
         * CSSの読み込み
         * @type {HTMLLinkElement}
         */
        var link    = document.createElement('link');
        link.setAttribute('rel', 'stylesheet');
        link.setAttribute('type', 'text/css');
        link.setAttribute('href', DOMAIN_URL + '/css/butsudashi-robo.css');
        head[0].appendChild(link);
        let loginInfo = await chrome.storage.local.get([API_NAME + 'id', API_NAME + 'password', 'at-api', 'crypto_version']);
        if (loginInfo === '') {
            alert('ログイン情報を取得できなかったため、物出しができませんでした。');
            return false;
        }
        let ryutsuType = setRyutsuSite();
        if (ryutsuType === '0') {
            alert('物出し可能な物件ページではなかったため、物出しができませんでした。');
            return false;
        }
        if (ryutsuType === '1') {
            let priceSibling = document.getElementById('price_img_0');
            if (priceSibling !== null) {
                priceSibling  = priceSibling.src;
                let rentMoney = priceSibling.substr(priceSibling.indexOf('&d=') + 3);
                let check     = document.querySelector('[data-bukkenno]');
                if (check !== null) {
                    check.setAttribute('data-bukkenno', rentMoney);
                    let bknIdBtn = document.getElementById('bkn_no_copy_btn_0');
                    if (bknIdBtn !== null) {
                        bknIdBtn.click();
                    }
                }
            }
        }

        let formData = new FormData();
        formData.append('json', JSON.stringify(loginInfo));
        formData.append('api', loginInfo['at-api']);
        formData.append('targetSystemCode', ryutsuType);
        formData.append('version', VERSION);
        // ログイン情報の確認API
        postData(PATH + 'v0/', formData)
            .then(result => insert(loginInfo, result, ryutsuType))
            .catch(error => console.log(error));
    })();
}

/**
 * それぞれの媒体の物件情報を登録
 * @param {Object} params
 * @param {Object} data
 * @param {string} ryutsuType
 */
function insert(params, data, ryutsuType) {
    if (data.result !== 'success') {
        if (typeof data.message === 'undefined') {
            alert("ログインに失敗しました。\nログインIDとパスワードが正しく入力されているかお確かめの上、再度物出しを行ってください。");
            return;
        }
        alert(data.message);
        return;
    }
    (async () => {
        let localStorageUrl = await chrome.storage.local.get('use_landing_page_url');
        params.use_landing_page_url = localStorageUrl.use_landing_page_url;
        let imageStoreMode = await chrome.storage.local.get(['image_store_mode']);
        params.image_store_mode = imageStoreMode.image_store_mode;
        if (ryutsuType === '2') {
            registerReaProBknData(params, data, ryutsuType);
        } else {
            // iFrameかどうか判定
            let setContentsPromise = setAtbbIframe();
            setContentsPromise
                .then((result) => registerAtBknData(params, data, ryutsuType, result))
                .catch();
        }
    })();
}

/**
 * 物出し開始通知
 */
function inputStartAlert() {
    let div = document.createElement('div');
    div.id = 'input-start-notice';
    let firstSpan = document.createElement('span');
    firstSpan.className = 'start-text';
    firstSpan.textContent = '物出し処理中です。';
    div.appendChild(firstSpan);
    let secondSpan = document.createElement('span');
    secondSpan.className = 'startTag';
    secondSpan.innerHTML = '&#215;';
    div.appendChild(secondSpan);
    div.style.display = 'none';
    document.body.appendChild(div);
    displayAlert(div);
}

/**
 * 画像ダウンロード開始アラート
 */
function storeImageStartAlert() {
    let div = document.createElement('div');
    div.id = 'input-start-notice';
    let firstSpan = document.createElement('span');
    firstSpan.className = 'start-text';
    firstSpan.textContent = '画像をダウンロードしています。';
    div.appendChild(firstSpan);
    let secondSpan = document.createElement('span');
    secondSpan.className = 'startTag';
    secondSpan.innerHTML = '&#215;';
    div.appendChild(secondSpan);
    div.style.display = 'none';
    document.body.appendChild(div);
    displayAlert(div);
    setTimeout(function() {
        removeAlert(div);
    }, 3000);
}

/**
 * 画像が無かった時のアラート
 */
function noneImageAlert() {
    let div = document.createElement('div');
    div.id = 'input-start-notice';
    let firstSpan = document.createElement('span');
    firstSpan.className = 'start-text';
    firstSpan.textContent = '画像がありません。';
    div.appendChild(firstSpan);
    let secondSpan = document.createElement('span');
    secondSpan.className = 'startTag';
    secondSpan.innerHTML = '&#215;';
    div.appendChild(secondSpan);
    div.style.display = 'none';
    document.body.appendChild(div);
    displayAlert(div);
    setTimeout(function() {
        removeAlert(div);
    }, 3000);
}

/**
 * 画像ダウンロード完了通知を表示
 */
function storeImageFinishAlert() {
    let div = document.createElement('div');
    div.id = 'image-store-finish';
    let firstSpan = document.createElement('span');
    firstSpan.className = 'circle-o-two-line';
    div.appendChild(firstSpan);
    let secondSpan = document.createElement('span');
    secondSpan.className = 'image-finish-text';
    secondSpan.textContent = "画像のダウンロードが";
    div.appendChild(secondSpan);
    let br = document.createElement('br');
    div.appendChild(br);
    let thirdSpan = document.createElement('span');
    thirdSpan.className = 'image-finish-text2';
    thirdSpan.textContent = "完了しました";
    div.appendChild(thirdSpan);
    let forthSpan = document.createElement('span');
    forthSpan.className = 'finishTag';
    forthSpan.innerHTML = '&#215;';
    div.appendChild(forthSpan);
    div.style.display = 'none';
    document.body.appendChild(div);
    displayAlert(div);
    // アラートを手動で閉じなくても閉じるようにする
    setTimeout(function() {
        removeAlert(div);
    }, 3000);
}

/**
 * アラートを表示
 * @param {Object} div
 */
function displayAlert(div) {
    let begin = new Date() - 0;
    let id = setInterval(function() {
        let current = new Date() - begin;
        let time = 500;
        if (current > time){
            clearInterval(id);
            current = time;
        }
        div.style.display = 'block';
        div.style.opacity = current / time;
    }, 5);
}

/**
 * 物出し開始通知を削除
 * @param {Object} div
 */
function removeAlert(div) {
    let begin = new Date() - 0;
    let time = 500;
    let id = setInterval(function() {
        let current = new Date() - begin;
        if (current > time) {
            clearInterval(id);
            current = time;
            div.style.display = 'none';
            div.remove();
        }
        div.style.opacity = 1 - (current / time) ;
    }, 5);
}

/**
 * 物出し完了通知を表示
 */
function inputFinishAlert() {
    let beforeDiv = document.getElementById('input-start-notice');
    beforeDiv.remove();
    let div = document.createElement('div');
    div.id = 'input-finish-notice';
    let firstSpan = document.createElement('span');
    firstSpan.className = 'circle-o';
    div.appendChild(firstSpan);
    let secondSpan = document.createElement('span');
    secondSpan.className = 'finish-text';
    secondSpan.textContent = '物出しが完了しました。';
    div.appendChild(secondSpan);
    let thirdSpan = document.createElement('span');
    thirdSpan.className = 'finishTag';
    thirdSpan.innerHTML = '&#215;';
    div.appendChild(thirdSpan);
    div.style.display = 'none';
    document.body.appendChild(div);
    displayAlert(div);
    // アラートを手動で閉じなくても閉じるようにする
    setTimeout(function() {
        removeAlert(div);
    }, 5000);
}

/**
 * 「物件ページURLをコピー」のアラートを表示
 */
function clipboardCopiedAlert() {
    let div = document.createElement('div');
    div.id = 'input-clipboard-copy';
    let firstSpan = document.createElement('span');
    firstSpan.className = 'clipboard-copy-text';
    firstSpan.textContent = '物件ページURLをコピーしました。';
    div.appendChild(firstSpan);
    let secondSpan = document.createElement('span');
    secondSpan.className = 'clipboardTag';
    secondSpan.innerHTML = '&#215;';
    div.appendChild(secondSpan);
    div.style.display = 'none';
    document.body.appendChild(div);
    displayAlert(div);
    // アラートを手動で閉じなくても閉じるようにする
    setTimeout(function() {
        removeAlert(div);
    }, 5000);
}

/**
 * 業者間流通
 * @returns {string}
 */
function setRyutsuSite() {
    let url = document.location.href;
    if (url.indexOf('https://atbb.athome.co.jp') === 0
        || url.indexOf('http://atbb.athome.co.jp') === 0
    ) {
        // ATBB
        return '1';
    } else if (url.indexOf('https://www.realnetpro.com') === 0) {
        // リアプロ
        return '2';
    } else {
        // 該当サイト無し
        return '0';
    }
}

/**
 * 物件一覧かどうか
 * @param {boolean} isIframe
 * @param {boolean} isList
 * @returns {boolean}
 */
function isAtBknListPage(isIframe, isList) {
    if (isIframe === true) {
        // iframeが表示されている場合、一覧ページとはみなさない
        return false;
    } else if (isList === true) {
        // 一覧ページの場合
        return true;
    }
    return false;
}

/**
 * At物出し
 * @param {Object} params
 * @param {Object} data
 * @param {string} ryutsuType
 * @param {Object} contentResult
 * @returns {boolean}
 */
function registerAtBknData(params, data, ryutsuType, contentResult) {
    // 物件情報入力処理
    // データをオブジェクトに整形
    let commonHead = '';
    let commonDataShopCategoryGroup = '';
    commonHead = contentResult.contents.getElementsByClassName('common-head');
    commonDataShopCategoryGroup = contentResult.contents.getElementsByClassName('common-data shopCategoryGroup');
    if (commonHead.length === 0) {
        alert('物件情報を取得できませんでした。');
        return true;
    }
    let info = {};
    let shopCategoryInfo = {};
    let isList = false;
    commonHead = Array.from(commonHead);
    commonDataShopCategoryGroup = Array.from(commonDataShopCategoryGroup);
    commonHead.forEach(function(item) {
        let headName = item.textContent.replace(/\r?\n?\s+/g, '');
        if (headName.indexOf('賃料帯') !== -1) {
            isList = true;
        }
        let infoTd = item.nextElementSibling;
        if (infoTd !== null) {
            if (headName === '賃料' || headName === '価格') {
                Array.prototype.forEach.call(infoTd.getElementsByTagName('img'), function(element) {
                    info['賃料URL'] = element.getAttribute('src');
                });
            } else if (headName === '物件種目' && item.parentNode !== null) {
                let shumokuList = Array.from(item.parentNode.children);
                let shumokuListLength = shumokuList.length;
                for (let shumokuNum = 0; shumokuNum < shumokuListLength; shumokuNum++) {
                    let shumokuElement = shumokuList[shumokuNum];
                    if (typeof shumokuElement === 'undefined') {
                        continue;
                    }
                    let hasClass = shumokuElement.classList.contains('display_none');
                    if (hasClass === false &&
                        shumokuElement.textContent !== '物件種目' &&
                        shumokuElement.textContent !== '物件番号' &&
                        shumokuElement.getAttribute('data-bukkenno') === null
                    ) {
                        info[headName] = shumokuElement.textContent;
                        break;
                    }
                }
            } else {
                info[headName] = infoTd.textContent.replace(/\r?\n+/g, '');
            }
        }
    });
    let pasteDiv = contentResult.contents.getElementById('bkn_no_copy_input');
    if (pasteDiv !== null && pasteDiv.value !== '' && pasteDiv.value.endsWith('万円')) {
        info['賃料'] = pasteDiv.value;
        info['価格'] = pasteDiv.value;
    } else if (contentResult.contents.querySelector("input[type='button'][value='データプロ']") !== null) {
        let kakaku = contentResult.contents.querySelector("input[type='button'][value='データプロ']").getAttribute('onclick').match(/kakaku(.*)tohoJikan/);
        if (kakaku !== null) {
            kakaku = kakaku[1].replace(/[^0-9]/g, '');
            info['賃料'] = Number(kakaku) / 10000;
            info['価格'] = Number(kakaku) / 10000;
        }
    }
    commonDataShopCategoryGroup.forEach(function(item) {
        let ShopCategoryGroupName = item.textContent.replace(/\r?\n?\s+/g, '');
        let infoTd = item.nextElementSibling;
        if (infoTd !== null) {
            shopCategoryInfo[ShopCategoryGroupName] = infoTd.textContent.replace(/\r?\n+/g, '');
        }
    });

    let imgList = [];
    let imgCommentList = [];
    let imgQuery = '';
    // 物件詳細画像を先頭から取得
    const imgName = 'shosaiGazoIcon_';
    for (let i = 0; i <= 23; i++) {
        let name = imgName + i;
        imgQuery = contentResult.contents.querySelector('img[name=' + name + ']');
        if (imgQuery === null) {
            break;
        }
        let src = imgQuery.getAttribute('src');
        if ((typeof src !== 'undefined') && (src.indexOf('http') === 0)) {
            let tr = imgQuery.closest('.img-reg').parentNode;
            let imgComment = tr.nextElementSibling.getElementsByClassName('common-data')[0];
            imgCommentList[i] = imgComment.textContent.replace(',', '');
            imgList[i] = src;
        }
    }

    if (isAtBknListPage(contentResult.isIframe, isList) === true) {
        alert('物件一覧ページのため、物出しができませんでした。');
        return true;
    }
    info = {...info, ...params, ...data, ...shopCategoryInfo};
    let formData = new FormData();

    formData.append('info', JSON.stringify(info));
    formData.append('ryutsuType', ryutsuType);
    formData.append('imgList', JSON.stringify(imgList));
    formData.append('imgCommentList', JSON.stringify(imgCommentList));
    if (info['image_store_mode'] !== '0') {
        if (imgList.length !== 0) {
            storeImageStartAlert();
            postData(PATH + 'imagestore/', formData)
                .then(function(re) {
                    storeImageFinishAlert();
                    window.open(DOMAIN_URL + '/api/butsudashi/downloadzip/?bknName=' + re.bknName + '&ieFileName=' + re.ieFileName + '&gid=' + info['groupId'], '_self');
                });
        } else {
            noneImageAlert();
        }
        return true;
    }
    inputStartAlert();
    // 物件情報取得API
    postData(PATH + 'insertbknandimage/', formData)
        .then(bknResult => storeAtImg(bknResult, info, contentResult.contents))
        .catch(function(error) {
            console.log(error);
        });
    return true;
}

/**
 * ATBBのiFrame判定
 * @returns {Promise<unknown>}
 */
function setAtbbIframe() {
    return new Promise((resolve) => {
        let result = {};
        let iframe = document.getElementsByClassName('cboxIframe')[0];
        if (typeof iframe !== 'undefined') {
            result = {
                contents: iframe.contentDocument,
                isIframe: true
            };
        } else {
            result = {
                contents: document,
                isIframe: true
            };
        }
        resolve(result);
    });
}

/**
 * ATBB画像取得
 * @param {Object} result
 * @param {Object} info
 * @param {Object} iframeContents
 */
function storeAtImg(result, info, iframeContents) {
    if (result.code === '11' && result.message !== '') {
        let div = document.getElementById('input-start-notice');
        removeAlert(div);
        alert(result.message);
        return true;
    }
    // 物件ページURL生成
    if (info['use_landing_page_url'] !== '0') {
        generateLandingPageUrl(info, result);
    }
    inputFinishAlert();
    if (info['use_landing_page_url'] !== '0') {
        clipboardCopiedAlert();
    }
    return true;
}

/**
 * RPro物出し
 * @param {Object} params
 * @param {Object} data
 * @param {string} ryutsuType
 * @returns {boolean}
 */
function registerReaProBknData(params, data, ryutsuType) {
    let bknDataList = {};
    /**
     * XPathから要素を取得
     * @param {string} expression
     * @param {node} parentElement
     * @returns {array}
     */
    document.getElementsByXPath = function(expression, parentElement) {
        let result = []
        let element = document.evaluate(expression, parentElement || document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null)
        for (let i = 0, l = element.snapshotLength; i < l; i++) {
            result.push(element.snapshotItem(i));
        }
        return result;
    }

    if (document.location.href.indexOf('parking_detail.php') !== -1) {
        let parkingType = document.getElementsByXPath('//*[@id="basic"]/table/tbody/tr[1]/td[2]/text()')[0];
        if (typeof parkingType !== 'undefined') {
            bknDataList['駐車場タイプ'] = parkingType.nodeValue;
        }
        let parkingName = document.getElementsByXPath('//*[@id="basic"]/table/tbody/tr[2]/td[2]/text()')[0];
        if (typeof parkingName !== 'undefined') {
            bknDataList['駐車場名'] = parkingName.nodeValue;
        }
        let parkingNo = document.getElementsByXPath('//*[@id="basic"]/table/tbody/tr[3]/td[2]/text()')[0];
        if (typeof parkingNo !== 'undefined') {
            bknDataList['駐車番号'] = parkingNo.nodeValue;
        }
        let parkingRent = document.getElementsByXPath('//*[@id="basic"]/table/tbody/tr[5]/td[2]/text()')[0];
        if (typeof parkingRent !== 'undefined') {
            bknDataList['賃料'] = parkingRent.nodeValue;
        }
        let parkingAddress = document.getElementsByXPath('//*[@id="basic"]/table/tbody/tr[4]/td[2]/text()')[0];
        if (typeof parkingAddress !== 'undefined') {
            bknDataList['所在地'] = parkingAddress.nodeValue;
        }
        let parkingOtherCost = document.getElementsByXPath('//*[@id="basic"]/table/tbody/tr[6]/td[2]')[0];
        if (typeof parkingOtherCost !== 'undefined') {
            bknDataList['その他費用（駐車場）'] = parkingOtherCost.innerText;
        }
        let parkingSize = document.getElementsByXPath('//*[@id="basic"]/table/tbody/tr[7]/td[2]/text()')[0];
        if (typeof parkingSize !== 'undefined') {
            bknDataList['駐車場サイズ'] = parkingSize.nodeValue;
        }
        let parkingWeight = document.getElementsByXPath('//*[@id="basic"]/table/tbody/tr[8]/td[2]/text()')[0];
        if (typeof parkingWeight !== 'undefined') {
            bknDataList['重量制限'] = parkingWeight.nodeValue;
        }
        let parkingStatus = document.getElementsByXPath('//*[@id="basic"]/table/tbody/tr[9]/td[2]/span')[0];
        if (typeof parkingStatus !== 'undefined') {
            bknDataList['状態（駐車場）'] = parkingStatus.innerText;
        }
        let parkingPeriod = document.getElementsByXPath('//*[@id="basic"]/table/tbody/tr[10]/td[2]/text()')[0];
        if (typeof parkingPeriod !== 'undefined') {
            bknDataList['駐車可能時期'] = parkingPeriod.nodeValue;
        }
        let parkingOption = document.getElementsByXPath('//*[@id="basic"]/table/tbody/tr[11]/td[2]/text()')[0];
        if (typeof parkingOption !== 'undefined') {
            bknDataList['設備（駐車場）'] = parkingOption.nodeValue;
        }
        let parkingRemarks1 = document.getElementsByXPath('//*[@id="basic"]/table/tbody/tr[12]/td[2]/div[1]/text()')[0];
        if (typeof parkingRemarks1 !== 'undefined') {
            bknDataList['備考１（駐車場）'] = parkingRemarks1.nodeValue;
        }
        let parkingRemarks2 = document.getElementsByXPath('//*[@id="basic"]/table/tbody/tr[12]/td[2]/div[2]/text()')[0];
        if (typeof parkingRemarks2 !== 'undefined') {
            bknDataList['備考２（駐車場）'] = parkingRemarks2.nodeValue;
        }
        let motozukeCompanyName = document.getElementsByXPath('//*[@id="estate"]/div[2]/table/tbody/tr[1]/td/span')[0];
        if (typeof motozukeCompanyName !== 'undefined') {
            bknDataList['motozukeCompanyName'] = motozukeCompanyName.innerText;
        }
        let kyakuzukeMessage = document.getElementsByXPath('//*[@id="estate"]/div[2]/div[1]')[0];
        if (typeof kyakuzukeMessage !== 'undefined') {
            bknDataList['客付会社向けメッセージ（駐車場）'] = kyakuzukeMessage.innerText;
        }
        let kyakuzukeKoukokuInfo = document.getElementsByXPath('//*[@id="estate"]/div[2]')[0];
        if (typeof kyakuzukeKoukokuInfo !== 'undefined') {
            bknDataList['客付会社向け広告掲載（駐車場）'] = kyakuzukeKoukokuInfo.innerText;
        }
        let vacancyMotozukePhoneNum = document.getElementsByXPath('//*[@id="estate"]/div[2]/table/tbody/tr[2]/td/text()[2]')[0];
        if (typeof vacancyMotozukePhoneNum !== 'undefined') {
            bknDataList['vacancyMotozukePhoneNum'] = vacancyMotozukePhoneNum.nodeValue;
        }
        let motozukeInfo = document.getElementsByXPath('//*[@id="estate"]/div[2]/table/tbody/tr[2]/td')[0];
        if (typeof motozukeInfo !== 'undefined') {
            bknDataList['motozukeInfo'] = motozukeInfo.innerText;
        }
        let roomId = document.location.href;
        if (typeof roomId !== 'undefined') {
            bknDataList['roomId'] = roomId.match(/id=[0-9]{5,7}/)[0].replace('id=','');
        }
    } else {
        let type10 = document.getElementsByClassName('type10')[0];
        let type11 = document.getElementsByClassName('type11')[0];
        if (typeof type10 !== 'undefined') {
            let tatemonoCode = type10.textContent;
            if (tatemonoCode === '') {
                tatemonoCode = '普通借家';
            }
            bknDataList.tatemonochintaishakuCode = tatemonoCode;
        } else if (typeof type11 !== 'undefined') {
            let tatemonoCode = type11.textContent;
            if (tatemonoCode === '普通借家') {
                bknDataList.tatemonochintaishakuCode = tatemonoCode;
            }
        }
        let basicTable = document.getElementsByClassName('basic_table')[0];
        let basicTrs = Array.from(basicTable.querySelectorAll('tr'));
        basicTrs.forEach(function(item) {
            let firstTd = item.querySelector('td:first-child');
            let title = '';
            if (firstTd !== null) {
                title = firstTd.textContent;
            }
            title = title.trim();
            let secondTd = item.querySelector('td:nth-child(2)');
            if (secondTd !== null) {
                bknDataList[title] = secondTd.textContent;
            }
        });
        let eqTable = document.getElementsByClassName('eq_table')[0];
        let eqTrs = Array.from(eqTable.querySelectorAll('tr'));
        eqTrs.forEach(function(item) {
            let firstTd = item.querySelector('td:first-child');
            let title = '';
            if (firstTd !== null) {
                title = firstTd.textContent;
            }
            title = title.trim();
            let secondTd = item.querySelector('td:nth-child(2)');
            if (typeof secondTd !== 'undefined') {
                bknDataList[title] = secondTd.textContent;
            }
        });
        let roomId = document.getElementById('room_id');
        if (roomId !== null) {
            bknDataList.roomId = roomId.value;
        }
        let endUser = document.querySelector('.end_user:nth-child(2)');
        if (endUser !== null) {
            bknDataList.endUserText = endUser.textContent;
        }
        let roomCost = document.getElementById('room_cost');
        let tyukaiInfo = roomCost.querySelector('.tyukai_info:not(.renovation_box)');
        if (tyukaiInfo.length === 0) {
            tyukaiInfo = document.querySelector('#room_cost:not(.renovation_box)');
        }
        let remarks1 = tyukaiInfo.querySelector('div:nth-child(1)');
        let remarks1Text = '';
        if (remarks1 !== null) {
            remarks1Text = remarks1.textContent;
        }
        let reformText = '';
        let renovationText = '';
        if (remarks1Text.match(/リフォーム/) || remarks1Text.match(/リノベーション/)) {
            if (remarks1Text.match(/リフォーム/)) {
                reformText = remarks1Text;
            } else if (remarks1Text.match(/リノベーション/)) {
                renovationText = remarks1Text;
            }
        }
        bknDataList.reformText = reformText;
        bknDataList.renovationText = renovationText;
        let remarks2Text = tyukaiInfo.querySelector('div:nth-child(2)').textContent;
        let remarks3Text = '';
        let thirdDivChild = tyukaiInfo.querySelector('div:nth-child(3)');
        if (thirdDivChild.classList.contains('eq_m') === false) {
            remarks3Text = thirdDivChild.textContent;
        }
        bknDataList.remarks1 = remarks1Text + ' ' + remarks2Text + ' ' + remarks3Text;
        let costTitle = '';
        let divs = tyukaiInfo.querySelectorAll('div');
        divs = Array.from(divs);
        divs.forEach(function(item) {
            if (item.classList.contains('eq_m') === true) {
                costTitle = item.textContent.trim();
                if (costTitle.indexOf('広告掲載') !== -1) {
                    // テーブル構造を除くテキストを取得
                    let availability = item.nextElementSibling.outerHTML;
                    let parser = new DOMParser();
                    availability = parser.parseFromString(availability, 'text/html');
                    availability.querySelector('.advertisement_table').innerHTML = '';
                    bknDataList.advertisementCheck = availability.querySelector('body').textContent;
                } else {
                    bknDataList[costTitle] = item.nextElementSibling.textContent.replace(/\r?\n?\s+/g, '').trim();
                }
            } else {
                let divs = item.querySelectorAll('div');
                divs = Array.from(divs);
                divs.forEach(function(item) {
                    if (item.classList.contains('eq_m') === true) {
                        costTitle = item.textContent.trim();
                    } else {
                        if (typeof bknDataList[costTitle] === 'undefined') {
                            bknDataList[costTitle] = item.textContent.replace(/\r?\n+/g, '');
                        } else {
                            bknDataList[costTitle] = bknDataList[costTitle] + '\n' + item.textContent.replace(/\r?\n+/g, '');
                        }
                    }
                });
            }
        });
        let advertisementTable = document.getElementsByClassName('advertisement_table')[0];
        advertisementTable = Array.from(advertisementTable.querySelectorAll('td.td_orange'));
        advertisementTable.forEach(function(item) {
            let advertisementTitle = item.textContent.trim();
            if (advertisementTitle.indexOf('仲介手数料') === -1) {
                bknDataList[advertisementTitle] = item.nextElementSibling.textContent.trim();
            }
        });
        let companyArea = document.getElementsByClassName('company_area')[0];
        bknDataList.vacancyMotozukePhoneNum = companyArea.querySelector('tr:nth-child(2)').textContent.trim();
        bknDataList.motozukeCompanyName = companyArea.querySelector('tr:nth-child(3)').getElementsByClassName('company_name')[0].textContent.trim();
        bknDataList.motozukeInfo = companyArea.querySelector('tr:nth-child(4)').textContent.trim();
    }
    // 画像取得
    let imgList = [];
    let imageList = document.getElementsByClassName('image_list')[0];
    imageList = Array.from(imageList.querySelectorAll('img'));
    imageList.forEach(function(item) {
        let imgSrc = item.getAttribute('src');
        if (imgSrc.indexOf('pict') === -1) {
            imgList.push(imgSrc);
        }
    });
    bknDataList = {...bknDataList, ...params, ...data};
    let formData = new FormData();
    formData.append('info', JSON.stringify(bknDataList));
    formData.append('ryutsuType', ryutsuType);
    formData.append('imgList', JSON.stringify(imgList));
    if (params['image_store_mode'] !== '0') {
        // 画像取得
        let storeImgList = [];
        let storeImageList = document.getElementsByClassName('image_list')[0];
        storeImageList = Array.from(storeImageList.querySelectorAll('img'));
        storeImageList.forEach(function(item) {
            let imgSrc = item.getAttribute('src');
            if (imgSrc.indexOf('pict') === -1) {
                storeImgList.push(imgSrc);
            }
        });
        formData.append('imgList', storeImgList);
        storeImageStartAlert();
        postData(PATH + 'imagestore/', formData)
            .then(function(re) {
                storeImageFinishAlert();
                window.open(DOMAIN_URL + '/api/butsudashi/downloadzip/?bknName=' + re.bknName + '&ieFileName=' + re.ieFileName, '_self');
            });
        return true;
    }
    inputStartAlert();
    // 物件情報取得API
    postData(PATH + 'insertbknandimage/', formData)
        .then(data => saveReaProImg(data, params))
        .catch(error => console.log(error));
    return true;
}

/**
 * RPro画像保存
 * @param {Object} bknResult
 * @param {Object} params
 * @returns {boolean}
 */
function saveReaProImg(bknResult, params) {
    // エラーチェック
    if (['1', '4', '5', '6'].indexOf(bknResult.result) !== -1) {
        alert(bknResult.message);
        return false;
    }
    // 物件ページURL生成
    if (params['use_landing_page_url'] !== '0') {
        generateLandingPageUrl(params, bknResult);
    }

    // 画像取得
    var imgList = [];
    var imageList = document.getElementsByClassName('image_list')[0];
    imageList = Array.from(imageList.querySelectorAll('img'));
    imageList.forEach(function(item) {
        let imgSrc = item.getAttribute('src');
        if (imgSrc.indexOf('pict') === -1) {
            imgList.push(imgSrc);
        }
    });
    if (imgList.length === 0) {
        inputFinishAlert();
        if (params['use_landing_page_url'] !== '0') {
            clipboardCopiedAlert();
        }
        return false;
    }
    sessionStorage.setItem('at-butsudashiImage', imgList.join(','));
    sessionStorage.setItem('at-butsudashiImage-cmt', '');
    // accountId
    sessionStorage.setItem('a-butsudashiId', bknResult.accountId);
    // rentId
    sessionStorage.setItem('r-butsudashiId', bknResult.id);
    sessionStorage.setItem('rentOrSale', bknResult.rentOrSale);
    setTimeout(inputFinishAlert, 4000);
    setTimeout(function() {
            if (params['use_landing_page_url'] !== '0') {
                setTimeout(clipboardCopiedAlert, 5000);
            }
        }, 1000
    );
    return true;
}

/**
 * 物件ページURL生成
 * @param {Object} info
 * @param {Object} data
 */
function generateLandingPageUrl(info, data) {
    let formData = new FormData();
    formData.append('loginId', JSON.stringify(info['butsudashi_id']));
    formData.append('password', info['butsudashi_password']);
    formData.append('crypto_version', info['crypto_version']);
    if (data.rentOrSale === 'sale') {
        formData.append('rentSaleType', 'sale');
        formData.append('saleId', data.id);
    } else {
        formData.append('rentSaleType', 'rent');
        formData.append('rentId', data.id);
    }

    postData(PATH + 'v4/', formData)
        .then(function(data) {
            navigator.clipboard.writeText(data.url).then(function() {
                console.log('物出しが完了しました。');
                }, function(err) {
                console.error('エラーにより物件URLがコピーできませんでした : ', err);
            });
        });
}

/**
 * APIの実行
 * @param {string} url
 * @param {Object} formData
 * @returns {Promise<any>}
 */
function postData(url, formData) {
    return fetch(url, {
        method: 'POST',
        body: formData
    })
        .then(response => response.json());z
}
