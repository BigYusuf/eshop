"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { sendKafkaEvent } from "../actions/track-user";

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
    location: any,
    deviceInfo: any
  ) => void;
  removeFromCart: (
    productId: string,
    user: any,
    location: any,
    deviceInfo: any
  ) => void;
  clearCart: () => void;
  addToWishlist: (
    product: Product,
    user: any,
    location: any,
    deviceInfo: any
  ) => void;
  removeFromWishlist: (
    productId: string,
    user: any,
    location: any,
    deviceInfo: any
  ) => void;
  clearWishlist: () => void;
};

export const useStore = create<Store>(
  persist((set, get) => ({
    cart: [],
    wishlist: [],

    addToCart: (product, user, location, deviceInfo) => {
      set((state: { cart: any[] }) => {
        const existing = state.cart.find(
          (item) =>
            item.id === product.id &&
            (item.selectedOptions?.color ?? null) ===
              (product.selectedOptions?.color ?? null) &&
            (item.selectedOptions?.size ?? null) ===
              (product.selectedOptions?.size ?? null)
        );

        if (existing) {
          return {
            cart: state.cart.map((item) =>
              item.id === product.id &&
              item.selectedOptions?.color === product.selectedOptions?.color &&
              item.selectedOptions?.size === product.selectedOptions?.size
                ? { ...item, quantity: item.quantity + (product.quantity ?? 1) }
                : item
            ),
          };
        }

        return {
          cart: [
            ...state.cart,
            {
              ...product,
              quantity: product.quantity ?? 1,
            },
          ],
        };
      });

      //send kafka event
      if (user?.id && location && deviceInfo) {
        console.log("add to client2");
        sendKafkaEvent({
          userId: user?.id,
          productId: product?.id,
          shopId: product?.shopId,
          action: "add_to_cart",
          country: location?.country || "Unknown",
          city: location?.city || "Unknown",
          deviceType: deviceInfo?.device || "Unknown Device",
          os: deviceInfo?.os || "Unknown OS",
          browser: deviceInfo?.browser || "Unknown Browser",
          ipAddress: deviceInfo?.ip || "Unknown",
          userAgent: deviceInfo?.userAgent || "Unknown",
        });
        console.log("send to client");
      }
    },

    removeFromCart: (productId, user, location, deviceInfo) => {
      console.log("working", productId, user, location, deviceInfo);

      // check if product exists before removing
      const removeProduct = get().cart.find(
        (item: { id: string }) => item.id === productId
      );

      if (!removeProduct) return; // nothing to remove

      // ✅ remove product completely
      set((state: { cart: any[] }) => ({
        cart: state.cart.filter(
          (item: { id: string }) => item.id !== productId
        ),
      }));

      // send kafka event if needed
      if (user?.id && location && deviceInfo) {
        console.log("sendKafka");
        sendKafkaEvent({
          userId: user?.id,
          productId: removeProduct.id,
          shopId: removeProduct.shopId,
          action: "remove_from_cart",
          country: location?.country || "Unknown",
          city: location?.city || "Unknown",
          deviceType: deviceInfo?.device || "Unknown Device",
          os: deviceInfo?.os || "Unknown OS",
          browser: deviceInfo?.browser || "Unknown Browser",
          ipAddress: deviceInfo?.ip || "Unknown",
          userAgent: deviceInfo?.userAgent || "Unknown",
        });
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
      //send kafka event
      if (user?.id && location && deviceInfo) {
        sendKafkaEvent({
          userId: user?.id,
          productId: product?.id,
          shopId: product?.shopId,
          action: "add_to_wishlist",
          country: location?.country || "Unknown",
          city: location?.city || "Unknown",
          deviceType: deviceInfo?.device || "Unknown Device",
          os: deviceInfo?.os || "Unknown OS",
          browser: deviceInfo?.browser || "Unknown Browser",
          ipAddress: deviceInfo?.ip || "Unknown",
          userAgent: deviceInfo?.userAgent || "Unknown",
        });
      }
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
      //send kafka event
      if (user?.id && location && deviceInfo && removeProduct) {
        sendKafkaEvent({
          userId: user?.id,
          productId: removeProduct?.id,
          shopId: removeProduct?.shopId,
          action: "remove_from_wishlist",
          country: location?.country || "Unknown",
          city: location?.city || "Unknown",
          deviceType: deviceInfo?.device || "Unknown Device",
          os: deviceInfo?.os || "Unknown OS",
          browser: deviceInfo?.browser || "Unknown Browser",
          ipAddress: deviceInfo?.ip || "Unknown",
          userAgent: deviceInfo?.userAgent || "Unknown",
        });
      }
    },
    clearWishlist: () => set({ wishlist: [] }),
  })),

  { name: "store-store" } // unique name for storage
);

// You can create more stores for other parts of your application as needed
