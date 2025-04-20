import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines multiple class names and tailwind classes efficiently
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
} 