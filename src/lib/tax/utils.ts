/**
 * Utility functions for formatting
 */

/**
 * Format number as Vietnamese currency
 */
export function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

/**
 * Format number with thousand separators
 */
export function formatNumber(amount: number): string {
  return new Intl.NumberFormat('vi-VN').format(amount);
}
