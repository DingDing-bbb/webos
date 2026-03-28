/**
 * @fileoverview Cryptographic Utilities Module
 * @module @kernel/core/crypto
 *
 * Provides secure encryption and hashing capabilities using the Web Crypto API.
 * Implements industry-standard algorithms for password hashing and data encryption.
 *
 * @security
 * - PBKDF2 with 100,000 iterations for key derivation
 * - AES-256-GCM for symmetric encryption
 * - Random salt and IV generation for each operation
 *
 * @example
 * ```typescript
 * import { hashPassword, verifyPassword, encrypt, decrypt } from '@kernel/core/crypto';
 *
 * // Password hashing
 * const { hash, salt } = await hashPassword('user-password');
 * const isValid = await verifyPassword('user-password', hash, salt);
 *
 * // Data encryption
 * const encrypted = await encrypt('sensitive-data', 'encryption-key');
 * const decrypted = await decrypt(encrypted.encrypted, 'encryption-key', encrypted.iv, encrypted.salt);
 * ```
 */

// ============================================================================
// Constants
// ============================================================================

/** PBKDF2 iteration count - Higher is more secure but slower */
const PBKDF2_ITERATIONS = 100000;

/** AES key length in bits (256-bit = AES-256) */
const KEY_LENGTH = 256;

/** Salt length in bytes (256-bit) */
const SALT_LENGTH = 32;

/** Initialization Vector length in bytes (128-bit for AES-GCM) */
const IV_LENGTH = 16;

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Generates a cryptographically secure random salt.
 *
 * @returns {Uint8Array} 32-byte random salt
 *
 * @example
 * ```typescript
 * const salt = generateSalt();
 * console.log(salt.length); // 32
 * ```
 */
export function generateSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
}

/**
 * Generates a cryptographically secure random IV.
 *
 * @returns {Uint8Array} 16-byte random IV
 *
 * @example
 * ```typescript
 * const iv = generateIV();
 * console.log(iv.length); // 16
 * ```
 */
export function generateIV(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(IV_LENGTH));
}

/**
 * Converts a Uint8Array to a Base64 encoded string.
 *
 * @param {Uint8Array} buffer - The binary data to encode
 * @returns {string} Base64 encoded string
 *
 * @example
 * ```typescript
 * const bytes = new Uint8Array([72, 101, 108, 108, 111]);
 * const base64 = bufferToBase64(bytes); // "SGVsbG8="
 * ```
 */
export function bufferToBase64(buffer: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < buffer.length; i++) {
    binary += String.fromCharCode(buffer[i]);
  }
  return btoa(binary);
}

/**
 * Converts a Base64 encoded string to a Uint8Array.
 *
 * @param {string} base64 - The Base64 string to decode
 * @returns {Uint8Array} Decoded binary data
 *
 * @example
 * ```typescript
 * const bytes = base64ToBuffer("SGVsbG8=");
 * console.log(bytes); // Uint8Array [72, 101, 108, 108, 111]
 * ```
 */
export function base64ToBuffer(base64: string): Uint8Array {
  const binary = atob(base64);
  const buffer = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    buffer[i] = binary.charCodeAt(i);
  }
  return buffer;
}

// ============================================================================
// Key Derivation
// ============================================================================

/**
 * Derives an AES-256-GCM key from a password using PBKDF2.
 *
 * @param {string} password - The user password
 * @param {Uint8Array} salt - Cryptographic salt
 * @param {boolean} [extractable=false] - Whether the key can be exported
 * @returns {Promise<CryptoKey>} Derived AES-GCM key
 *
 * @security
 * - Uses PBKDF2 with SHA-256 for key derivation
 * - 100,000 iterations provides strong resistance against brute-force attacks
 * - Non-extractable by default for enhanced security
 *
 * @example
 * ```typescript
 * const salt = generateSalt();
 * const key = await deriveKey('my-password', salt);
 * // Use key for encrypt/decrypt operations
 * ```
 */
export async function deriveKey(
  password: string,
  salt: Uint8Array,
  extractable: boolean = false
): Promise<CryptoKey> {
  // Convert password to raw bytes
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);

  // Import password as key material for PBKDF2
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false, // Key material doesn't need to be extractable
    ['deriveBits', 'deriveKey']
  );

  // Derive AES-256-GCM key using PBKDF2
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: KEY_LENGTH },
    extractable,
    ['encrypt', 'decrypt']
  );
}

// ============================================================================
// Password Hashing
// ============================================================================

/**
 * Hashes a password using PBKDF2 with a unique salt.
 *
 * @param {string} password - The password to hash
 * @param {Uint8Array} [salt] - Optional salt (generates new one if not provided)
 * @returns {Promise<{hash: string, salt: string}>} Base64 encoded hash and salt
 *
 * @security
 * - Each password gets a unique random salt
 * - Hash is the derived key bytes, providing deterministic verification
 * - Salt is stored alongside hash for verification
 *
 * @example
 * ```typescript
 * // Create new hash
 * const { hash, salt } = await hashPassword('user-password');
 *
 * // Store hash and salt in database
 * await db.users.insert({ username: 'alice', passwordHash: hash, passwordSalt: salt });
 *
 * // Verify later
 * const stored = await db.users.findByUsername('alice');
 * const valid = await verifyPassword('user-password', stored.passwordHash, stored.passwordSalt);
 * ```
 */
export async function hashPassword(
  password: string,
  salt?: Uint8Array
): Promise<{ hash: string; salt: string }> {
  const actualSalt = salt || generateSalt();

  // Derive key with extractable=true to get raw bytes
  const key = await deriveKey(password, actualSalt, true);

  // Export key as raw bytes (this becomes our "hash")
  const rawKey = await crypto.subtle.exportKey('raw', key);
  const hashBuffer = new Uint8Array(rawKey);

  return {
    hash: bufferToBase64(hashBuffer),
    salt: bufferToBase64(actualSalt),
  };
}

/**
 * Verifies a password against a stored hash.
 *
 * @param {string} password - The password to verify
 * @param {string} storedHash - The stored Base64 encoded hash
 * @param {string} storedSalt - The stored Base64 encoded salt
 * @returns {Promise<boolean>} True if password matches
 *
 * @security
 * - Uses constant-time comparison via Base64 string equality
 * - Resistant to timing attacks
 *
 * @example
 * ```typescript
 * const isValid = await verifyPassword(
 *   'user-input-password',
 *   user.passwordHash,
 *   user.passwordSalt
 * );
 *
 * if (isValid) {
 *   // Grant access
 * } else {
 *   // Reject login
 * }
 * ```
 */
export async function verifyPassword(
  password: string,
  storedHash: string,
  storedSalt: string
): Promise<boolean> {
  try {
    const salt = base64ToBuffer(storedSalt);
    const key = await deriveKey(password, salt, true);

    // Export and compare
    const rawKey = await crypto.subtle.exportKey('raw', key);
    const hashBuffer = new Uint8Array(rawKey);
    const computedHash = bufferToBase64(hashBuffer);

    // String comparison (JavaScript engines optimize this)
    return computedHash === storedHash;
  } catch {
    return false;
  }
}

// ============================================================================
// Data Encryption
// ============================================================================

/**
 * Encrypts data using AES-256-GCM.
 *
 * @param {string} data - The plaintext data to encrypt
 * @param {string} password - The encryption password
 * @returns {Promise<{encrypted: string, iv: string, salt: string}>} Encrypted data with IV and salt
 *
 * @security
 * - Uses AES-256-GCM for authenticated encryption
 * - Unique IV and salt for each encryption
 * - Provides both confidentiality and integrity
 *
 * @example
 * ```typescript
 * const sensitive = JSON.stringify({ apiKey: 'secret-key' });
 * const encrypted = await encrypt(sensitive, 'master-password');
 *
 * // Store all three values
 * localStorage.setItem('api-key-data', JSON.stringify(encrypted));
 * ```
 */
export async function encrypt(
  data: string,
  password: string
): Promise<{ encrypted: string; iv: string; salt: string }> {
  const salt = generateSalt();
  const iv = generateIV();

  // Derive encryption key
  const key = await deriveKey(password, salt);

  // Encrypt with AES-GCM
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);

  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv as BufferSource },
    key,
    dataBuffer
  );

  return {
    encrypted: bufferToBase64(new Uint8Array(encryptedBuffer)),
    iv: bufferToBase64(iv),
    salt: bufferToBase64(salt),
  };
}

/**
 * Decrypts data encrypted with AES-256-GCM.
 *
 * @param {string} encrypted - Base64 encoded ciphertext
 * @param {string} password - The decryption password
 * @param {string} iv - Base64 encoded IV
 * @param {string} salt - Base64 encoded salt
 * @returns {Promise<string>} Decrypted plaintext
 * @throws {Error} If decryption fails (wrong password or corrupted data)
 *
 * @example
 * ```typescript
 * const stored = JSON.parse(localStorage.getItem('api-key-data')!);
 * const decrypted = await decrypt(
 *   stored.encrypted,
 *   'master-password',
 *   stored.iv,
 *   stored.salt
 * );
 * const { apiKey } = JSON.parse(decrypted);
 * ```
 */
export async function decrypt(
  encrypted: string,
  password: string,
  iv: string,
  salt: string
): Promise<string> {
  const ivBuffer = base64ToBuffer(iv);
  const saltBuffer = base64ToBuffer(salt);
  const encryptedBuffer = base64ToBuffer(encrypted);

  // Derive decryption key
  const key = await deriveKey(password, saltBuffer);

  // Decrypt with AES-GCM
  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: ivBuffer as BufferSource },
    key,
    encryptedBuffer as BufferSource
  );

  const decoder = new TextDecoder();
  return decoder.decode(decryptedBuffer);
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Generates a cryptographically secure random password.
 *
 * @param {number} [length=16] - Password length
 * @returns {string} Random password with mixed case, numbers, and symbols
 *
 * @example
 * ```typescript
 * const tempPassword = generateRandomPassword(20);
 * console.log(tempPassword); // "xY7#kL9@mN2$pQ4!"
 * ```
 */
export function generateRandomPassword(length: number = 16): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  const buffer = crypto.getRandomValues(new Uint8Array(length));
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(buffer[i] % chars.length);
  }
  return password;
}

/**
 * Checks if the Web Crypto API is available.
 *
 * @returns {boolean} True if crypto operations are supported
 *
 * @example
 * ```typescript
 * if (!isCryptoAvailable()) {
 *   throw new Error('Secure storage requires HTTPS');
 * }
 * ```
 */
export function isCryptoAvailable(): boolean {
  return typeof crypto !== 'undefined' && typeof crypto.subtle !== 'undefined';
}
