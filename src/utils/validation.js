import mongoose from 'mongoose';

/**
 * Validates if a string is a valid MongoDB ObjectId
 * @param {string} id - The ID to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const validateObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

/**
 * Validates email format
 * @param {string} email - The email to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates password strength
 * @param {string} password - The password to validate
 * @returns {object} - Object with isValid flag and message
 */
export const validatePassword = (password) => {
  if (!password || password.length < 8) {
    return { 
      isValid: false, 
      message: 'Password must be at least 8 characters long'
    };
  }
  
  // Check for at least one uppercase letter, one lowercase letter, and one number
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  
  if (!hasUppercase || !hasLowercase || !hasNumber) {
    return {
      isValid: false,
      message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    };
  }
  
  return { isValid: true, message: 'Password is valid' };
};
