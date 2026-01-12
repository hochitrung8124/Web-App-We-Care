/**
 * String Utilities
 * Helper functions for string operations
 */

/**
 * Generate initials from full name
 * @example getInitials("Nguyễn Văn A") => "NA"
 */
export const getInitials = (name: string): string => {
  if (!name || name.trim().length === 0) return 'NA';
  
  const words = name.trim().split(/\s+/);
  
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

/**
 * Generate consistent color based on string hash
 */
export const getColorFromString = (str: string, colors: readonly string[]): string => {
  if (!str || colors.length === 0) return colors[0] || '';
  
  const hash = str.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

/**
 * Capitalize first letter
 */
export const capitalize = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Format phone number
 */
export const formatPhoneNumber = (phone?: string): string => {
  if (!phone) return 'N/A';
  
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format as XXX XXX XXXX
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }
  
  return phone;
};
