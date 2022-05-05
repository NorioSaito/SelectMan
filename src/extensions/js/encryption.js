/**
 * ID、パスワードの暗号化
 */
const Crypto = (() => {
    // https://code.google.com/p/crypto-js/#The_Cipher_Output
    const option = {
        format: {
            stringify(cipherParams) {
                // create json object with ciphertext
                const jsonObj = {
                    ct: cipherParams.ciphertext.toString(CryptoJS.enc.Base64)
                };

                // optionally add iv and salt
                if (cipherParams.iv) {
                    jsonObj.iv = cipherParams.iv.toString();
                }
                if (cipherParams.salt) {
                    jsonObj.s = cipherParams.salt.toString();
                }

                // stringify json object
                return JSON.stringify(jsonObj);
            },
            parse(jsonStr) {
                // parse json string
                const jsonObj = JSON.parse(jsonStr);

                // extract ciphertext from json object, and create cipher params object
                const cipherParams = CryptoJS.lib.CipherParams.create({
                    ciphertext: CryptoJS.enc.Base64.parse(jsonObj.ct)
                });

                // optionally extract iv and salt
                if (jsonObj.iv) {
                    cipherParams.iv = CryptoJS.enc.Hex.parse(jsonObj.iv)
                }
                if (jsonObj.s) {
                    cipherParams.salt = CryptoJS.enc.Hex.parse(jsonObj.s)
                }

                return cipherParams;
            }
        }
    };

    const secret = () => {
        let s = localStorage.Secret;
        if (!s) {
            s = localStorage.Secret = CryptoJS.lib.WordArray.random(128/8).toString(CryptoJS.enc.Base64);
        }
        return s;
    };

    // public interface
    return {
        encrypt(plaintext) {
            return CryptoJS.AES.encrypt(plaintext, secret(), option).toString();
        },
        decrypt(encrypted) {
            alert(encrypted);
            return CryptoJS.AES.decrypt(encrypted, secret(), option).toString(CryptoJS.enc.Utf8);
        }
    };
})();