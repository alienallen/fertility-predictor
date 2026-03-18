/**
 * JSON 文件存储工具
 * 用于用户数据的本地文件存储
 */
const fs = require('fs');
const path = require('path');
const { encrypt, decrypt } = require('./crypto');

// 数据存储目录
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '../../data');
const USE_ENCRYPTION = process.env.NODE_ENV !== 'development';

// 确保数据目录存在
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

/**
 * 获取用户数据文件路径
 * @param {string} userId - 用户ID
 * @returns {string} - 文件路径
 */
function getUserDataPath(userId) {
  const ext = USE_ENCRYPTION ? '.enc' : '.json';
  return path.join(DATA_DIR, `${userId}${ext}`);
}

/**
 * 读取用户数据
 * @param {string} userId - 用户ID
 * @returns {Object} - 用户数据
 */
function readUserData(userId) {
  const filePath = getUserDataPath(userId);
  
  if (!fs.existsSync(filePath)) {
    return null;
  }
  
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    
    if (USE_ENCRYPTION) {
      const decrypted = decrypt(data);
      return decrypted ? JSON.parse(decrypted) : null;
    }
    
    return JSON.parse(data);
  } catch (error) {
    console.error('Read user data error:', error.message);
    return null;
  }
}

/**
 * 写入用户数据
 * @param {string} userId - 用户ID
 * @param {Object} data - 用户数据
 */
function writeUserData(userId, data) {
  ensureDataDir();
  const filePath = getUserDataPath(userId);
  
  try {
    const jsonData = JSON.stringify(data, null, 2);
    
    if (USE_ENCRYPTION) {
      const encrypted = encrypt(jsonData);
      fs.writeFileSync(filePath, encrypted, 'utf8');
    } else {
      fs.writeFileSync(filePath, jsonData, 'utf8');
    }
    
    return true;
  } catch (error) {
    console.error('Write user data error:', error.message);
    return false;
  }
}

/**
 * 更新用户数据（合并）
 * @param {string} userId - 用户ID
 * @param {Object} updates - 要更新的数据
 * @returns {Object} - 更新后的数据
 */
function updateUserData(userId, updates) {
  const currentData = readUserData(userId) || {};
  const newData = { ...currentData, ...updates };
  writeUserData(userId, newData);
  return newData;
}

/**
 * 删除用户数据
 * @param {string} userId - 用户ID
 * @returns {boolean} - 是否成功
 */
function deleteUserData(userId) {
  const filePath = getUserDataPath(userId);
  
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      return true;
    } catch (error) {
      console.error('Delete user data error:', error.message);
      return false;
    }
  }
  
  return true;
}

/**
 * 用户列表存储（存储用户账号信息）
 */
const USERS_FILE = path.join(DATA_DIR, 'users.json');

/**
 * 读取所有用户信息
 * @returns {Array} - 用户列表
 */
function readUsers() {
  ensureDataDir();
  
  if (!fs.existsSync(USERS_FILE)) {
    return [];
  }
  
  try {
    const data = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Read users error:', error.message);
    return [];
  }
}

/**
 * 保存用户列表
 * @param {Array} users - 用户列表
 */
function writeUsers(users) {
  ensureDataDir();
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
}

/**
 * 根据手机号查找用户
 * @param {string} phone - 手机号
 * @returns {Object|null} - 用户信息
 */
function findUserByPhone(phone) {
  const users = readUsers();
  return users.find(u => u.phone === phone) || null;
}

/**
 * 根据ID查找用户
 * @param {string} id - 用户ID
 * @returns {Object|null} - 用户信息
 */
function findUserById(id) {
  const users = readUsers();
  return users.find(u => u.id === id) || null;
}

/**
 * 创建新用户
 * @param {Object} userData - 用户数据
 * @returns {Object} - 创建的用户
 */
function createUser(userData) {
  const users = readUsers();
  const newUser = {
    id: userData.id,
    phone: userData.phone,
    password: userData.password,
    nickname: userData.nickname || '接好孕用户',
    createdAt: userData.createdAt || new Date().toISOString(),
    settings: {
      cycleLength: 28,
      periodLength: 5,
      reminderTime: '09:00',
      reminders: {
        ovulation: true,
        temperature: true,
        ovulationTest: true,
      },
    },
  };
  
  users.push(newUser);
  writeUsers(users);
  
  // 初始化用户数据文件
  writeUserData(newUser.id, {
    userId: newUser.id,
    records: [],
    predictions: [],
    createdAt: newUser.createdAt,
  });
  
  // 返回不含密码的用户信息
  const { password, ...userInfo } = newUser;
  return userInfo;
}

/**
 * 更新用户信息
 * @param {string} userId - 用户ID
 * @param {Object} updates - 更新内容
 * @returns {Object|null} - 更新后的用户信息
 */
function updateUser(userId, updates) {
  const users = readUsers();
  const index = users.findIndex(u => u.id === userId);
  
  if (index === -1) {
    return null;
  }
  
  // 不允许更新密码和ID
  const { password, id, ...allowedUpdates } = updates;
  users[index] = { ...users[index], ...allowedUpdates };
  writeUsers(users);
  
  const { pwd, ...userInfo } = users[index];
  return userInfo;
}

/**
 * 更新用户密码
 * @param {string} userId - 用户ID
 * @param {string} newPassword - 新密码（哈希后）
 * @returns {boolean} - 是否成功
 */
function updateUserPassword(userId, newPassword) {
  const users = readUsers();
  const index = users.findIndex(u => u.id === userId);
  
  if (index === -1) {
    return false;
  }
  
  users[index].password = newPassword;
  writeUsers(users);
  return true;
}

module.exports = {
  readUserData,
  writeUserData,
  updateUserData,
  deleteUserData,
  readUsers,
  writeUsers,
  findUserByPhone,
  findUserById,
  createUser,
  updateUser,
  updateUserPassword,
  DATA_DIR,
};
