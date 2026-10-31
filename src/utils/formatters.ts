/**
 * Formats a numeric monetary amount into standard Indian Rupee (INR) representation
 * or a specified international currency formatting string.
 *
 * @param amount - The numeric sum to format.
 * @param currency - Currency code, defaults to 'INR'.
 * @returns A formatted currency string, e.g. "₹25,00,000".
 *
 * @example
 * ```ts
 * formatCurrency(2500000); // "₹25,00,000"
 * ```
 */
export function formatCurrency(amount: number, currency = 'INR'): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '₹0';
  const rounded = Math.round(amount);
  if (currency === 'INR') {
    return `₹${rounded.toLocaleString('en-IN')}`;
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(rounded);
}

/**
 * Formats an ISO date string into a localized, human-readable date.
 *
 * @param dateString - ISO format date string (e.g. "2025-12-14").
 * @returns Formatted date, e.g. "14 Dec 2025".
 */
export function formatDate(dateString: string): string {
  if (!dateString) return 'Date Pending';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

/**
 * Computes percentage ratio with fixed decimal precision.
 *
 * @param part - The fraction/portion value.
 * @param total - The total denominator value.
 * @param decimals - Number of decimal digits, defaults to 1.
 * @returns Numeric percentage representation (0-100).
 */
export function formatPercentage(part: number, total: number, decimals = 1): number {
  if (!total || total <= 0 || !part) return 0;
  const pct = (part / total) * 100;
  return Number(pct.toFixed(decimals));
}

/**
 * Safely truncates a text string with an ellipsis if it exceeds the max length.
 *
 * @param text - Input string to truncate.
 * @param maxLength - Maximum allowed character length.
 * @returns Truncated string with ellipsis if necessary.
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength).trim()}...`;
}

/**
 * Extracts 2-letter uppercase initials from an entity or user's full name.
 *
 * @param name - The full name string.
 * @returns 2-character uppercase initials, e.g. "RJ".
 */
export function getInitials(name: string): string {
  if (!name) return 'AT';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
