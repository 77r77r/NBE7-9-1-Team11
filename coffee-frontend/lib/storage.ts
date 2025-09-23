import type { CartItem } from "@/types";
const CART_KEY = "coffee.cart";
const EMAIL_KEY = "coffee.email";

export const storage = {
  getCart(): CartItem[] {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(localStorage.getItem(CART_KEY) || "[]"); } catch { return []; }
  },
  setCart(v: CartItem[]) { if (typeof window !== "undefined") localStorage.setItem(CART_KEY, JSON.stringify(v)); },
  getEmail(): string { return typeof window === "undefined" ? "" : (localStorage.getItem(EMAIL_KEY) || ""); },
  setEmail(v: string) { if (typeof window !== "undefined") localStorage.setItem(EMAIL_KEY, v); },
};
