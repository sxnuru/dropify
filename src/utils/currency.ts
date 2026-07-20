/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Formats a numeric price into British Pounds (GBP) display format.
 * Example: 49.99 -> £49.99
 */
export function formatPrice(amount: number): string {
  return `£${amount.toFixed(2)}`;
}
