const crypto = require('crypto');
const logger = require('./logger');

// Must be exactly 32 bytes (256 bits) for aes-256-gcm
// In production, this MUST come from process.env.ENCRYPTION_KEY
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex').slice(0, 32); 
const IV_LENGTH = 12; // For GCM, 12 bytes is recommended

/**
 * Encrypts a string (e.g. bank account number)
 * Returns format: iv:authTag:encryptedText
 */
function encrypt(text) {
  if (!text) return text;
  
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(ENCRYPTION_KEY), iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  } catch (error) {
    logger.error('Encryption failed', error);
    throw new Error('Encryption failed');
  }
}

/**
 * Decrypts a string
 */
function decrypt(text) {
  if (!text) return text;
  
  // If it's not encrypted (legacy plain text), return as is
  if (!text.includes(':')) return text;
  
  try {
    const parts = text.split(':');
    if (parts.length !== 3) return text;
    
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encryptedText = parts[2];
    
    const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(ENCRYPTION_KEY), iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    logger.error('Decryption failed', error);
    // If decryption fails, return masked or null to prevent app crash
    return '***DECRYPTION_ERROR***';
  }
}

module.exports = { encrypt, decrypt };
