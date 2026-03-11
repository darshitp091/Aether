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
  addToCart: (product: Product, color: string, size: string, qty?: number) => void;
  removeFromCart: (productId: number, color: string, size: string) => void;
  updateQuantity: (productId: number, color: string, size: string, quantity: number) => void;
  toggleWishlist: (product: Product) => void;
  clearCart: () => void;
}

export const useStore = create<StoreState>((set) => ({
  cart: [],
  wishlist: [],
  addToCart: (product, color, size, qty = 1) => set((state) => {
    const existing = state.cart.find(item => 
      item.id === product.id && 
      item.selectedColor === color && 
      item.selectedSize === size
    );
    if (existing) {
      return {
        cart: state.cart.map(item => 
          item === existing ? { ...item, quantity: item.quantity + qty } : item
        )
      };
    }
    return { cart: [...state.cart, { ...product, quantity: qty, selectedColor: color, selectedSize: size }] };
  }),
  removeFromCart: (productId, color, size) => set((state) => ({
    cart: state.cart.filter(item => 
      !(item.id === productId && item.selectedColor === color && item.selectedSize === size)
    )
  })),
  updateQuantity: (productId, color, size, quantity) => set((state) => {
    if (quantity <= 0) {
      return { cart: state.cart.filter(item => 
        !(item.id === productId && item.selectedColor === color && item.selectedSize === size)
      )};
    }
    return {
      cart: state.cart.map(item =>
        (item.id === productId && item.selectedColor === color && item.selectedSize === size)
          ? { ...item, quantity }
          : item
      )
    };
  }),
  toggleWishlist: (product) => set((state) => {
    const exists = state.wishlist.find(p => p.id === product.id);
    if (exists) {
      return { wishlist: state.wishlist.filter(p => p.id !== product.id) };
    }
    return { wishlist: [...state.wishlist, product] };
  }),
  clearCart: () => set({ cart: [] }),
}));
