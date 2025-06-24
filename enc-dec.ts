import CryptoJS from 'crypto-js';
import 'react-native-get-random-values';

// Helper: Convert Uint8Array to WordArray
const uint8ArrayToWordArray = (u8Array: Uint8Array) => {
  const words = [];
  for (let i = 0; i < u8Array.length; i += 4) {
    words.push(
      (u8Array[i] << 24) |
      (u8Array[i + 1] << 16) |
      (u8Array[i + 2] << 8) |
      (u8Array[i + 3] || 0)
    );
  }
  return CryptoJS.lib.WordArray.create(words, u8Array.length);
};

const PASSPHRASE = "Y$8vT!rP@qM1zL#2F*eD^hR%uA3jX&bC";  // This should be securely stored at env and not hardcoded in production

export const encryptData = (plainText: string) => {
  const saltArray = new Uint8Array(16);
  crypto.getRandomValues(saltArray);
  const salt = uint8ArrayToWordArray(saltArray);

  const ivArray = new Uint8Array(16);
  crypto.getRandomValues(ivArray);
  const iv = uint8ArrayToWordArray(ivArray);

  const key = CryptoJS.PBKDF2(PASSPHRASE, salt, {
    keySize: 256 / 32,
    iterations: 1000,
  });

  const encrypted = CryptoJS.AES.encrypt(plainText, key, { iv }).toString();

  const result = JSON.stringify({
    ct: encrypted,
    iv: iv.toString(CryptoJS.enc.Hex),
    s: salt.toString(CryptoJS.enc.Hex),
  });

  return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(result));
};

export const decryptData = (cipherText: string) => {
  const jsonStr = CryptoJS.enc.Base64.parse(cipherText).toString(CryptoJS.enc.Utf8);
  const json = JSON.parse(jsonStr);

  const salt = CryptoJS.enc.Hex.parse(json.s);
  const iv = CryptoJS.enc.Hex.parse(json.iv);
  const key = CryptoJS.PBKDF2(PASSPHRASE, salt, {
    keySize: 256 / 32,
    iterations: 1000,
  });

  const decrypted = CryptoJS.AES.decrypt(json.ct, key, { iv });
  return decrypted.toString(CryptoJS.enc.Utf8);
};
