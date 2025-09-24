import type { CartItem } from "@/types";
import type { User } from "@/types";

const CART_KEY = "coffee.cart";
const EMAIL_KEY = "coffee.email";
const USER_KEY = "coffee.user"; // 로그인 유저

export const storage = {
  // cart
  getCart(): CartItem[] {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(localStorage.getItem(CART_KEY) || "[]"); } catch { return []; }
  },
  setCart(v: CartItem[]) { if (typeof window !== "undefined") localStorage.setItem(CART_KEY, JSON.stringify(v)); },

  // guest email
  getEmail(): string { return typeof window === "undefined" ? "" : (localStorage.getItem(EMAIL_KEY) || ""); },
  setEmail(v: string) { if (typeof window !== "undefined") localStorage.setItem(EMAIL_KEY, v); },

  // auth user
  getUser(): User | null {
    if (typeof window === "undefined") return null;
    try { return JSON.parse(localStorage.getItem(USER_KEY) || "null"); } catch { return null; }
  },
  setUser(u: User) { if (typeof window !== "undefined") localStorage.setItem(USER_KEY, JSON.stringify(u)); },
  clearUser() { if (typeof window !== "undefined") localStorage.removeItem(USER_KEY); },
};
