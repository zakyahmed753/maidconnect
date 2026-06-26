/**
 * Universal passport number validation.
 * Accepts passports from all countries — alphanumeric, 6–15 characters.
 */
export function validatePassport(passportNumber) {
  if (!passportNumber || typeof passportNumber !== 'string') {
    return { valid: false, message: 'Passport number is required' };
  }

  const cleaned = passportNumber.trim().toUpperCase().replace(/\s+/g, '');

  if (cleaned.length < 6) {
    return { valid: false, message: 'Passport number must be at least 6 characters' };
  }

  if (cleaned.length > 15) {
    return { valid: false, message: 'Passport number must be at most 15 characters' };
  }

  if (!/^[A-Z0-9<]+$/.test(cleaned)) {
    return { valid: false, message: 'Passport number must contain only letters, digits, or <' };
  }

  return { valid: true, message: 'Valid', normalized: cleaned };
}
