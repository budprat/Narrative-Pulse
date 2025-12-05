import crypto from 'crypto';

/**
 * Generate SHA-256 hash of input text for provenance tracking
 */
export function hashInput(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex');
}

/**
 * Generate a secure random token
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Compare two hashes in constant time to prevent timing attacks
 */
export function compareHashes(hash1: string, hash2: string): boolean {
  if (hash1.length !== hash2.length) {
    return false;
  }
  return crypto.timingSafeEqual(Buffer.from(hash1), Buffer.from(hash2));
}
