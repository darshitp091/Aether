import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ProductVariant {
  id: number;
  product_id: number;
  printify_variant_id: string;
  color: string;
  size: string;
  hex_code: string;
  price: number;
  sku: string;
  image_url: string;
  is_enabled: boolean;
}

export interface Product {
  id: number;
  printify_id: string;
  name: string;
  slug: string;
  description: string;
  category_id: number;
  type: string;
  gender: string;
  status: string;
  markup_price: number;
  base_price: number;
  image_url?: string; // We'll often use the first variant image
  product_variants?: ProductVariant[];
  categories?: {
    name: string;
    slug: string;
  };
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
