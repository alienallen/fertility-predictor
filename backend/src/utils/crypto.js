/**
 * AES-256 加密工具
 * 用于用户数据的加密存储
 */

const crypto = require('crypto');

// 密钥生成（开发环境使用固定密钥，生产环境应从环境变量读取）
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'fertility-app-dev-key-32bytes!';
const IV_LENGTH = 16;
const ALGORITHM = 'aes-256-cbc';

/**
 * 加密数据
 * @param {string} text - 要加密的明文
 * @returns {string} - 加密后的密文（base64格式）
 */
function encrypt(text) {
  if (!text) return null;
  
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32)), iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  // 返回 IV + 密文（IV 用于解密）
  return iv.toString('hex') + ':' + encrypted;
}

/**
 * 解密数据
 * @param {string} encryptedText - 加密的密文
 * @returns {string} - 解密后的明文
 */
function decrypt(encryptedText) {
  if (!encryptedText) return null;
  
  try {
    const parts = encryptedText.split(':');
    if (parts.length !== 2) {
      throw new Error('Invalid encrypted text format');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32)), iv);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error.message);
    return null;
  }
}

/**
 * 生成随机密钥
 * @param {number} length - 密钥长度
 * @returns {string} - 随机密钥
 */
function generateKey(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * 哈希密码
 * @param {string} password - 明文密码
 * @returns {string} - 哈希后的密码
 */
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

/**
 * 验证密码
 * @param {string} password - 明文密码
 * @param {string} hashedPassword - 哈希后的密码
 * @returns {boolean} - 是否匹配
 */
function verifyPassword(password, hashedPassword) {
  return hashPassword(password) === hashedPassword;
}

module.exports = {
  encrypt,
  decrypt,
  generateKey,
  hashPassword,
  verifyPassword,
};
