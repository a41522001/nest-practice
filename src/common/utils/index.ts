import bcrypt from 'bcrypt';
import { ValidationError } from 'class-validator';
import { DateTime } from 'luxon';
/**
 * 對密碼進行加鹽hash處理。
 * @param {string} password - 需要hash處理的純文字密碼。
 * @returns {Promise<string>} hash過的密碼字串。
 */
const saltPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  const bcryptPassword = await bcrypt.hash(password, saltRounds);
  return bcryptPassword;
};

/**
 * 比對純文字密碼與hash過的密碼是否相符。
 * @param {string} userPassword - 使用者輸入的純文字密碼。
 * @param {string} hashPassword - 資料庫中儲存的hash密碼。
 * @returns {Promise<boolean>} 如果密碼相符則解析為 true，否則為 false。
 */
const decodePassword = async (
  userPassword: string,
  hashPassword: string,
): Promise<boolean> => {
  const isPasswordExist = await bcrypt.compare(userPassword, hashPassword);
  return isPasswordExist;
};

const getRefreshTokenExpiresAt = (days: number): Date => {
  const expireDate = DateTime.utc().plus({ days });
  return expireDate.toJSDate();
};

const formatValidationErrors = (
  errors: ValidationError[],
): Record<string, string[]> => {
  const result: Record<string, string[]> = {};
  errors.forEach((error) => {
    const field = error.property;
    const messages = error.constraints
      ? Object.values(error.constraints)
      : ['驗證失敗'];
    result[field] = messages;
  });

  return result;
};

const getTaipeiTime = () => '';

export {
  saltPassword,
  decodePassword,
  getRefreshTokenExpiresAt,
  formatValidationErrors,
  getTaipeiTime,
};
