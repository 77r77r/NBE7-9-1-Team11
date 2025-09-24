export type OrderStatus = "PAID" | "PREPARING" | "SHIPPING" | "DELIVERED" | "CANCELLED";
export type ShipCategory = "TODAY" | "TOMORROW";

export type Product = {
  id: string;
  name: string;
  origin: string;
  price: number;
  imageUrl: string;
  stock?: number;
  active?: boolean;
};
  
  export type CartItem = {
    productId: string;
    qty: number;
  };
  
  export type OrderDraft = {
    email: string;
    address: string;
    postcode: string;
    items: CartItem[];
    total: number;
    shipCategory: "TODAY" | "TOMORROW";
  };
  
  export type Order = {
    id: string;
    email: string;
    address: string;
    postcode: string;
    items: Array<{ productId: string; name: string; qty: number; price: number }>;
    total: number;
    shipCategory: ShipCategory;
    createdAt: string;   // 결제 시각
    status: OrderStatus; // ← 추가
  };
  
  export type Role = "user" | "admin";

  export type User = {
    email: string;
    nickname: string;
    address: string;
    postal_code: string;
    role?: Role; // ← 추가 (기본 user, 관리자면 admin)
  };