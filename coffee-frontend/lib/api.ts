import type { Product, Order, OrderDraft, User, ShipCategory, OrderStatus } from "@/types";
import { storage } from "./storage";
import { getShipCategoryKST } from "./cutoff";

const API = process.env.NEXT_PUBLIC_API_BASE;

// ====== 더미 데이터 ======
export const DUMMY_USERS: Array<User & { password: string }> = [
  {
    email: "member1@example.com",
    password: "1234",
    nickname: "성현",
    address: "서울시 중구 어딘가 1-2-3",
    postal_code: "04524",
    role: "user",
  },
  {
    email: "admin@example.com",
    password: "admin",
    nickname: "관리자",
    address: "서울시 종로구 관철동 1-1",
    postal_code: "03154",
    role: "admin", // ← 관리자 계정
  },
];

let DUMMY_PRODUCTS: Product[] = [
  { id: "col-narino", name: "Columbia Nariñó", origin: "콜롬비아", price: 5000, imageUrl: "https://i.imgur.com/HKOFQYa.jpeg", stock: 100, active: true },
  { id: "bra-serra",  name: "Brazil Serra Do Caparaó", origin: "브라질",   price: 6000, imageUrl: "https://i.imgur.com/HKOFQYa.jpeg", stock: 80,  active: true },
  { id: "eth-yirg",   name: "Ethiopia Yirgacheffe",    origin: "에티오피아", price: 7000, imageUrl: "https://i.imgur.com/HKOFQYa.jpeg", stock: 60,  active: true },
];

let DUMMY_ORDERS: Order[] = [
  {
    id: "ord_0001",
    email: "member1@example.com",
    address: "서울시 중구 어딘가 1-2-3",
    postcode: "04524",
    items: [
      { productId: "col-narino", name: "Columbia Nariñó", qty: 2, price: 5000 },
      { productId: "eth-yirg",  name: "Ethiopia Yirgacheffe", qty: 1, price: 7000 },
    ],
    total: 17000,
    shipCategory: getShipCategoryKST(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1시간 전
    status: "PAID",
  },
];

// ====== 공용(기존) ======
export async function fetchProducts(): Promise<Product[]> {
  if (!API) return [...DUMMY_PRODUCTS];
  try {
    const r = await fetch(`${API}/product/list`, { cache: "no-store" });
    if (!r.ok) throw 0;
    return await r.json();
  } catch {
    return [...DUMMY_PRODUCTS];
  }
}

export async function createOrder(draft: OrderDraft): Promise<{ ok: boolean; id?: string }> {
  if (!API) {
    const id = `dummy-${Date.now()}`;
    DUMMY_ORDERS.unshift({
      id,
      email: draft.email,
      address: draft.address,
      postcode: draft.postcode,
      items: draft.items.map(it => {
        const p = DUMMY_PRODUCTS.find(x => x.id === it.productId)!;
        return { productId: it.productId, name: p?.name || it.productId, qty: it.qty, price: p?.price || 0 };
      }),
      total: draft.total,
      shipCategory: draft.shipCategory,
      createdAt: new Date().toISOString(),
      status: "PAID",
    });
    return { ok: true, id };
  }
  const r = await fetch(`${API}/order/order`, { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(draft) });
  if (!r.ok) throw new Error("주문 실패");
  return r.json();
}

export async function fetchOrdersByEmail(email: string): Promise<Order[]> {
  if (!email) return [];
  if (!API) return DUMMY_ORDERS.filter(o => o.email === email);
  const r = await fetch(`${API}/order/details?email=${encodeURIComponent(email)}`, { cache: "no-store" });
  if (!r.ok) throw new Error("조회 실패");
  return r.json();
}

// ====== 인증(로그인/회원가입) 폴백 유지 ======
export async function login(email: string, password: string): Promise<User> {
  if (!API) {
    const found = DUMMY_USERS.find(u => u.email === email && u.password === password);
    if (!found) throw new Error("이메일 또는 비밀번호가 올바르지 않습니다.");
    const { password: _pw, ...user } = found;
    storage.setUser(user);
    return user;
  }
  const r = await fetch(`${API}/auth/login`, { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ email, password }) });
  if (!r.ok) throw new Error("로그인 실패");
  const user = await r.json() as User; // 백엔드도 role 포함해주면 됨
  storage.setUser(user);
  return user;
}

export async function signup(data: { email:string; password:string; nickname:string; address:string; postal_code:string; }): Promise<User> {
  if (!API) {
    if (DUMMY_USERS.some(u => u.email === data.email)) throw new Error("이미 존재하는 이메일입니다.");
    const user: User = { email: data.email, nickname: data.nickname, address: data.address, postal_code: data.postal_code, role:"user" };
    storage.setUser(user);
    return user;
  }
  const r = await fetch(`${API}/auth/signup`, { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(data) });
  if (!r.ok) throw new Error("회원가입 실패");
  const user = await r.json() as User;
  storage.setUser(user);
  return user;
}

export function logout() { storage.clearUser(); }

// ====== 관리자 전용 API (더미 → API 폴백) ======

// 주문 목록 조회(관리자)
export async function adminFetchOrders(): Promise<Order[]> {
  if (!API) return [...DUMMY_ORDERS];
  const r = await fetch(`${API}/admin/orders`, { cache: "no-store" });
  if (!r.ok) throw new Error("주문 조회 실패");
  return r.json();
}

// 주문 상태 변경
export async function adminUpdateOrderStatus(orderId: string, status: OrderStatus): Promise<boolean> {
  if (!API) {
    const idx = DUMMY_ORDERS.findIndex(o => o.id === orderId);
    if (idx >= 0) DUMMY_ORDERS[idx].status = status;
    return true;
  }
  const r = await fetch(`${API}/admin/orders/${orderId}/status`, { method:"PATCH", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ status }) });
  return r.ok;
}

// 상품 목록/생성/수정/삭제
export async function adminFetchProducts(): Promise<Product[]> {
  if (!API) return [...DUMMY_PRODUCTS];
  const r = await fetch(`${API}/admin/products`, { cache: "no-store" });
  if (!r.ok) throw new Error("상품 조회 실패");
  return r.json();
}

export async function adminCreateProduct(p: Omit<Product,"id">): Promise<Product> {
  if (!API) {
    const id = `p_${Date.now()}`;
    const np = { ...p, id };
    DUMMY_PRODUCTS.unshift(np);
    return np;
  }
  const r = await fetch(`${API}/admin/products`, { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(p) });
  if (!r.ok) throw new Error("상품 등록 실패");
  return r.json();
}

export async function adminUpdateProduct(p: Product): Promise<boolean> {
  if (!API) {
    const idx = DUMMY_PRODUCTS.findIndex(x => x.id === p.id);
    if (idx >= 0) DUMMY_PRODUCTS[idx] = { ...p };
    return true;
  }
  const r = await fetch(`${API}/admin/products/${p.id}`, { method:"PUT", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(p) });
  return r.ok;
}

export async function adminDeleteProduct(id: string): Promise<boolean> {
  if (!API) {
    DUMMY_PRODUCTS = DUMMY_PRODUCTS.filter(x => x.id !== id);
    return true;
  }
  const r = await fetch(`${API}/admin/products/${id}`, { method:"DELETE" });
  return r.ok;
}

// 통계(매출/상품별 판매량)
export async function adminFetchStats(): Promise<{ revenue:number; byProduct: Array<{ productId:string; name:string; qty:number; amount:number }> }> {
  if (!API) {
    const map = new Map<string, { name:string; qty:number; amount:number }>();
    let revenue = 0;
    for (const o of DUMMY_ORDERS) {
      revenue += o.total;
      for (const it of o.items) {
        const v = map.get(it.productId) || { name: it.name, qty: 0, amount: 0 };
        v.qty += it.qty;
        v.amount += it.qty * it.price;
        map.set(it.productId, v);
      }
    }
    return { revenue, byProduct: [...map].map(([productId, v]) => ({ productId, ...v })) };
  }
  const r = await fetch(`${API}/admin/stats`, { cache:"no-store" });
  if (!r.ok) throw new Error("통계 조회 실패");
  return r.json();
}
