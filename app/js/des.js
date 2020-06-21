import CryptoJS from 'crypto-js'

/**
 * 前端不允许加解密，已废弃
 */
/**
 * @param message
 * @param key
 * @returns {string}
 */
// DES加密
export const encryptDes = (message, key) => {
  const keyHex = CryptoJS.enc.Utf8.parse(key);
  const encrypted = CryptoJS.DES.encrypt(message, keyHex, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  });
  return encrypted.toString();
}
/**
 * @param ciphertext
 * @param key
 * @returns {string}
 */
// DES解密
export const decryptDes = (ciphertext, key) => {
  const keyHex = CryptoJS.enc.Utf8.parse(key);
  // direct decrypt ciphertext
  const decrypted = CryptoJS.DES.decrypt({
    ciphertext: CryptoJS.enc.Base64.parse(ciphertext)
  }, keyHex, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  });
  return decrypted.toString(CryptoJS.enc.Utf8);
}
