export type Product = {
    id: string;
    name: string;
    origin: string;
    price: number;
    imageUrl: string;
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
    shipCategory: "TODAY" | "TOMORROW";
    createdAt: string;
  };
  