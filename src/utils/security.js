/**
 * Security Utilities for Sangath Global Exim
 * Native Web-based cryptographic and sanitization controls
 */

// Default admin username and hashed password (SHA-256 of 'Sangath@2026')
export const DEFAULT_ADMIN_USERNAME = 'admin';
export const DEFAULT_ADMIN_PASSWORD_HASH = '253b44e4b813556f6ec0dad75d9a5b6215791226a19272e87b4cdd5aae5231b6';

/**
 * Hash password using browser Native Web Crypto API
 * @param {string} password 
 * @returns {Promise<string>}
 */
export async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate cryptographically random session token
 * @returns {string}
 */
export function generateSessionToken() {
  const array = new Uint8Array(24);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Sanitize string input to strip HTML tags and prevent XSS injections
 * @param {string} str 
 * @returns {string}
 */
export function sanitizeInput(str) {
  if (typeof str !== 'string') return str;
  
  // 1. Remove HTML tags completely
  let clean = str.replace(/<[^>]*>/g, '');
  
  // 2. Escape special characters to be safe
  return clean
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Validate image URL format
 * @param {string} url 
 * @returns {boolean}
 */
export function validateImageUrl(url) {
  if (!url) return false;
  // Support Base64 data URIs or relative/absolute URLs
  if (url.startsWith('data:image/')) return true;
  
  try {
    // Relative paths are valid
    if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) {
      return true;
    }
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch (e) {
    return false;
  }
}

/**
 * Validate uploaded image file (max 2MB, type check)
 * @param {File} file 
 * @returns {{valid: boolean, error?: string}}
 */
export function validateImageFile(file) {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'Only JPEG, PNG, WEBP, and GIF images are allowed.' };
  }
  
  const maxSize = 2 * 1024 * 1024; // 2MB
  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be under 2 MB.' };
  }
  
  return { valid: true };
}

/**
 * Check brute-force lockout status
 * @returns {{locked: boolean, minutesRemaining: number}}
 */
export function checkLoginAttempts() {
  const attempts = JSON.parse(localStorage.getItem('sangath_login_attempts') || '{"count": 0, "lockoutTime": 0}');
  
  if (attempts.lockoutTime > 0) {
    const timeRemaining = attempts.lockoutTime - Date.now();
    if (timeRemaining > 0) {
      return { locked: true, minutesRemaining: Math.ceil(timeRemaining / 60000) };
    } else {
      // Lockout expired, reset attempts
      resetLoginAttempts();
    }
  }
  
  return { locked: false, minutesRemaining: 0 };
}

/**
 * Record a failed login attempt. Locks out after 5 failures.
 */
export function recordFailedAttempt() {
  const attempts = JSON.parse(localStorage.getItem('sangath_login_attempts') || '{"count": 0, "lockoutTime": 0}');
  attempts.count += 1;
  
  if (attempts.count >= 5) {
    attempts.lockoutTime = Date.now() + 15 * 60 * 1000; // 15 mins lock
  }
  
  localStorage.setItem('sangath_login_attempts', JSON.stringify(attempts));
}

/**
 * Reset login attempts tracker
 */
export function resetLoginAttempts() {
  localStorage.removeItem('sangath_login_attempts');
}
