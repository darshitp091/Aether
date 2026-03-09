import { create } from 'zustand';
import { Product } from './utils';

interface CartItem extends Product {
  quantity: number;
  selectedColor: string;
  selectedSize: string;
}

interface StoreState {
  cart: CartItem[];
  wishlist: Product[];
  addToCart: (product: Product, color: string, size: string) => void;
  removeFromCart: (productId: number, color: string, size: string) => void;
  toggleWishlist: (product: Product) => void;
  clearCart: () => void;
}

export const useStore = create<StoreState>((set) => ({
  cart: [],
  wishlist: [],
  addToCart: (product, color, size) => set((state) => {
    const existing = state.cart.find(item => 
      item.id === product.id && 
      item.selectedColor === color && 
      item.selectedSize === size
    );
    if (existing) {
      return {
        cart: state.cart.map(item => 
          item === existing ? { ...item, quantity: item.quantity + 1 } : item
        )
      };
    }
    return { cart: [...state.cart, { ...product, quantity: 1, selectedColor: color, selectedSize: size }] };
  }),
  removeFromCart: (productId, color, size) => set((state) => ({
    cart: state.cart.filter(item => 
      !(item.id === productId && item.selectedColor === color && item.selectedSize === size)
    )
  })),
  toggleWishlist: (product) => set((state) => {
    const exists = state.wishlist.find(p => p.id === product.id);
    if (exists) {
      return { wishlist: state.wishlist.filter(p => p.id !== product.id) };
    }
    return { wishlist: [...state.wishlist, product] };
  }),
  clearCart: () => set({ cart: [] }),
}));
