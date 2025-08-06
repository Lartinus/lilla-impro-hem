import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format price from öre to SEK with proper formatting
 * @param amountInOre - Amount in öre (Swedish currency subdivision)
 * @returns Formatted price string (e.g., "300 kr")
 */
export function formatPrice(amountInOre: number): string {
  const amountInSEK = amountInOre / 100;
  return `${amountInSEK.toFixed(0)} kr`;
}

/**
 * Format price from öre to SEK as currency using Intl.NumberFormat
 * @param amountInOre - Amount in öre
 * @returns Formatted currency string (e.g., "300 kr")
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
