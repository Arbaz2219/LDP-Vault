import CryptoJS from 'crypto-js';

// Since Master Password is removed for SSO-only convenience, 
// we use a system-level key to automate encryption/decryption.
const getSystemKey = () => {
  return import.meta.env.VITE_SYSTEM_SECRET || 'ldp-vault-enterprise-fallback-key-2026';
};

export const encrypt = (text: string): string => {
  if (!text) return '';
  const key = getSystemKey();
  return CryptoJS.AES.encrypt(text, key).toString();
};

export const decrypt = (ciphertext: string): string => {
  if (!ciphertext) return '';
  try {
    const key = getSystemKey();
    const bytes = CryptoJS.AES.decrypt(ciphertext, key);
    const result = bytes.toString(CryptoJS.enc.Utf8);
    if (!result) throw new Error('Empty result');
    return result;
  } catch (err) {
    console.error('Decryption failed');
    return 'Decryption Error';
  }
};
