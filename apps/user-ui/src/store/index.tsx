import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Product {
  id: string;
  title: string;
  salePrice: number;
  images: { url: string }[];
  quantity?: number;
  [key: string]: any; // For any other product properties
}

type Store = {
  cart: Product[];
  wishlist: Product[];
  addToCart: (
    product: Product,
    user: any,
    location: string,
    deviceInfo: string
  ) => void;
  removeFromCart: (
    productId: string,
    user: any,
    location: string,
    deviceInfo: string
  ) => void;
  clearCart: () => void;
  addToWishlist: (
    product: Product,
    user: any,
    location: string,
    deviceInfo: string
  ) => void;
  removeFromWishlist: (
    productId: string,
    user: any,
    location: string,
    deviceInfo: string
  ) => void;
  clearWishlist: () => void;
};

export const useStore = create<Store>(
  persist((set, get) => ({
    cart: [],
    wishlist: [],

    addToCart: (product, user, location, deviceInfo) => {
      set((state: { cart: any[] }) => {
        const existing = state.cart?.find(
          (item: { id: string }) => item?.id === product?.id
        );
        if (existing) {
          return {
            cart: state.cart.map((item: { id: string; quantity: any }) =>
              item.id === product.id
                ? { ...item, quantity: (item.quantity ?? 1) + 1 }
                : item
            ),
          };
        }
        return { cart: [...state.cart, { ...product, quantity: 1 }] };
      });
    },
    removeFromCart: (productId, user, location, deviceInfo) => {
      //find product before calling set
      const removeProduct = get().cart.find(
        (item: { id: string }) => item.id === productId
      );
      if (
        removeProduct &&
        removeProduct.quantity &&
        removeProduct.quantity > 1
      ) {
        //decrease quantity by 1
        set((state: { cart: any[] }) => ({
          cart: state.cart?.filter(
            (item: { id: string }) => item.id !== productId
          ),
        }));
        return;
      }
    },
    clearCart: () => set({ cart: [] }),

    addToWishlist: (product, user, location, deviceInfo) => {
      set((state: { wishlist: any[] }) => {
        const exists = state.wishlist?.some(
          (item: { id: string }) => item?.id === product?.id
        );
        if (exists) return state; // Prevent duplicates
        return { wishlist: [...state.wishlist, product] };
      });
    },
    removeFromWishlist: (productId, user, location, deviceInfo) => {
      const removeProduct = get().wishlist.find(
        (item: { id: string }) => item.id === productId
      );
      if (!removeProduct) return; // Product not found
      set((state: { wishlist: any[] }) => ({
        wishlist: state.wishlist.filter(
          (item: { id: string }) => item.id !== productId
        ),
      }));
    },
    clearWishlist: () => set({ wishlist: [] }),
  })),

  { name: "store-store" } // unique name for storage
);

// You can create more stores for other parts of your application as needed
