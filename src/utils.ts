import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  category_id: number;
  type: string;
  gender: string;
  colors: string[];
  sizes: string[];
  image_url: string;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
}
