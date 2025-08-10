import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format price from öre to SEK (for values stored in öre)
 */
export function formatPrice(amountInOre: number): string {
  const amountInSEK = amountInOre / 100;
  return `${amountInSEK.toFixed(0)} kr`;
}

/**
 * Format price from kronor to SEK (for values stored in kronor)
 */
export function formatPriceSEK(amountInSEK: number): string {
  return `${(amountInSEK || 0).toFixed(0)} kr`;
}

/**
 * Format currency from öre to SEK using Intl (kept for existing ticket flows)
 */
export function formatCurrency(amountInOre: number): string {
  const amountInSEK = amountInOre / 100;
  return new Intl.NumberFormat('sv-SE', {
    style: 'currency',
    currency: 'SEK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amountInSEK);
}
