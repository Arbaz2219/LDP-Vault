import CryptoJS from 'crypto-js';

// This would ideally be derived from the master password using PBKDF2
// For the prototype, we use the master password directly as the key
export const encrypt = (text: string, key: string): string => {
  if (!text) return '';
  return CryptoJS.AES.encrypt(text, key).toString();
};

export const decrypt = (ciphertext: string, key: string): string => {
  if (!ciphertext) return '';
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, key);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (err) {
    console.error('Decryption failed');
    return 'Decryption Error';
  }
};
