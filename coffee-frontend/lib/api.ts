// lib/api.ts
import type {
  Product, Order, OrderDraft, User, OrderStatus,
} from "@/types";
import { storage } from "./storage";

// ------------------------------------------------------------------
// 0) 백엔드 경로 설정: 여기만 네 서버에 맞게 바꾸면 됨
//    예) NEXT_PUBLIC_API_BASE=http://localhost:8080
//    아래 PATHS는 /api/v1 prefix 가정. 프로젝트에 맞게 수정해줘.
// ------------------------------------------------------------------
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || ""; // 비어있으면 더미모드
const PATHS = {
  // 회원
  login: "/auth/login",       // 또는 "/api/v1/member/login"
  signup: "/auth/signup",     // 또는 "/api/v1/member/signup"

  // 상품(일반)
  products: "/api/v1/products",      // 또는 "/api/v1/product/list"

  // 주문(일반)
  orderCreate: "/api/v1/orders",     // 또는 "/api/v1/order"
  orderByEmail: "/orders/details", // ?email=...

  // 관리자
  adminOrders: "/admin/orders",
  adminOrderStatus: (id: string) => `/admin/orders/${id}/status`,
  adminProducts: "/admin/products",
  adminProductOne: (id: string) => `/admin/products/${id}`,
};

// ------------------------------------------------------------------
// 공통 유틸
// ------------------------------------------------------------------
async function unwrapJson<T>(r: Response): Promise<T> {
  const body = await r.json().catch(() => ({}));
  // RsData 형태 { resultCode, msg, data } 이면 data만 리턴
  return (body && typeof body === "object" && "data" in body ? body.data : body) as T;
}
function j(o: any) {
  return JSON.stringify(o);
}
function isDummy() {
  return !API_BASE; // env 없으면 더미 모드
}

// ------------------------------------------------------------------
// 더미 데이터
// ------------------------------------------------------------------
let DUMMY_PRODUCTS: Product[] = [
  { id: "col-narino", name: "Columbia Nariñó", origin: "콜롬비아", price: 5000, imageUrl: "https://i.imgur.com/HKOFQYa.jpeg", stock: 100, active: true },
  { id: "bra-serra",  name: "Brazil Serra Do Caparaó", origin: "브라질",   price: 6000, imageUrl: "https://i.imgur.com/HKOFQYa.jpeg", stock: 80,  active: true },
  { id: "eth-yirg",   name: "Ethiopia Yirgacheffe",    origin: "에티오피아", price: 7000, imageUrl: "https://i.imgur.com/HKOFQYa.jpeg", stock: 60,  active: true },
];

let DUMMY_ORDERS: Order[] = []; // 주문 생성 시 채워짐

export const DUMMY_USERS: Array<User & { password: string }> = [
  {
    email: "member1@example.com", password: "1234",
    nickname: "성현", address: "서울시 중구 어딘가 1-2-3", postal_code: "04524", role: "user",
  },
  {
    email: "admin@example.com", password: "admin",
    nickname: "관리자", address: "서울시 종로구 관철동 1-1", postal_code: "03154", role: "admin",
  },
];

// ------------------------------------------------------------------
// 1) 로그인 / 로그아웃 / 회원가입
// ------------------------------------------------------------------
export async function login(email: string, password: string): Promise<User> {
  if (isDummy()) {
    const found = DUMMY_USERS.find(u => u.email === email && u.password === password);
    if (!found) throw new Error("이메일 또는 비밀번호가 올바르지 않습니다.");
    const { password: _pw, ...user } = found;
    storage.setUser(user);
    return user;
  }
  const r = await fetch(`${API_BASE}${PATHS.login}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: j({ email, password }),
  });
  if (!r.ok) throw new Error("로그인 실패");
  const user = await unwrapJson<User>(r);
  storage.setUser(user);
  return user;
}

export function logout() {
  storage.clearUser();
}

export async function signup(data: {
  email: string; password: string; nickname: string; address: string; postal_code: string;
}): Promise<User> {
  if (isDummy()) {
    if (DUMMY_USERS.some(u => u.email === data.email)) throw new Error("이미 존재하는 이메일입니다.");
    const user: User = { ...data, role: "user" };
    delete (user as any).password; // 저장은 password 없이
    storage.setUser(user);
    return user;
  }
  const r = await fetch(`${API_BASE}${PATHS.signup}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: j(data),
  });
  if (!r.ok) throw new Error("회원가입 실패");
  const user = await unwrapJson<User>(r);
  storage.setUser(user);
  return user;
}

// ------------------------------------------------------------------
// 2) 상품 목록
// ------------------------------------------------------------------
export async function fetchProducts(): Promise<Product[]> {
  if (isDummy()) return [...DUMMY_PRODUCTS];
  const r = await fetch(`${API_BASE}${PATHS.products}`, { cache: "no-store" });
  if (!r.ok) throw new Error("상품 조회 실패");
  return await unwrapJson<Product[]>(r);
}

// ------------------------------------------------------------------
// 3) 주문: 생성 / 이메일로 조회 (비회원 주문 조회)
// ------------------------------------------------------------------
export async function createOrder(draft: OrderDraft): Promise<{ ok: boolean; id?: string }> {
  if (isDummy()) {
    const id = `dummy-${Date.now()}`;
    const itemsDetailed = draft.items.map(it => {
      const p = DUMMY_PRODUCTS.find(x => x.id === it.productId);
      return { productId: it.productId, name: p?.name || it.productId, qty: it.qty, price: p?.price || 0 };
    });
    DUMMY_ORDERS.unshift({
      id,
      email: draft.email,
      address: draft.address,
      postcode: draft.postcode,
      items: itemsDetailed,
      total: draft.total,
      shipCategory: draft.shipCategory,
      createdAt: new Date().toISOString(),
      status: "PAID",
    } as Order);
    return { ok: true, id };
  }
  const r = await fetch(`${API_BASE}${PATHS.orderCreate}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: j(draft),
  });
  if (!r.ok) throw new Error("주문 실패");
  return await unwrapJson<{ ok: boolean; id?: string }>(r);
}

// ✅ 비회원 이메일 주문 조회
export async function fetchOrdersByEmail(email: string): Promise<Order[]> {
  if (!email) return [];
  if (isDummy()) return DUMMY_ORDERS.filter(o => o.email === email);
  const url = `${API_BASE}${PATHS.orderByEmail}?email=${encodeURIComponent(email)}`;
  const r = await fetch(url, { cache: "no-store" });
  if (!r.ok) throw new Error("주문 조회 실패");
  return await unwrapJson<Order[]>(r);
}

// ------------------------------------------------------------------
// 4) 관리자: 주문 목록 / 주문 상태 변경
// ------------------------------------------------------------------
export async function adminFetchOrders(): Promise<Order[]> {
  if (isDummy()) return [...DUMMY_ORDERS];
  const r = await fetch(`${API_BASE}${PATHS.adminOrders}`, { cache: "no-store" });
  if (!r.ok) throw new Error("관리자 주문 조회 실패");
  return await unwrapJson<Order[]>(r);
}

export async function adminUpdateOrderStatus(orderId: string, status: OrderStatus): Promise<boolean> {
  if (isDummy()) {
    const i = DUMMY_ORDERS.findIndex(o => o.id === orderId);
    if (i >= 0) DUMMY_ORDERS[i].status = status;
    return true;
  }
  const r = await fetch(`${API_BASE}${PATHS.adminOrderStatus(orderId)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: j({ status }),
  });
  return r.ok;
}

// ------------------------------------------------------------------
// 5) 관리자: 통계 (프론트 계산)
//    - 전체 주문 받아와서 총매출 / 상품별 판매량 집계
// ------------------------------------------------------------------
export async function adminFetchStats(): Promise<{
  revenue: number;
  byProduct: Array<{ productId: string; name: string; qty: number; amount: number }>;
}> {
  const orders = await adminFetchOrders(); // <- 서버 호출(또는 더미) 후 프론트에서 계산
  let revenue = 0;
  const map = new Map<string, { name: string; qty: number; amount: number }>();
  for (const o of orders) {
    revenue += o.total || 0;
    for (const it of o.items) {
      const v = map.get(it.productId) || { name: it.name, qty: 0, amount: 0 };
      v.qty += it.qty;
      v.amount += it.qty * it.price;
      map.set(it.productId, v);
    }
  }
  return { revenue, byProduct: [...map].map(([productId, v]) => ({ productId, ...v })) };
}

// ------------------------------------------------------------------
// 6) 관리자: 상품 CRUD
//    - 생성 요청 필드: productname, productPrice, origin, stock, imgUrl (요구사항 반영)
//    - 더미에서는 메모리 배열 갱신. 실서버는 DB 반영.
// ------------------------------------------------------------------
type AdminCreatePayload = {
  productname: string;       // ← 요구사항 명칭
  productPrice: number;      // ← 요구사항 명칭
  origin: string;
  stock: number;
  imgUrl: string;
  active?: boolean;
};

export async function adminFetchProducts(): Promise<Product[]> {
  if (isDummy()) return [...DUMMY_PRODUCTS];
  const r = await fetch(`${API_BASE}${PATHS.adminProducts}`, { cache: "no-store" });
  if (!r.ok) throw new Error("관리자 상품 조회 실패");
  return await unwrapJson<Product[]>(r);
}

export async function adminCreateProduct(payload: AdminCreatePayload): Promise<Product> {
  if (isDummy()) {
    const id = `p_${Date.now()}`;
    const np: Product = {
      id,
      name: payload.productname,
      price: payload.productPrice,
      origin: payload.origin,
      stock: payload.stock,
      imageUrl: payload.imgUrl,
      active: payload.active ?? true,
    };
    DUMMY_PRODUCTS.unshift(np);
    return np;
  }
  const r = await fetch(`${API_BASE}${PATHS.adminProducts}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: j(payload), // 서버가 그대로 받도록 (productname/productPrice/origin/stock/imgUrl)
  });
  if (!r.ok) throw new Error("상품 등록 실패");
  return await unwrapJson<Product>(r);
}

export async function adminUpdateProduct(p: Product): Promise<boolean> {
  if (isDummy()) {
    const i = DUMMY_PRODUCTS.findIndex(x => x.id === p.id);
    if (i >= 0) DUMMY_PRODUCTS[i] = { ...p };
    return true;
  }
  const r = await fetch(`${API_BASE}${PATHS.adminProductOne(p.id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: j(p),
  });
  return r.ok;
}

export async function adminDeleteProduct(id: string): Promise<boolean> {
  if (isDummy()) {
    DUMMY_PRODUCTS = DUMMY_PRODUCTS.filter(x => x.id !== id);
    return true;
  }
  const r = await fetch(`${API_BASE}${PATHS.adminProductOne(id)}`, {
    method: "DELETE",
  });
  return r.ok;
}
